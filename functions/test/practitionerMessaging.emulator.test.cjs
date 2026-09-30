const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-practitioner-messaging";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const messaging = require("../src/practitionerMessaging");
const { signalId } = require("../src/securitySignals");
const listProviderMessages = messaging.listProviderConversationMessages.run;
const sendProviderMessage = messaging.sendProviderMessage.run;
const listClientMessages = messaging.listMyPractitionerMessages.run;
const sendClientMessage = messaging.sendClientMessage.run;

const clientId = "message-client";
const providerId = "message-provider";
const otherClientId = "message-other-client";
const assignmentId = `${clientId}-${providerId}`;

function clientRequest(data = {}, uid = clientId) {
  return { auth: { uid, token: { firebase: { sign_in_provider: "password" } } }, data };
}

function providerRequest(data = {}, uid = providerId) {
  return { auth: { uid, token: { role: "provider", firebase: { sign_in_provider: "password" } } }, data };
}

async function clean() {
  const assignments = await db.collection("clientProviderAssignments").get();
  if (!assignments.empty) {
    const batch = db.batch();
    assignments.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  const conversations = await db.collection("conversations").get();
  for (const conversation of conversations.docs) {
    const messages = await conversation.ref.collection("messages").get();
    if (!messages.empty) {
      const batch = db.batch();
      messages.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    await conversation.ref.delete();
  }
  // Firestore does not return a parent document that exists only because it
  // has a subcollection, so explicitly clean this deterministic test pair.
  const pairRef = db.collection("conversations").doc(`${clientId}__${providerId}`);
  const pairMessages = await pairRef.collection("messages").get();
  if (!pairMessages.empty) {
    const batch = db.batch();
    pairMessages.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  await pairRef.delete();
  const users = await db.collection("users").get();
  if (!users.empty) {
    const batch = db.batch();
    users.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  for (const collectionName of ["messageRateLimits", "account_security_signals", "support_activity_events"]) {
    const records = await db.collection(collectionName).get();
    if (!records.empty) {
      const batch = db.batch();
      records.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

async function seedActiveConnection() {
  await db.collection("clientProviderAssignments").doc(assignmentId).set({
    clientId,
    providerId,
    status: "active",
  });
  const pairRef = db.collection("conversations").doc(`${clientId}__${providerId}`);
  await pairRef.set({ clientId, providerId });
  await pairRef.collection("messages").doc("seed-message").set({
    clientId,
    providerId,
    senderId: clientId,
    receiverId: providerId,
    senderRole: "client",
    content: "The message belongs to this connected pair.",
    type: "text",
    readBy: [],
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-28T12:00:00.000Z")),
  });
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});

beforeEach(async () => {
  await clean();
  await seedActiveConnection();
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("only the active client and practitioner can read their conversation", async () => {
  const clientMessages = await listClientMessages(clientRequest({ practitionerId: providerId }));
  const providerMessages = await listProviderMessages(providerRequest({ clientId }));
  assert.equal(clientMessages.messages[0].content, "The message belongs to this connected pair.");
  assert.equal(providerMessages.messages[0].content, "The message belongs to this connected pair.");

  await assert.rejects(
    listProviderMessages(providerRequest({ clientId }, "other-provider")),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    listClientMessages(clientRequest({ practitionerId: providerId }, otherClientId)),
    (error) => error.code === "permission-denied",
  );
});

test("only participants may send messages and a revoked connection blocks new writes", async () => {
  const sentByClient = await sendClientMessage(clientRequest({ practitionerId: providerId, content: "A client message." }));
  const sentByProvider = await sendProviderMessage(providerRequest({ clientId, content: "A practitioner message." }));
  assert.ok(sentByClient.messageId);
  assert.ok(sentByProvider.messageId);

  const clientActivity = await db.collection("support_activity_events").where("uid", "==", clientId).get();
  const providerActivity = await db.collection("support_activity_events").where("uid", "==", providerId).get();
  assert.deepEqual(clientActivity.docs.map((doc) => [doc.get("eventCode"), doc.get("source")]).sort(), [
    ["message_received", "server"], ["message_sent", "server"],
  ]);
  assert.deepEqual(providerActivity.docs.map((doc) => [doc.get("eventCode"), doc.get("source")]).sort(), [
    ["message_received", "server"], ["message_sent", "server"],
  ]);
  assert.ok(clientActivity.docs.every((doc) => !doc.data().content));

  await assert.rejects(
    sendClientMessage(clientRequest({ practitionerId: providerId, content: "An unrelated message." }, otherClientId)),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    sendProviderMessage(providerRequest({ clientId, content: "An unrelated message." }, "other-provider")),
    (error) => error.code === "permission-denied",
  );

  await db.collection("clientProviderAssignments").doc(assignmentId).update({ status: "ended" });
  await assert.rejects(
    sendClientMessage(clientRequest({ practitionerId: providerId, content: "After the connection ended." })),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    listProviderMessages(providerRequest({ clientId })),
    (error) => error.code === "permission-denied",
  );
});

test("message sending applies an account quota before storing excess messages", async () => {
  for (let index = 0; index < 20; index += 1) {
    await sendClientMessage(clientRequest({ practitionerId: providerId, content: `Message ${index + 1}` }));
  }
  await assert.rejects(
    sendClientMessage(clientRequest({ practitionerId: providerId, content: "One too many." })),
    (error) => error.code === "resource-exhausted" && /sending messages too quickly/.test(error.message),
  );
  const snapshot = await db.collection("conversations").doc(`${clientId}__${providerId}`).collection("messages").get();
  assert.equal(snapshot.size, 21); // one seed message plus 20 accepted sends
  const signal = await db.collection("account_security_signals").doc(signalId(clientId, "message_quota_blocks")).get();
  assert.equal(signal.exists, true);
  assert.equal(signal.data().countInWindow, 1);
  assert.equal(Object.hasOwn(signal.data(), "content"), false);
});

test("anonymous and signed-out users cannot use practitioner messaging", async () => {
  await assert.rejects(
    listClientMessages({ auth: null, data: { practitionerId: providerId } }),
    (error) => error.code === "unauthenticated",
  );
  await assert.rejects(
    sendClientMessage({ auth: { uid: clientId, token: { firebase: { sign_in_provider: "anonymous" } } }, data: { practitionerId: providerId, content: "Hello" } }),
    (error) => error.code === "unauthenticated",
  );
  await assert.rejects(
    listProviderMessages({ auth: null, data: { clientId } }),
    (error) => error.code === "unauthenticated",
  );
});
