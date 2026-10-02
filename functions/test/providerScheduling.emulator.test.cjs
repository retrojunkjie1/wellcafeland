const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-scheduling";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const scheduling = require("../src/providerScheduling");
const listMyAppointmentRequests = scheduling.listMyAppointmentRequests.run;
const requestProviderAppointment = scheduling.requestProviderAppointment.run;
const listProviderAppointmentRequests = scheduling.listProviderAppointmentRequests.run;
const respondToProviderAppointmentRequest = scheduling.respondToProviderAppointmentRequest.run;
const listMyUpcomingAppointments = scheduling.listMyUpcomingAppointments.run;
const respondToMyAppointment = scheduling.respondToMyAppointment.run;
const listProviderAppointments = scheduling.listProviderAppointments.run;
const requestAppointmentChange = scheduling.requestAppointmentChange.run;
const updateProviderAppointment = scheduling.updateProviderAppointment.run;

const clientId = "schedule-client";
const providerId = "schedule-provider";
const assignmentId = `${clientId}-${providerId}`;

function clientRequest(data = {}, uid = clientId) {
  return { auth: { uid, token: { email_verified: true, firebase: { sign_in_provider: "password" } } }, data };
}

function providerRequest(data = {}, uid = providerId) {
  return { auth: { uid, token: { email_verified: true, role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

function futureStart(hoursAhead = 48) {
  const date = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
  date.setUTCHours(12, 0, 0, 0);
  if (date.getTime() < Date.now() + 60 * 60 * 1000) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

async function clean() {
  for (const name of ["clientProviderAssignments", "provider_availability", "realHelpProviders", "appointment_requests", "appointments", "users", "support_activity_events"]) {
    const snapshot = await db.collection(name).get();
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

async function seed() {
  const days = Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: true, start: "00:00", end: "23:59" }));
  await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).set({ clientId, providerId, status: "active" }),
    db.collection("provider_availability").doc(providerId).set({ providerId, timezone: "UTC", weeklyHours: days }),
    db.collection("realHelpProviders").doc(providerId).set({ name: "Jordan Lee" }),
  ]);
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});
beforeEach(async () => { await clean(); await seed(); });
after(async () => { await clean(); await admin.app().delete(); });

test("client request, practitioner acceptance, and client confirmation stay in sync", async () => {
  const startAt = futureStart();
  const endAt = new Date(startAt.getTime() + 45 * 60_000);
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: endAt }));
  assert.equal(submitted.status, "pending");
  assert.equal((await listMyAppointmentRequests(clientRequest())).requests[0].status, "pending");

  const [pending] = (await listProviderAppointmentRequests(providerRequest())).requests;
  assert.equal(pending.id, submitted.requestId);
  assert.equal(pending.clientId, clientId);
  await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept", sessionFormat: "video", meetingLink: "https://meet.example.org/private-room" }));

  const clientActivity = await db.collection("support_activity_events").where("uid", "==", clientId).get();
  const providerActivity = await db.collection("support_activity_events").where("uid", "==", providerId).get();
  assert.deepEqual(clientActivity.docs.map((doc) => doc.get("eventCode")).sort(), ["session_request_accepted", "session_request_sent"]);
  assert.deepEqual(providerActivity.docs.map((doc) => doc.get("eventCode")).sort(), ["session_request_accepted", "session_request_received"]);
  assert.ok(clientActivity.docs.every((doc) => doc.get("source") === "server"));
  assert.ok(providerActivity.docs.every((doc) => doc.get("source") === "server"));
  assert.ok(clientActivity.docs.every((doc) => !doc.data().meetingLink && !doc.data().note));

  const [accepted] = (await listMyAppointmentRequests(clientRequest())).requests;
  assert.equal(accepted.status, "accepted");
  assert.equal(accepted.practitionerName, "Jordan Lee");
  const [scheduled] = (await listMyUpcomingAppointments(clientRequest())).appointments;
  assert.equal(scheduled.status, "scheduled");
  assert.equal(scheduled.sessionFormat, "video");
  assert.equal(scheduled.meetingLink, "https://meet.example.org/private-room");
  assert.equal((await listProviderAppointmentRequests(providerRequest())).requests.length, 0);

  await respondToMyAppointment(clientRequest({ appointmentId: scheduled.id }));
  assert.equal((await listMyUpcomingAppointments(clientRequest())).appointments[0].status, "confirmed");
  assert.equal((await listProviderAppointments(providerRequest({ from: new Date(), to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }))).appointments[0].status, "confirmed");
});

test("retrying a completed practitioner response is idempotent", async () => {
  const startAt = futureStart();
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: new Date(startAt.getTime() + 45 * 60_000) }));
  const first = await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept" }));
  const retry = await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept" }));

  assert.equal(first.status, "accepted");
  assert.equal(retry.status, "accepted");
  assert.equal(retry.appointmentId, first.appointmentId);
  assert.equal((await db.collection("appointments").where("providerId", "==", providerId).get()).size, 1);
  await assert.rejects(
    respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "decline" })),
    (error) => error.code === "failed-precondition",
  );
});

