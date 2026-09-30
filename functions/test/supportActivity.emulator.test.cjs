const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-support-activity";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const activity = require("../src/supportActivity");
const record = activity.recordSupportActivity.run;
const listForAdmin = activity.listSupportActivityForAdmin.run;
const recordTrusted = activity.recordTrustedSupportActivity;
const targetUid = "support-client-001";
const otherUid = "support-client-002";

function userRequest(uid = targetUid, data = {}) {
  return { auth: { uid, token: { firebase: { sign_in_provider: "password" } } }, data };
}

function adminRequest(data = {}, token = { godAdmin: true }) {
  return { auth: { uid: "support-admin", token }, data };
}

async function clean() {
  const snapshot = await db.collection("support_activity_events").get();
  if (!snapshot.empty) {
    const batch = db.batch();
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});

beforeEach(clean);

after(async () => {
  await clean();
  await admin.app().delete();
});

test("signed-in client can create only a minimal allowlisted support event", async () => {
  await assert.rejects(record({ data: { feature: "guide", eventCode: "runtime_error" } }), (error) => error.code === "unauthenticated");
  await assert.rejects(record(userRequest(targetUid, { feature: "private-checkins", eventCode: "page_opened" })), (error) => error.code === "invalid-argument");

  const result = await record(userRequest(targetUid, {
    feature: "assistance",
    eventCode: "action_failed",
    errorCode: "functions/unavailable",
    email: "private@example.test",
    exactSearch: "shelter at 1 Example Street",
    message: "private recovery note",
  }));
  assert.deepEqual(result, { recorded: true });

  const snapshot = await db.collection("support_activity_events").where("uid", "==", targetUid).get();
  assert.equal(snapshot.size, 1);
  const stored = snapshot.docs[0].data();
  assert.deepEqual(Object.keys(stored).sort(), ["createdAt", "errorCode", "eventCode", "expiresAt", "feature", "source", "uid", "workspace"].sort());
  assert.equal(stored.email, undefined);
  assert.equal(stored.exactSearch, undefined);
  assert.equal(stored.message, undefined);
  assert.equal(stored.workspace, "");
  assert.equal(stored.errorCode, "functions/unavailable");
  assert.equal(stored.source, "reported");
  assert.ok(stored.expiresAt.toMillis() > stored.createdAt.toMillis());
});

test("workspace trail stores only an allowlisted workspace code", async () => {
  await assert.rejects(record(userRequest(targetUid, { feature: "check_in", eventCode: "workspace_changed", workspace: "practitioner" })), (error) => error.code === "invalid-argument");
  await assert.rejects(record(userRequest(targetUid, { feature: "account", eventCode: "workspace_changed", workspace: "private role text" })), (error) => error.code === "invalid-argument");
  await record(userRequest(targetUid, { feature: "account", eventCode: "workspace_changed", workspace: "practitioner" }));

  const result = await listForAdmin(adminRequest({ uid: targetUid }));
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].eventCode, "workspace_changed");
  assert.equal(result.events[0].workspace, "practitioner");
});

test("specific support outcomes cannot be mislabeled as another feature", async () => {
  await assert.rejects(record(userRequest(targetUid, { feature: "guide", eventCode: "check_in_saved" })), (error) => error.code === "invalid-argument");
  await assert.rejects(record(userRequest(targetUid, { feature: "sessions", eventCode: "message_sent", workspace: "practitioner" })), (error) => error.code === "invalid-argument");
  await assert.rejects(record(userRequest(targetUid, { feature: "sessions", eventCode: "message_sent" })), (error) => error.code === "invalid-argument");
  await assert.rejects(record(userRequest(targetUid, { feature: "providers", eventCode: "connection_request_accepted" })), (error) => error.code === "invalid-argument");
});

