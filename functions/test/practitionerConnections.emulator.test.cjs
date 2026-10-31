const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-practitioner-connections";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("../src/firebaseAdminCompat.cjs");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const connections = require("../src/practitionerConnections");
const endMyPractitionerConnection = connections.endMyPractitionerConnection.run;

const suffix = `${process.pid}-${Date.now()}`;
const clientId = `connection-client-${suffix}`;
const practitionerId = `connection-practitioner-${suffix}`;
const assignmentId = `connection-assignment-${suffix}`;
const pastAppointmentId = `connection-past-${suffix}`;
const futureAppointmentId = `connection-future-${suffix}`;
const shareId = `${clientId}_${practitionerId}`;

function clientRequest(data = {}) {
  return {
    auth: { uid: clientId, token: { email_verified: true, firebase: { sign_in_provider: "password" } } },
    data,
  };
}

async function cleanup() {
  await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).delete().catch(() => {}),
    db.collection("client_practitioner_shares").doc(shareId).delete().catch(() => {}),
    db.collection("appointments").doc(pastAppointmentId).delete().catch(() => {}),
    db.collection("appointments").doc(futureAppointmentId).delete().catch(() => {}),
  ]);
  for (const [collection, field, value] of [
    ["practitioner_data_access_audit", "actorUid", clientId],
    ["support_activity_events", "uid", clientId],
    ["support_activity_events", "uid", practitionerId],
  ]) {
    const snapshot = await db.collection(collection).where(field, "==", value).get();
    if (snapshot.empty) continue;
    const batch = db.batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await cleanup();
  const now = admin.firestore.Timestamp.now();
  await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).set({
      clientId,
      providerId: practitionerId,
      status: "active",
    }),
    db.collection("client_practitioner_shares").doc(shareId).set({
      clientId,
      practitionerId,
      assignmentId,
      scopes: { recoveryProgress: true, wellnessPatterns: true, writtenReflections: false, assessments: false },
    }),
    db.collection("appointments").doc(pastAppointmentId).set({
      clientId,
      providerId: practitionerId,
      startAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 60 * 60 * 1000)),
      endAt: now,
      status: "confirmed",
    }),
    db.collection("appointments").doc(futureAppointmentId).set({
      clientId,
      providerId: practitionerId,
      startAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      endAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 25 * 60 * 60 * 1000)),
      status: "confirmed",
    }),
  ]);
});

after(async () => {
  await cleanup();
  await admin.app().delete();
});

test("ending a practitioner connection commits revocation, future-session cleanup, and the correct audit identity", async () => {
  const result = await endMyPractitionerConnection(clientRequest({ practitionerId }));
  assert.deepEqual(result, { ok: true, alreadyEnded: false, cancelledSessions: 1 });

  const [assignment, share, pastAppointment, futureAppointment, audit] = await Promise.all([
    db.collection("clientProviderAssignments").doc(assignmentId).get(),
    db.collection("client_practitioner_shares").doc(shareId).get(),
    db.collection("appointments").doc(pastAppointmentId).get(),
    db.collection("appointments").doc(futureAppointmentId).get(),
    db.collection("practitioner_data_access_audit").where("actorUid", "==", clientId).get(),
  ]);

  assert.equal(assignment.get("status"), "ended");
  assert.equal(assignment.get("endedBy"), clientId);
  assert.deepEqual(share.get("scopes"), {
    recoveryProgress: false,
    wellnessPatterns: false,
    writtenReflections: false,
    assessments: false,
  });
  assert.equal(share.get("assignmentId"), assignmentId);
  assert.equal(pastAppointment.get("status"), "confirmed", "ending a connection must preserve past appointment history");
  assert.equal(futureAppointment.get("status"), "cancelled");
  assert.equal(futureAppointment.get("cancelReason"), "connection-ended-by-client");
  assert.equal(futureAppointment.get("cancelledBy"), clientId);

  const endedEvent = audit.docs.find((document) => document.get("action") === "practitioner_connection.ended");
  assert.ok(endedEvent, "the transaction should commit an audit event with the cleanup");
  assert.equal(endedEvent.get("actorUid"), clientId);
  assert.equal(endedEvent.get("clientUid"), clientId);
  assert.equal(endedEvent.get("practitionerUid"), practitionerId);
  assert.deepEqual(endedEvent.get("scopeChanges"), [
    { scope: "recoveryProgress", enabled: false },
    { scope: "wellnessPatterns", enabled: false },
  ]);

  const repeated = await endMyPractitionerConnection(clientRequest({ practitionerId }));
  assert.deepEqual(repeated, { ok: true, alreadyEnded: true, cancelledSessions: 0 });
});