test("retrying a completed decline returns the original outcome", async () => {
  const otherClientId = "schedule-decline-client";
  await db.collection("clientProviderAssignments").doc(`${otherClientId}-${providerId}`).set({ clientId: otherClientId, providerId, status: "active" });
  const startAt = futureStart();
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: new Date(startAt.getTime() + 45 * 60_000) }, otherClientId));
  const first = await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "decline" }));
  const retry = await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "decline" }));

  assert.equal(first.status, "declined");
  assert.equal(retry.status, "declined");
  assert.deepEqual((await listMyUpcomingAppointments(clientRequest({}, otherClientId))).appointments, []);
  await assert.rejects(
    respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept" })),
    (error) => error.code === "failed-precondition",
  );
});

test("video appointment links must use HTTPS without embedded credentials", async () => {
  const startAt = futureStart();
  const appointmentRef = db.collection("appointments").doc("invalid-video-link");
  await appointmentRef.set({
    clientId, providerId,
    startAt: admin.firestore.Timestamp.fromDate(startAt),
    endAt: admin.firestore.Timestamp.fromDate(new Date(startAt.getTime() + 45 * 60_000)),
    status: "scheduled",
  });

  await assert.rejects(
    updateProviderAppointment(providerRequest({ appointmentId: appointmentRef.id, sessionFormat: "video", meetingLink: "http://meet.example.org/room" })),
    (error) => error.code === "invalid-argument",
  );
  await assert.rejects(
    updateProviderAppointment(providerRequest({ appointmentId: appointmentRef.id, sessionFormat: "video", meetingLink: "https://user:secret@meet.example.org/room" })),
    (error) => error.code === "invalid-argument",
  );
  assert.equal((await appointmentRef.get()).get("meetingLink"), undefined);
});

test("a WellnessCafe room can be selected only when the native video release is enabled", async () => {
  const startAt = futureStart();
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: new Date(startAt.getTime() + 45 * 60_000) }));
  await assert.rejects(
    respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept", sessionFormat: "wellnesscafe-video" })),
    (error) => error.code === "failed-precondition",
  );

  process.env.WELLNESSCAFE_VIDEO_ENABLED = "true";
  try {
    await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept", sessionFormat: "wellnesscafe-video" }));
    const [scheduled] = (await listMyUpcomingAppointments(clientRequest())).appointments;
    assert.equal(scheduled.sessionFormat, "wellnesscafe-video");
    assert.equal(scheduled.meetingLink, "");
    await respondToMyAppointment(clientRequest({ appointmentId: scheduled.id }));
    assert.equal((await listProviderAppointments(providerRequest({ from: new Date(), to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }))).appointments[0].status, "confirmed");
  } finally {
    delete process.env.WELLNESSCAFE_VIDEO_ENABLED;
  }
});

test("only the assigned practitioner can respond to a session request", async () => {
  const startAt = futureStart();
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: new Date(startAt.getTime() + 45 * 60_000) }));
  await assert.rejects(
    respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "accept" }, "other-provider")),
    (error) => error.code === "not-found",
  );
  assert.equal((await listMyAppointmentRequests(clientRequest())).requests[0].status, "pending");
});

test("declining a request gives the client a clear outcome without creating an appointment", async () => {
  const startAt = futureStart();
  const submitted = await requestProviderAppointment(clientRequest({ providerId, requestedStartAt: startAt, requestedEndAt: new Date(startAt.getTime() + 45 * 60_000) }));
  await respondToProviderAppointmentRequest(providerRequest({ requestId: submitted.requestId, decision: "decline" }));
  const [declined] = (await listMyAppointmentRequests(clientRequest())).requests;
  assert.equal(declined.status, "declined");
  assert.match(declined.responseMessage, /can’t meet at the requested time/i);
  assert.deepEqual((await listMyUpcomingAppointments(clientRequest())).appointments, []);
});

test("a client who requested a time change must reconfirm a newly offered time", async () => {
  const oldStart = futureStart();
  const appointmentRef = db.collection("appointments").doc("reschedule-confirmed");
  await appointmentRef.set({
    clientId, providerId,
    startAt: admin.firestore.Timestamp.fromDate(oldStart),
    endAt: admin.firestore.Timestamp.fromDate(new Date(oldStart.getTime() + 45 * 60_000)),
    status: "confirmed",
    note: "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await requestAppointmentChange(clientRequest({ appointmentId: appointmentRef.id, message: "Could we meet later?" }));
  const newStart = new Date(oldStart.getTime() + 2 * 60 * 60 * 1000);
  await updateProviderAppointment(providerRequest({ appointmentId: appointmentRef.id, startAt: newStart, endAt: new Date(newStart.getTime() + 45 * 60_000) }));

  const [clientView] = (await listMyUpcomingAppointments(clientRequest())).appointments;
  const [providerView] = (await listProviderAppointments(providerRequest({ from: new Date(), to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) }))).appointments;
  assert.equal(clientView.status, "scheduled");
  assert.equal(providerView.status, "scheduled");
  assert.equal(clientView.changeRequest.status, "accepted");
  await respondToMyAppointment(clientRequest({ appointmentId: appointmentRef.id }));
  assert.equal((await listMyUpcomingAppointments(clientRequest())).appointments[0].status, "confirmed");
});
