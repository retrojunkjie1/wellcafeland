const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-video-sessions";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });
process.env.LIVEKIT_URL = "wss://video.test.invalid";
// These fake credentials exercise token signing only; no production secret is read.
process.env.LIVEKIT_API_KEY = "test-livekit-key";
process.env.LIVEKIT_API_SECRET = "test-livekit-secret-not-for-production";

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const issueAppointmentVideoToken = require("../src/videoSessions").createAppointmentVideoToken.run;
const scheduling = require("../src/providerScheduling");
const requestProviderAppointment = scheduling.requestProviderAppointment.run;
const respondToProviderAppointmentRequest = scheduling.respondToProviderAppointmentRequest.run;
const respondToMyAppointment = scheduling.respondToMyAppointment.run;

const suffix = `${process.pid}-${Date.now()}`;
const clientId = `video-client-${suffix}`;
const providerId = `video-provider-${suffix}`;
const appointmentId = `video-appointment-${suffix}`;
const assignmentId = `video-assignment-${suffix}`;
const scheduledAppointmentIds = new Set();
const requestIds = new Set();

function signedInRequest(uid, appointment = appointmentId) {
  return {
    auth: { uid, token: { email_verified: true, firebase: { sign_in_provider: "password" } } },
    data: { appointmentId: appointment },
  };
}

function clientSchedulingRequest(data = {}) {
  return { auth: { uid: clientId, token: { email_verified: true, firebase: { sign_in_provider: "password" } } }, data };
}

