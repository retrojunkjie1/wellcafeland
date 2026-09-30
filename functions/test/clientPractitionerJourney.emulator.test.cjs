const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-cross-role-journey";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();

const connections = require("../src/practitionerConnections");
const care = require("../src/practitionerCare");
const messaging = require("../src/practitionerMessaging");
const scheduling = require("../src/providerScheduling");

const clientId = "journey-client";
const providerId = "journey-practitioner";

const requestConnection = connections.requestPractitionerConnection.run;
const listProviderRequests = connections.listPractitionerConnectionRequests.run;
const respondToConnection = connections.respondToPractitionerConnection.run;
const listClientRequests = connections.listMyPractitionerConnectionRequests.run;
const setShare = care.setPractitionerShare.run;
const providerOverview = care.getProviderClientOverview.run;
const sendPractice = care.sendPractitionerSupportTool.run;
const listClientPracticeInbox = care.listMyPractitionerSupport.run;
const markPractice = care.markPractitionerSupportSeen.run;
const submitPracticeProgress = care.submitPractitionerPracticeProgress.run;
const sendClientMessage = messaging.sendClientMessage.run;
const sendProviderMessage = messaging.sendProviderMessage.run;
const listClientMessages = messaging.listMyPractitionerMessages.run;
const listProviderMessages = messaging.listProviderConversationMessages.run;
const requestAppointment = scheduling.requestProviderAppointment.run;
const listProviderAppointmentsRequests = scheduling.listProviderAppointmentRequests.run;
const respondToAppointment = scheduling.respondToProviderAppointmentRequest.run;
const listClientAppointments = scheduling.listMyUpcomingAppointments.run;
const confirmClientAppointment = scheduling.respondToMyAppointment.run;

function clientRequest(data = {}) {
  return { auth: { uid: clientId, token: { firebase: { sign_in_provider: "password" } } }, data };
}

