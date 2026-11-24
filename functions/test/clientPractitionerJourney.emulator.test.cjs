const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-cross-role-journey";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("../src/firebaseAdminCompat.cjs");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const auth = admin.auth();

const connections = require("../src/practitionerConnections");
const care = require("../src/practitionerCare");
const messaging = require("../src/practitionerMessaging");
const scheduling = require("../src/providerScheduling");

const suffix = `${process.pid}-${Date.now()}`;
let clientId;
let providerId;
let clientAuth;
let providerAuth;
const createdUserIds = new Set();

const requestConnection = connections.requestPractitionerConnection.run;
const listProviderRequests = connections.listPractitionerConnectionRequests.run;
const respondToConnection = connections.respondToPractitionerConnection.run;
const listClientRequests = connections.listMyPractitionerConnectionRequests.run;
const endConnection = connections.endMyPractitionerConnection.run;
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
  return { auth: clientAuth, data };
}

function providerRequest(data = {}) {
  return { auth: providerAuth, data };
}

async function createVerifiedEmulatorIdentity(label, claims = {}) {
  const email = `journey-${label}-${suffix}@example.test`;
  const password = "Test-only-password-482!";
  const signup = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const created = await signup.json();
  assert.equal(signup.ok, true, `Auth Emulator should create the ${label} test identity: ${JSON.stringify(created)}`);
  createdUserIds.add(created.localId);
  await auth.updateUser(created.localId, { emailVerified: true });
  if (Object.keys(claims).length) await auth.setCustomUserClaims(created.localId, claims);

  // Refresh after setting verified status and custom claims, then verify the
  // emulator-issued token before passing its claims to the callable handler.
  const signin = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const session = await signin.json();
  assert.equal(signin.ok, true, `Auth Emulator should issue a fresh ${label} session: ${JSON.stringify(session)}`);
  const token = await auth.verifyIdToken(session.idToken);
  assert.equal(token.uid, created.localId);
  assert.equal(token.email_verified, true);
  return { uid: created.localId, token };
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
  for (const uid of createdUserIds) {
    await auth.deleteUser(uid).catch((error) => {
      if (error.code !== "auth/user-not-found") throw error;
    });
  }
  createdUserIds.clear();
}

async function seedDirectoryAndAvailability() {
  const weeklyHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek, enabled: true, start: "00:00", end: "23:59",
  }));
  await Promise.all([
    db.collection("users").doc(clientId).set({ uid: clientId, displayName: "Journey Client", role: "client" }),
    db.collection("users").doc(providerId).set({
      uid: providerId,
      role: "provider",
      providerType: "recovery-coach",
      practitionerWorkspaceActive: true,
    }),
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
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Run this suite through the Auth emulator");
  const [clientIdentity, providerIdentity] = await Promise.all([
    createVerifiedEmulatorIdentity("client"),
    createVerifiedEmulatorIdentity("practitioner", { role: "provider" }),
  ]);
  clientId = clientIdentity.uid;
  providerId = providerIdentity.uid;
  clientAuth = { uid: clientIdentity.uid, token: clientIdentity.token };
  providerAuth = { uid: providerIdentity.uid, token: providerIdentity.token };
  await seedDirectoryAndAvailability();
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("client-to-practitioner journey connects, shares by choice, messages, receives support, and schedules", async () => {
  await assert.rejects(
    providerOverview(providerRequest({ clientId })),
    (error) => {
      assert.equal(error.code, "permission-denied", `Expected isolated access denial, received ${error.code}: ${error.message}`);
      return true;
    },
    "a practitioner must not read a client's overview before an accepted connection",
  );
  await assert.rejects(
    sendClientMessage(clientRequest({ practitionerId: providerId, content: "A message before connection" })),
    (error) => error.code === "permission-denied",
    "a client must not open practitioner messaging before an accepted connection",
  );

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

  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: false } }));
  const revokedOverview = await providerOverview(providerRequest({ clientId }));
  assert.equal(revokedOverview.shared, false);
  assert.deepEqual(revokedOverview.checkins, [], "revoking consent must remove previously shared check-ins from the next practitioner read");
  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true } }));

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

  const ended = await endConnection(clientRequest({ practitionerId: providerId }));
  assert.deepEqual(ended, { ok: true, alreadyEnded: false, cancelledSessions: 1 });
  const [endedAssignment, endedShare, endedAppointment] = await Promise.all([
    assignments.docs[0].ref.get(),
    db.collection("client_practitioner_shares").doc(`${clientId}_${providerId}`).get(),
    db.collection("appointments").doc(scheduled.id).get(),
  ]);
  assert.equal(endedAssignment.get("status"), "ended");
  assert.deepEqual(endedShare.get("scopes"), {
    recoveryProgress: false,
    wellnessPatterns: false,
    writtenReflections: false,
    assessments: false,
    careCoordination: false,
    visitPreparation: false,
  });
  assert.equal(endedAppointment.get("status"), "cancelled");
  assert.equal(endedAppointment.get("cancelReason"), "connection-ended-by-client");
  await assert.rejects(
    setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true } })),
    (error) => error.code === "permission-denied",
    "sharing cannot be restored after the connection ends",
  );
  await assert.rejects(listClientMessages(clientRequest({ practitionerId: providerId })), (error) => error.code === "permission-denied");
  await assert.rejects(sendClientMessage(clientRequest({ practitionerId: providerId, content: "A message after connection ended" })), (error) => error.code === "permission-denied");
  await assert.rejects(sendProviderMessage(providerRequest({ clientId, content: "A message after connection ended" })), (error) => error.code === "permission-denied");
  await assert.rejects(providerOverview(providerRequest({ clientId })), (error) => error.code === "permission-denied");
  const repeatedEnd = await endConnection(clientRequest({ practitionerId: providerId }));
  assert.deepEqual(repeatedEnd, { ok: true, alreadyEnded: true, cancelledSessions: 0 });

  const reconnectedRequest = await requestConnection(clientRequest({
    practitionerId: providerId,
    introduction: "I would like to reconnect and choose my sharing settings again.",
  }));
  assert.equal(reconnectedRequest.status, "pending");
  await respondToConnection(providerRequest({ requestId: reconnectedRequest.requestId, decision: "accept" }));
  const [activeAssignment] = (await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", providerId)
    .where("status", "==", "active")
    .get()).docs;
  const reconnectedShare = await db.collection("client_practitioner_shares").doc(`${clientId}_${providerId}`).get();
  assert.ok(activeAssignment);
  assert.notEqual(activeAssignment.id, endedAssignment.id);
  assert.equal(reconnectedShare.get("assignmentId"), activeAssignment.id);
  assert.deepEqual(reconnectedShare.get("scopes"), {
    recoveryProgress: false,
    wellnessPatterns: false,
    writtenReflections: false,
    assessments: false,
    careCoordination: false,
    visitPreparation: false,
  });
  const privateAfterReconnect = await providerOverview(providerRequest({ clientId }));
  assert.equal(privateAfterReconnect.shared, false);
  assert.deepEqual(privateAfterReconnect.checkins, []);
  await setShare(clientRequest({ practitionerId: providerId, scopes: { recoveryProgress: true } }));
  const sharedAfterReconnect = await providerOverview(providerRequest({ clientId }));
  assert.equal(sharedAfterReconnect.shared, true);
  assert.equal(sharedAfterReconnect.checkins.length, 1);
});
