const { createHash } = require("node:crypto");
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const SIGNALS = "account_security_signals";
const REVIEWS = "account_security_signal_reviews";
const WINDOW_MS = 24 * 60 * 60 * 1000;
const REVIEW_THRESHOLD = 5;
const REVIEW_OUTCOMES = new Set(["monitor", "no_action", "false_positive"]);
const ALLOWED_SIGNAL_CODES = new Set(["ai_quota_blocks", "message_quota_blocks"]);

function signalId(uid, signalCode) {
  return createHash("sha256").update(`${uid}:${signalCode}`).digest("hex");
}

/**
 * Record one rate-limited account signal. It stores no prompt, message, IP,
 * device fingerprint, location, or inferred identity. Reaching a threshold
 * queues human review; it never suspends an account.
 */
async function recordQuotaBlock({ firestore = db, uid, signalCode, now = Date.now(), threshold = REVIEW_THRESHOLD } = {}) {
  if (!uid || typeof uid !== "string") throw new TypeError("An authenticated account uid is required");
  if (!ALLOWED_SIGNAL_CODES.has(signalCode)) throw new TypeError("An allowed server-side signal code is required");
  const ref = firestore.collection(SIGNALS).doc(signalId(uid, signalCode));
  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? snapshot.data() || {} : {};
    const priorWindowStart = Number(current.windowStartedAt) || 0;
    const inWindow = now - priorWindowStart < WINDOW_MS;
    const countInWindow = inWindow ? (Number(current.countInWindow) || 0) + 1 : 1;
    const countSinceReview = inWindow ? (Number(current.countSinceReview) || 0) + 1 : 1;
    const stillOpen = current.status === "open";
    const status = stillOpen || countSinceReview >= threshold ? "open" : "monitoring";
    transaction.set(ref, {
      uid,
      signalCode,
      countInWindow,
      countSinceReview,
      windowStartedAt: inWindow ? priorWindowStart : now,
      lastSeenAt: now,
      status,
      ...(status === "open" && !stillOpen ? { openedAt: now } : {}),
      expiresAt: admin.firestore.Timestamp.fromMillis(now + 30 * 24 * 60 * 60 * 1000),
    }, { merge: true });
  });
}

const listOpenAccountSecuritySignals = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "trust_safety.review");
  try {
    const snapshot = await db.collection(SIGNALS)
      .where("status", "==", "open")
      .orderBy("lastSeenAt", "desc")
      .limit(100)
      .get();
    const signals = await Promise.all(snapshot.docs.map(async (doc) => {
      const value = doc.data();
      let account = null;
      try {
        account = await admin.auth().getUser(value.uid);
      } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
      return {
        id: doc.id,
        email: account?.email || "Account no longer available",
        emailVerified: account?.emailVerified === true,
        signalCode: ALLOWED_SIGNAL_CODES.has(value.signalCode) ? value.signalCode : "other",
        countInWindow: Math.max(0, Number(value.countInWindow) || 0),
        windowStartedAt: value.windowStartedAt ? new Date(value.windowStartedAt).toISOString() : null,
        lastSeenAt: value.lastSeenAt ? new Date(value.lastSeenAt).toISOString() : null,
        openedAt: value.openedAt ? new Date(value.openedAt).toISOString() : null,
      };
    }));
    return { signals };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[securitySignals] Admin list failed", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The account review queue could not be loaded. Try again.");
  }
});

const reviewAccountSecuritySignal = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: adminUid } = await requireAdminScope(request, "trust_safety.review");
  const id = typeof request.data?.id === "string" ? request.data.id : "";
  const outcome = request.data?.outcome;
  if (!/^[a-f0-9]{64}$/.test(id) || !REVIEW_OUTCOMES.has(outcome)) {
    throw new HttpsError("invalid-argument", "Choose a review signal and an available review outcome.");
  }

  const signalRef = db.collection(SIGNALS).doc(id);
  const reviewRef = db.collection(REVIEWS).doc();
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(signalRef);
      if (!snapshot.exists) throw new HttpsError("not-found", "This review signal is no longer available.");
      const signal = snapshot.data();
      if (signal.status !== "open") throw new HttpsError("failed-precondition", "This signal has already been reviewed.");
      const now = Date.now();
      const keepOpen = outcome === "monitor";
      transaction.set(signalRef, {
        status: keepOpen ? "open" : "reviewed",
        reviewOutcome: outcome,
        reviewedBy: adminUid,
        reviewedAt: now,
        countSinceReview: 0,
        expiresAt: admin.firestore.Timestamp.fromMillis(now + 30 * 24 * 60 * 60 * 1000),
      }, { merge: true });
      transaction.create(reviewRef, {
        signalId: id,
        uid: signal.uid,
        signalCode: signal.signalCode,
        outcome,
        reviewedBy: adminUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { reviewed: true, status: outcome === "monitor" ? "open" : "reviewed" };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[securitySignals] Admin review failed", { adminUid, signalId: id, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The review could not be saved. Try again.");
  }
});

const recordAIQuotaBlock = (options) => recordQuotaBlock({ ...options, signalCode: "ai_quota_blocks" });
const recordMessageQuotaBlock = (options) => recordQuotaBlock({ ...options, signalCode: "message_quota_blocks" });

module.exports = {
  listOpenAccountSecuritySignals,
  reviewAccountSecuritySignal,
  recordQuotaBlock,
  recordAIQuotaBlock,
  recordMessageQuotaBlock,
  signalId,
  REVIEW_THRESHOLD,
};
