const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const ABUSE_SIGNAL_COOLDOWN_MS = 5 * MINUTE_MS;

const AI_REQUEST_LIMITS = Object.freeze({
  perMinute: 30,
  perHour: 240,
});

const MESSAGE_REQUEST_LIMITS = Object.freeze({
  perMinute: 20,
  perHour: 120,
});

/**
 * Atomically limits model-backed AI requests per authenticated Firebase UID.
 * Only bucket counters are stored; prompt or response content is never written.
 */
async function consumeRequestQuota({
  db,
  uid,
  now = Date.now(),
  perMinute,
  perHour,
  collectionName = "aiSessionRateLimits",
  onAbuseSignal,
}) {
  if (!db || typeof db.runTransaction !== "function" || !uid) {
    throw new TypeError("Firestore and an authenticated uid are required");
  }

  const minuteBucket = Math.floor(now / MINUTE_MS) * MINUTE_MS;
  const hourBucket = Math.floor(now / HOUR_MS) * HOUR_MS;
  if (typeof collectionName !== "string" || !/^[a-zA-Z0-9_]+$/.test(collectionName)) {
    throw new TypeError("A valid server-owned quota collection name is required");
  }
  if (!Number.isInteger(perMinute) || perMinute < 1 || !Number.isInteger(perHour) || perHour < 1) {
    throw new TypeError("Positive integer request limits are required");
  }
  const ref = db.collection(collectionName).doc(uid);

  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.exists ? snapshot.data() || {} : {};
    const minuteCount = previous.minuteBucket === minuteBucket ? Number(previous.minuteCount) || 0 : 0;
    const hourCount = previous.hourBucket === hourBucket ? Number(previous.hourCount) || 0 : 0;
    const blockedUntil = [];

    if (minuteCount >= perMinute) blockedUntil.push(minuteBucket + MINUTE_MS);
    if (hourCount >= perHour) blockedUntil.push(hourBucket + HOUR_MS);
    if (blockedUntil.length) {
      const retryAfterSeconds = Math.max(1, Math.ceil((Math.max(...blockedUntil) - now) / 1000));
      const lastAbuseSignalAt = Number(previous.lastAbuseSignalAt) || 0;
      const shouldSignalAbuse = now - lastAbuseSignalAt >= ABUSE_SIGNAL_COOLDOWN_MS;
      if (shouldSignalAbuse) transaction.set(ref, { lastAbuseSignalAt: now, updatedAt: now }, { merge: true });
      return { allowed: false, retryAfterSeconds, shouldSignalAbuse };
    }

    transaction.set(ref, {
      minuteBucket,
      minuteCount: minuteCount + 1,
      hourBucket,
      hourCount: hourCount + 1,
      updatedAt: now,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  });

  if (!result.allowed && result.shouldSignalAbuse && typeof onAbuseSignal === "function") {
    try {
      await onAbuseSignal(uid, now);
    } catch (error) {
      // The quota denial has already been enforced; logging failure must not
      // make the rejected request succeed or turn it into a service outage.
      console.warn("[requestRateLimiter] Could not persist an abuse review signal", { code: error?.code || "UNKNOWN" });
    }
  }
  return result;
}

function consumeAIRequestQuota(options) {
  return consumeRequestQuota({
    perMinute: AI_REQUEST_LIMITS.perMinute,
    perHour: AI_REQUEST_LIMITS.perHour,
    ...options,
    collectionName: "aiSessionRateLimits",
  });
}

function consumeMessageRequestQuota(options) {
  return consumeRequestQuota({
    perMinute: MESSAGE_REQUEST_LIMITS.perMinute,
    perHour: MESSAGE_REQUEST_LIMITS.perHour,
    ...options,
    collectionName: "messageRateLimits",
  });
}

module.exports = {
  AI_REQUEST_LIMITS,
  MESSAGE_REQUEST_LIMITS,
  ABUSE_SIGNAL_COOLDOWN_MS,
  consumeRequestQuota,
  consumeAIRequestQuota,
  consumeMessageRequestQuota,
};