function providerRequest(data = {}) {
  return { auth: { uid: providerId, token: { role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

function futureStart() {
  const date = new Date(Date.now() + 48 * 60 * 60 * 1000);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

async function deleteCollection(name) {
  const snapshot = await db.collection(name).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function clean() {
  const conversations = await db.collection("conversations").get();
  for (const conversation of conversations.docs) {
    const messages = await conversation.ref.collection("messages").get();
    if (!messages.empty) {
      const batch = db.batch();
      messages.docs.forEach((message) => batch.delete(message.ref));
      await batch.commit();
    }
    await conversation.ref.delete();
  }
  for (const name of [
    "clientProviderAssignments", "practitioner_connection_requests", "client_practitioner_shares",
    "checkins", "client_practitioner_support", "client_practitioner_practice_updates",
    "provider_availability", "appointment_requests", "appointments", "realHelpProviders", "users", "support_activity_events",
  ]) await deleteCollection(name);
}

async function seedDirectoryAndAvailability() {
  const weeklyHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek, enabled: true, start: "00:00", end: "23:59",
  }));
  await Promise.all([
    db.collection("users").doc(clientId).set({ uid: clientId, displayName: "Journey Client", role: "client" }),
    db.collection("realHelpProviders").doc(providerId).set({
      name: "Jordan Lee", type: "recovery-coach", acceptsReferrals: true, verification: { status: "verified" },
    }),
    db.collection("provider_availability").doc(providerId).set({ providerId, timezone: "UTC", weeklyHours }),
    db.collection("checkins").doc("journey-checkin").set({
      userId: clientId, completed: true, date: "2026-09-28",
      timestamp: admin.firestore.Timestamp.fromDate(new Date("2026-09-28T12:00:00.000Z")),
      daysSinceLastUse: 14, cravingStatus: "no", cravingIntensity: 0,
      triggerStatus: "yes", triggerIntensity: 3, mood: "steady", gratitude: "private reflection",
    }),
  ]);
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
  await seedDirectoryAndAvailability();
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("client-to-practitioner journey connects, shares by choice, messages, receives support, and schedules", async () => {
  const requestedConnection = await requestConnection(clientRequest({
    practitionerId: providerId,
    introduction: "I would like support building a steady routine.",
  }));
  assert.equal(requestedConnection.status, "pending");

  const [incoming] = (await listProviderRequests(providerRequest())).requests;
  assert.equal(incoming.requesterUid, clientId);
  assert.equal(incoming.introduction, "I would like support building a steady routine.");
  await respondToConnection(providerRequest({ requestId: requestedConnection.requestId, decision: "accept" }));
  assert.equal((await listClientRequests(clientRequest())).requests[0].status, "accepted");

  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true } }));
  const overview = await providerOverview(providerRequest({ clientId }));
  assert.equal(overview.shared, true);
  assert.equal(overview.checkins.length, 1);
  assert.equal(overview.checkins[0].daysSinceLastUse, 14);
  assert.equal("gratitude" in overview.checkins[0], false);

  await sendProviderMessage(providerRequest({ clientId, content: "What kind of support would feel useful this week?" }));
  await sendClientMessage(clientRequest({ practitionerId: providerId, content: "A short grounding practice would help." }));
  assert.equal((await listClientMessages(clientRequest({ practitionerId: providerId }))).messages.length, 2);
  assert.equal((await listProviderMessages(providerRequest({ clientId }))).messages.length, 2);

  await sendPractice(providerRequest({ clientId, toolId: "grounding", message: "Try this only if it feels useful.", followUpDays: 7 }));
  const [invitation] = (await listClientPracticeInbox(clientRequest())).items;
  assert.equal(invitation.toolId, "grounding");
  await markPractice(clientRequest({ supportId: invitation.id, action: "added" }));
  const progress = await submitPracticeProgress(clientRequest({ supportId: invitation.id, outcome: "tried", note: "Used it before bed." }));
  assert.ok(progress.updateId);
  assert.equal((await providerOverview(providerRequest({ clientId }))).practiceProgress[0].outcome, "tried");

  const startAt = futureStart();
  const appointmentRequest = await requestAppointment(clientRequest({
    providerId,
    requestedStartAt: startAt,
    requestedEndAt: new Date(startAt.getTime() + 45 * 60_000),
    note: "Video is preferred if available.",
  }));
  const [pendingAppointment] = (await listProviderAppointmentsRequests(providerRequest())).requests;
  assert.equal(pendingAppointment.id, appointmentRequest.requestId);
  await respondToAppointment(providerRequest({ requestId: appointmentRequest.requestId, decision: "accept", sessionFormat: "in-person" }));
  const [scheduled] = (await listClientAppointments(clientRequest())).appointments;
  assert.equal(scheduled.status, "scheduled");
  await confirmClientAppointment(clientRequest({ appointmentId: scheduled.id }));
  assert.equal((await listClientAppointments(clientRequest())).appointments[0].status, "confirmed");

  const assignments = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", providerId)
    .where("status", "==", "active")
    .get();
  assert.equal(assignments.size, 1);

  const clientActivity = await db.collection("support_activity_events").where("uid", "==", clientId).get();
  const providerActivity = await db.collection("support_activity_events").where("uid", "==", providerId).get();
  const clientOutcomes = clientActivity.docs.map((doc) => doc.get("eventCode"));
  const providerOutcomes = providerActivity.docs.map((doc) => doc.get("eventCode"));
  assert.ok(clientOutcomes.includes("connection_request_sent"));
  assert.ok(clientOutcomes.includes("connection_request_accepted"));
  assert.ok(clientOutcomes.includes("session_request_sent"));
  assert.ok(clientOutcomes.includes("message_sent"));
  assert.ok(clientOutcomes.includes("message_received"));
  assert.ok(providerOutcomes.includes("connection_request_received"));
  assert.ok(providerOutcomes.includes("session_request_received"), `Missing practitioner session receipt; events: ${providerOutcomes.join(", ")}`);
  assert.ok(providerOutcomes.includes("message_sent"));
  assert.ok(providerOutcomes.includes("message_received"));
  assert.ok(clientActivity.docs.every((doc) => doc.get("source") === "server"));
  assert.ok(providerActivity.docs.every((doc) => doc.get("source") === "server"));
  assert.ok(clientActivity.docs.every((doc) => !doc.data().content && !doc.data().introduction && !doc.data().meetingLink));
  assert.ok(providerActivity.docs.every((doc) => !doc.data().content && !doc.data().introduction && !doc.data().meetingLink));

  await assignments.docs[0].ref.update({ status: "ended" });
  await assert.rejects(listClientMessages(clientRequest({ practitionerId: providerId })), (error) => error.code === "permission-denied");
  await assert.rejects(providerOverview(providerRequest({ clientId })), (error) => error.code === "permission-denied");
});
