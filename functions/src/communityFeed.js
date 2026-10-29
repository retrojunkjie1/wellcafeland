const { createHash } = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const aiBrain = require("../aiBrain");
const { requireVerifiedAccount } = require("./accountAccess");
const { consumeMessageRequestQuota } = require("../aiRateLimiter");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const POST_TYPES = new Set(["gratitude", "win", "reflection", "milestone"]);
const REACTIONS = new Set(["💙", "🌱", "🙏", "✨"]);

async function enforceCommunityMessageQuota(uid) {
  const quota = await consumeMessageRequestQuota({ db, uid });
  if (!quota.allowed) {
    throw new HttpsError("resource-exhausted", `Please wait ${quota.retryAfterSeconds} seconds before posting again.`);
  }
}

function toPublicPost(doc) {
  const data = doc.data();
  if (data.visibility !== "community") return null;
  return {
    id: doc.id,
    text: data.text,
    type: data.type,
    anonymized: data.anonymized === true,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
  };
}

exports.createSocialFeedPost = onCall({ region: REGION, enforceAppCheck: true, secrets: ["OPENAI_API_KEY"] }, async (request) => {
  const uid = requireVerifiedAccount(request, "share with the community");
  const data = request.data || {};
  const text = typeof data.text === "string" ? data.text.trim() : "";
  const type = typeof data.type === "string" ? data.type : "";
  const anonymized = data.anonymized === true;
  if (!text || text.length > 2000) throw new HttpsError("invalid-argument", "Write a message of 1 to 2,000 characters.");
  if (!POST_TYPES.has(type)) throw new HttpsError("invalid-argument", "Choose a supported community post type.");
  if (data.anonymized !== undefined && typeof data.anonymized !== "boolean") {
    throw new HttpsError("invalid-argument", "Choose whether your post should be anonymous.");
  }

  await enforceCommunityMessageQuota(uid);
  let decision;
  try {
    decision = await aiBrain.reviewCommunityContent({ content: text, uid });
  } catch (error) {
    if (error?.code === "RATE_LIMITED") throw new HttpsError("resource-exhausted", error.message);
    if (error?.code === "INVALID_CHERUBIM_CONTENT") throw new HttpsError("invalid-argument", error.message);
    console.error("[communityFeed] Cherubim review unavailable", { uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The community safety check is unavailable. Nothing was shared; please try again shortly.");
  }
  if (!decision.safe) {
    throw new HttpsError("failed-precondition", decision.suggestion || "Please revise this message before sharing it.");
  }

  const postRef = db.collection("social_feed").doc();
  await postRef.create({
    text,
    type,
    anonymized,
    userId: anonymized ? null : uid,
    visibility: "community",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { ok: true, postId: postRef.id };
});

exports.listSocialFeedPosts = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  requireVerifiedAccount(request, "view the community feed");
  const requested = Number(request.data?.limitCount);
  const limitCount = Number.isInteger(requested) ? Math.min(50, Math.max(1, requested)) : 50;
  const snapshot = await db.collection("social_feed")
    .where("visibility", "==", "community")
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();
  return { posts: snapshot.docs.map(toPublicPost).filter(Boolean) };
});

exports.reactToSocialFeedPost = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "react to a community post");
  const postId = typeof request.data?.postId === "string" ? request.data.postId.trim() : "";
  const emoji = typeof request.data?.emoji === "string" ? request.data.emoji : "";
  if (!postId || postId.length > 128) throw new HttpsError("invalid-argument", "Choose a community post.");
  if (!REACTIONS.has(emoji)) throw new HttpsError("invalid-argument", "Choose one of the available reactions.");
  await enforceCommunityMessageQuota(uid);

  const postRef = db.collection("social_feed").doc(postId);
  const reactionKey = createHash("sha256").update(`${postId}:${uid}:${emoji}`).digest("hex");
  const reactionRef = db.collection("social_reactions").doc(reactionKey);
  await db.runTransaction(async (transaction) => {
    const post = await transaction.get(postRef);
    if (!post.exists || post.get("visibility") !== "community") {
      throw new HttpsError("not-found", "This community post is no longer available.");
    }
    const existing = await transaction.get(reactionRef);
    if (!existing.exists) transaction.create(reactionRef, {
      postId,
      userId: uid,
      emoji,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, reactionId: reactionKey };
});

module.exports.toPublicPost = toPublicPost;
