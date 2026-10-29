const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("./firebaseAdminCompat.cjs");
const providerScheduling = require("./providerScheduling");
const { consumeMessageRequestQuota } = require("../aiRateLimiter");
const { recordMessageQuotaBlock } = require("./securitySignals");
const { recordTrustedSupportActivity } = require("./supportActivity");
const { requireVerifiedAccount } = require("./accountAccess");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";

async function enforceMessageQuota(uid) {
  const quota = await consumeMessageRequestQuota({
    db,
    uid,
    onAbuseSignal: (accountUid, now) => recordMessageQuotaBlock({ firestore: db, uid: accountUid, now }),
  });
  if (!quota.allowed) {
    throw new HttpsError("resource-exhausted", `You’re sending messages too quickly. Please wait ${quota.retryAfterSeconds} seconds and try again.`);
  }
}

function activeConnectionQuery(clientId, providerId) {
  return db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("providerId", "==", providerId)
    .where("status", "==", "active")
    .limit(1);
}

function messageQuery(clientId, providerId) {
  return db.collection("conversations").doc(conversationId(clientId, providerId))
    .collection("messages").orderBy("createdAt", "asc").limitToLast(100);
}

function requireActiveConnectionSnapshot(snapshot) {
  if (snapshot.empty) {
    throw new HttpsError("permission-denied", "Messaging is available only for an active client connection.");
  }
}

function conversationId(clientId, providerId) {
  return [clientId, providerId].sort().join("__");
}

function toMessage(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    senderId: data.senderId || null,
    senderRole: data.senderRole === "provider" ? "provider" : "client",
    content: data.content || "",
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
  };
}

exports.listProviderConversationMessages = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await providerScheduling.requireProviderCapability(request, "client.messages.exchange");
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId.trim() : "";
  if (!clientId || clientId.length > 128) throw new HttpsError("invalid-argument", "Choose a connected client.");
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.messages.exchange");
    const connection = await transaction.get(activeConnectionQuery(clientId, providerId));
    requireActiveConnectionSnapshot(connection);
    const snapshot = await transaction.get(messageQuery(clientId, providerId));
    return { messages: snapshot.docs.map(toMessage) };
  });
});

exports.sendProviderMessage = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await providerScheduling.requireProviderCapability(request, "client.messages.exchange");
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId.trim() : "";
  const content = typeof request.data?.content === "string" ? request.data.content.trim() : "";
  if (!clientId || clientId.length > 128) throw new HttpsError("invalid-argument", "Choose a connected client.");
  if (!content || content.length > 4000) throw new HttpsError("invalid-argument", "Write a message of 1 to 4,000 characters.");
  await enforceMessageQuota(providerId);
  const ref = db.collection("conversations").doc(conversationId(clientId, providerId)).collection("messages").doc();
  await db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.messages.exchange");
    const connection = await transaction.get(activeConnectionQuery(clientId, providerId));
    requireActiveConnectionSnapshot(connection);
    transaction.create(ref, {
      clientId,
      providerId,
      senderId: providerId,
      receiverId: clientId,
      senderRole: "provider",
      content,
      type: "text",
      readBy: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await recordTrustedSupportActivity([
    { uid: providerId, feature: "sessions", eventCode: "message_sent" },
    { uid: clientId, feature: "sessions", eventCode: "message_received" },
  ]);
  return { ok: true, messageId: ref.id };
});

exports.listMyPractitionerMessages = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireVerifiedAccount(request, "open practitioner messages");
  const practitionerId = typeof request.data?.practitionerId === "string" ? request.data.practitionerId.trim() : "";
  if (!practitionerId || practitionerId.length > 128) throw new HttpsError("invalid-argument", "Choose a connected practitioner.");
  return db.runTransaction(async (transaction) => {
    const connection = await transaction.get(activeConnectionQuery(clientId, practitionerId));
    requireActiveConnectionSnapshot(connection);
    const snapshot = await transaction.get(messageQuery(clientId, practitionerId));
    return { messages: snapshot.docs.map(toMessage) };
  });
});

exports.sendClientMessage = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireVerifiedAccount(request, "send practitioner messages");
  const practitionerId = typeof request.data?.practitionerId === "string" ? request.data.practitionerId.trim() : "";
  const content = typeof request.data?.content === "string" ? request.data.content.trim() : "";
  if (!practitionerId || practitionerId.length > 128) throw new HttpsError("invalid-argument", "Choose a connected practitioner.");
  if (!content || content.length > 4000) throw new HttpsError("invalid-argument", "Write a message of 1 to 4,000 characters.");
  await enforceMessageQuota(clientId);
  const ref = db.collection("conversations").doc(conversationId(clientId, practitionerId)).collection("messages").doc();
  await db.runTransaction(async (transaction) => {
    const [connection, practitionerAccount] = await Promise.all([
      transaction.get(activeConnectionQuery(clientId, practitionerId)),
      transaction.get(db.collection("users").doc(practitionerId)),
    ]);
    requireActiveConnectionSnapshot(connection);
    if (practitionerAccount.exists && practitionerAccount.get("practitionerWorkspaceActive") === false) {
      throw new HttpsError("failed-precondition", "This practitioner is not currently receiving messages.");
    }
    transaction.create(ref, {
      clientId,
      providerId: practitionerId,
      senderId: clientId,
      receiverId: practitionerId,
      senderRole: "client",
      content,
      type: "text",
      readBy: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await recordTrustedSupportActivity([
    { uid: clientId, feature: "sessions", eventCode: "message_sent" },
    { uid: practitionerId, feature: "sessions", eventCode: "message_received" },
  ]);
  return { ok: true, messageId: ref.id };
});