function practitionerSchedulingRequest(data = {}) {
  return { auth: { uid: providerId, token: { email_verified: true, role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

async function seedAppointment({ connected = true, status = "confirmed" } = {}) {
  const now = Date.now();
  await db.collection("appointments").doc(appointmentId).set({
    clientId,
    providerId,
    status,
    sessionFormat: "wellnesscafe-video",
    startAt: admin.firestore.Timestamp.fromMillis(now - 60_000),
    endAt: admin.firestore.Timestamp.fromMillis(now + 30 * 60_000),
  });
  if (connected) {
    await db.collection("clientProviderAssignments").doc(assignmentId).set({
      clientId,
      providerId,
      status: "active",
    });
  }
}

async function cleanup() {
  const deletes = [
    db.collection("appointments").doc(appointmentId).delete(),
    db.collection("clientProviderAssignments").doc(assignmentId).delete(),
    db.collection("provider_availability").doc(providerId).delete(),
    db.collection("realHelpProviders").doc(providerId).delete(),
    ...[...scheduledAppointmentIds].map((id) => db.collection("appointments").doc(id).delete()),
    ...[...requestIds].map((id) => db.collection("appointment_requests").doc(id).delete()),
  ];
  await Promise.all(deletes);
  scheduledAppointmentIds.clear();
  requestIds.clear();
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await cleanup();
});
beforeEach(cleanup);
after(async () => {
  await cleanup();
  await admin.app().delete();
});

test("confirmed appointment participants receive short-lived tokens for the same private room", async () => {
  await seedAppointment();

  const [client, practitioner] = await Promise.all([
    issueAppointmentVideoToken(signedInRequest(clientId)),
    issueAppointmentVideoToken(signedInRequest(providerId)),
  ]);

  assert.equal(client.serverUrl, process.env.LIVEKIT_URL);
  assert.equal(client.role, "client");
  assert.equal(practitioner.role, "practitioner");
  const clientClaims = JSON.parse(Buffer.from(client.participantToken.split(".")[1], "base64url").toString("utf8"));
  const practitionerClaims = JSON.parse(Buffer.from(practitioner.participantToken.split(".")[1], "base64url").toString("utf8"));
  assert.equal(clientClaims.video.room, practitionerClaims.video.room);
  assert.notEqual(clientClaims.sub, practitionerClaims.sub);
  assert.equal(clientClaims.video.canPublishData, false);
  assert.deepEqual(clientClaims.video.canPublishSources, ["camera", "microphone"]);
  assert.ok(Date.parse(client.tokenExpiresAt) > Date.now());
});

test("client request, practitioner acceptance, client confirmation, and room-token issue connect end to end", async () => {
  const weeklyHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, enabled: true, start: "00:00", end: "23:59" }));
  const startAt = new Date(Date.now() + 6 * 60_000);
  const endAt = new Date(startAt.getTime() + 45 * 60_000);
  const timezone = ["UTC", "America/Denver", "America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata", "Asia/Tokyo", "Pacific/Auckland"]
    .find((zone) => new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long" }).format(startAt)
      === new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "long" }).format(endAt));
  assert.ok(timezone, "Find a test time zone where this short session stays on one local day");
  await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).set({ clientId, providerId, status: "active" }),
    db.collection("provider_availability").doc(providerId).set({ providerId, timezone, weeklyHours }),
    db.collection("realHelpProviders").doc(providerId).set({ name: "Test practitioner" }),
  ]);

  const requested = await requestProviderAppointment(clientSchedulingRequest({ providerId, requestedStartAt: startAt, requestedEndAt: endAt }));
  requestIds.add(requested.requestId);
  assert.equal(requested.status, "pending");

  const previousVideoGate = process.env.WELLNESSCAFE_VIDEO_ENABLED;
  process.env.WELLNESSCAFE_VIDEO_ENABLED = "true";
  let accepted;
  try {
    accepted = await respondToProviderAppointmentRequest(practitionerSchedulingRequest({ requestId: requested.requestId, decision: "accept", sessionFormat: "wellnesscafe-video" }));
  } finally {
    if (previousVideoGate === undefined) delete process.env.WELLNESSCAFE_VIDEO_ENABLED;
    else process.env.WELLNESSCAFE_VIDEO_ENABLED = previousVideoGate;
  }
  scheduledAppointmentIds.add(accepted.appointmentId);
  assert.equal(accepted.status, "accepted");

  const confirmation = await respondToMyAppointment(clientSchedulingRequest({ appointmentId: accepted.appointmentId }));
  assert.equal(confirmation.status, "confirmed");
  const [client, practitioner] = await Promise.all([
    issueAppointmentVideoToken(signedInRequest(clientId, accepted.appointmentId)),
    issueAppointmentVideoToken(signedInRequest(providerId, accepted.appointmentId)),
  ]);
  const clientClaims = JSON.parse(Buffer.from(client.participantToken.split(".")[1], "base64url").toString("utf8"));
  const practitionerClaims = JSON.parse(Buffer.from(practitioner.participantToken.split(".")[1], "base64url").toString("utf8"));
  assert.equal(client.role, "client");
  assert.equal(practitioner.role, "practitioner");
  assert.equal(clientClaims.video.room, practitionerClaims.video.room);
  assert.notEqual(clientClaims.sub, practitionerClaims.sub);
});

test("rejects an unrelated signed-in account before checking the provider connection", async () => {
  await seedAppointment();

  await assert.rejects(
    issueAppointmentVideoToken(signedInRequest(`video-stranger-${suffix}`)),
    (error) => error.code === "permission-denied",
  );
});

test("rejects a participant when the client-practitioner connection is no longer active", async () => {
  await seedAppointment({ connected: false });

  await assert.rejects(
    issueAppointmentVideoToken(signedInRequest(clientId)),
    (error) => error.code === "permission-denied" && /connection.*no longer active/i.test(error.message),
  );
});

test("rejects anonymous sessions and appointments that are not confirmed", async () => {
  await seedAppointment({ status: "scheduled" });

  await assert.rejects(
    issueAppointmentVideoToken({ auth: { uid: clientId, token: { firebase: { sign_in_provider: "anonymous" } } }, data: { appointmentId } }),
    (error) => error.code === "unauthenticated",
  );
  await assert.rejects(
    issueAppointmentVideoToken(signedInRequest(clientId)),
    (error) => error.code === "failed-precondition" && /confirm/i.test(error.message),
  );
});