test("trusted service outcomes are server-marked and mirrored without private payloads", async () => {
  await recordTrusted([
    { uid: targetUid, feature: "providers", eventCode: "connection_request_accepted", introduction: "private details" },
    { uid: otherUid, feature: "providers", eventCode: "connection_request_accepted", practitionerId: "private-id" },
  ]);
  const client = await listForAdmin(adminRequest({ uid: targetUid }));
  const practitioner = await listForAdmin(adminRequest({ uid: otherUid }));
  assert.equal(client.events[0].source, "server");
  assert.equal(client.events[0].eventCode, "connection_request_accepted");
  assert.equal(practitioner.events[0].source, "server");
  assert.equal(practitioner.events[0].eventCode, "connection_request_accepted");
  assert.equal("introduction" in client.events[0], false);
  assert.equal("practitionerId" in practitioner.events[0], false);
});

test("session and message outcomes are safe account-scoped records", async () => {
  await record(userRequest(targetUid, {
    feature: "sessions",
    eventCode: "message_send_failed",
    errorCode: "functions/resource-exhausted",
    content: "private message text must not persist",
    exactAppointmentTime: "2026-09-29T13:15:00Z",
  }));

  const result = await listForAdmin(adminRequest({ uid: targetUid }));
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].feature, "sessions");
  assert.equal(result.events[0].eventCode, "message_send_failed");
  assert.equal(result.events[0].errorCode, "functions/resource-exhausted");
  assert.equal("content" in result.events[0], false);
  assert.equal("exactAppointmentTime" in result.events[0], false);
});

test("practitioner connection outcomes use a safe provider-directory projection", async () => {
  await assert.rejects(record(userRequest(targetUid, { feature: "sessions", eventCode: "connection_request_sent" })), (error) => error.code === "invalid-argument");
  await record(userRequest(targetUid, {
    feature: "providers",
    eventCode: "connection_response_failed",
    errorCode: "functions/unavailable",
    introduction: "private recovery story must not persist",
    practitionerId: "provider-private-id",
  }));

  const result = await listForAdmin(adminRequest({ uid: targetUid }));
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].feature, "providers");
  assert.equal(result.events[0].eventCode, "connection_response_failed");
  assert.equal(result.events[0].errorCode, "functions/unavailable");
  assert.equal("introduction" in result.events[0], false);
  assert.equal("practitionerId" in result.events[0], false);
});

test("only admins can read one account's recent safe activity projection", async () => {
  const now = Date.now();
  await db.collection("support_activity_events").add({ uid: targetUid, feature: "practice", eventCode: "page_opened", errorCode: "", workspace: "", createdAt: admin.firestore.Timestamp.fromMillis(now), expiresAt: admin.firestore.Timestamp.fromMillis(now + 1000) });
  await db.collection("support_activity_events").add({ uid: targetUid, feature: "guide", eventCode: "runtime_error", errorCode: "functions/internal", workspace: "", stack: "private stack", createdAt: admin.firestore.Timestamp.fromMillis(now - 31 * 86400000), expiresAt: admin.firestore.Timestamp.fromMillis(now - 1000) });
  await db.collection("support_activity_events").add({ uid: otherUid, feature: "home", eventCode: "page_opened", errorCode: "", workspace: "", createdAt: admin.firestore.Timestamp.fromMillis(now), expiresAt: admin.firestore.Timestamp.fromMillis(now + 1000) });

  await assert.rejects(listForAdmin({ data: { uid: targetUid } }), (error) => error.code === "unauthenticated");
  await assert.rejects(listForAdmin(adminRequest({ uid: targetUid }, { role: "client" })), (error) => error.code === "permission-denied");
  await assert.rejects(listForAdmin(adminRequest({ uid: "bad uid" })), (error) => error.code === "invalid-argument");

  const result = await listForAdmin(adminRequest({ uid: targetUid }));
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].feature, "practice");
  assert.equal(result.events[0].eventCode, "page_opened");
  assert.equal(result.events[0].source, "");
  assert.equal("uid" in result.events[0], false);
  assert.equal("stack" in result.events[0], false);
  assert.equal("expiresAt" in result.events[0], false);
});
