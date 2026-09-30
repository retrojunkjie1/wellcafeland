const assert = require("node:assert/strict");
const test = require("node:test");
const {
  listOpenAccountSecuritySignals,
  reviewAccountSecuritySignal,
  recordAIQuotaBlock,
  recordMessageQuotaBlock,
  signalId,
  REVIEW_THRESHOLD,
} = require("../src/securitySignals");

function memoryFirestore() {
  const records = new Map();
  return {
    records,
    collection(name) {
      return { doc(id) { return { key: `${name}/${id}` }; } };
    },
    async runTransaction(callback) {
      const writes = [];
      const transaction = {
        async get(ref) {
          const value = records.get(ref.key);
          return { exists: value !== undefined, data: () => value };
        },
        set(ref, value, options = {}) { writes.push([ref.key, value, options]); },
      };
      const result = await callback(transaction);
      for (const [key, value, options] of writes) records.set(key, options.merge ? { ...(records.get(key) || {}), ...value } : value);
      return result;
    },
  };
}

test("repeated quota blocks create a review signal without recording user content", async () => {
  const firestore = memoryFirestore();
  const uid = "account-1";
  const now = 1_800_000_000_000;
  for (let index = 0; index < REVIEW_THRESHOLD; index += 1) {
    await recordAIQuotaBlock({ firestore, uid, now: now + index * 6 * 60_000 });
  }

  const signal = firestore.records.get(`account_security_signals/${signalId(uid, "ai_quota_blocks")}`);
  assert.equal(signal.uid, uid);
  assert.equal(signal.signalCode, "ai_quota_blocks");
  assert.equal(signal.countInWindow, REVIEW_THRESHOLD);
  assert.equal(signal.status, "open");
  assert.equal(signal.windowStartedAt, now);
  assert.equal(signal.lastSeenAt, now + (REVIEW_THRESHOLD - 1) * 6 * 60_000);
  assert.deepEqual(Object.keys(signal).sort(), [
    "countInWindow", "countSinceReview", "expiresAt", "lastSeenAt", "openedAt", "signalCode", "status", "uid", "windowStartedAt",
  ].sort());
});

test("a new day starts a new signal window and account IDs are not exposed in document IDs", async () => {
  const firestore = memoryFirestore();
  const uid = "private-user-id";
  const now = 1_800_000_000_000;
  await recordAIQuotaBlock({ firestore, uid, now });
  await recordAIQuotaBlock({ firestore, uid, now: now + 25 * 60 * 60_000 });
  const id = signalId(uid, "ai_quota_blocks");
  const signal = firestore.records.get(`account_security_signals/${id}`);
  assert.equal(id.includes(uid), false);
  assert.equal(signal.countInWindow, 1);
  assert.equal(signal.windowStartedAt, now + 25 * 60 * 60_000);
  assert.equal(signal.status, "monitoring");
});

test("message quota signals use an allowlisted category and store no message content", async () => {
  const firestore = memoryFirestore();
  const uid = "message-account";
  const now = 1_800_000_000_000;
  for (let index = 0; index < REVIEW_THRESHOLD; index += 1) {
    await recordMessageQuotaBlock({ firestore, uid, now: now + index * 6 * 60_000, content: "must never be stored" });
  }

  const signal = firestore.records.get(`account_security_signals/${signalId(uid, "message_quota_blocks")}`);
  assert.equal(signal.signalCode, "message_quota_blocks");
  assert.equal(signal.status, "open");
  assert.equal(JSON.stringify(signal).includes("must never be stored"), false);
});

test("security review callables reject signed-out and non-admin accounts", async () => {
  for (const callable of [listOpenAccountSecuritySignals, reviewAccountSecuritySignal]) {
    await assert.rejects(callable.run({ auth: null, data: {} }), (error) => error.code === "unauthenticated");
    await assert.rejects(
      callable.run({ auth: { uid: "ordinary-member", token: { role: "client" } }, data: {} }),
      (error) => error.code === "permission-denied",
    );
  }
});
