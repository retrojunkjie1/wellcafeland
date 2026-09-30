const test = require("node:test");
const assert = require("node:assert/strict");
const { AI_REQUEST_LIMITS, MESSAGE_REQUEST_LIMITS, consumeAIRequestQuota, consumeMessageRequestQuota } = require("../aiRateLimiter");

function createMemoryFirestore() {
  const records = new Map();
  return {
    records,
    collection(name) {
      return {
        doc(id) {
          const key = `${name}/${id}`;
          return { key };
        },
      };
    },
    async runTransaction(callback) {
      const writes = [];
      const transaction = {
        async get(ref) {
          const value = records.get(ref.key);
          return { exists: value !== undefined, data: () => value };
        },
        set(ref, value, options = {}) {
          writes.push([ref.key, value, options]);
        },
      };
      const result = await callback(transaction);
      for (const [key, value, options] of writes) records.set(key, options.merge ? { ...(records.get(key) || {}), ...value } : value);
      return result;
    },
  };
}

test("allows normal account traffic up to generous burst and hourly limits", async () => {
  const db = createMemoryFirestore();
  const now = 1_800_000_000_000;

  for (let i = 0; i < AI_REQUEST_LIMITS.perMinute; i += 1) {
    assert.deepEqual(await consumeAIRequestQuota({ db, uid: "client-a", now }), {
      allowed: true,
      retryAfterSeconds: 0,
    });
  }

  const limited = await consumeAIRequestQuota({ db, uid: "client-a", now });
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, 60);
  assert.equal(db.records.get("aiSessionRateLimits/client-a").minuteCount, AI_REQUEST_LIMITS.perMinute);
});

test("resets the minute bucket while preserving and enforcing the hourly bucket", async () => {
  const db = createMemoryFirestore();
  const now = 1_800_000_000_000;
  const hourLimit = 2;

  assert.equal((await consumeAIRequestQuota({ db, uid: "client-a", now, perMinute: 1, perHour: hourLimit })).allowed, true);
  assert.equal((await consumeAIRequestQuota({ db, uid: "client-a", now: now + 60_000, perMinute: 1, perHour: hourLimit })).allowed, true);

  const limited = await consumeAIRequestQuota({ db, uid: "client-a", now: now + 120_000, perMinute: 1, perHour: hourLimit });
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, 3480);
});

test("keeps quotas isolated by authenticated account", async () => {
  const db = createMemoryFirestore();
  const now = 1_800_000_000_000;
  await consumeAIRequestQuota({ db, uid: "client-a", now, perMinute: 1, perHour: 10 });

  const otherAccount = await consumeAIRequestQuota({ db, uid: "client-b", now, perMinute: 1, perHour: 10 });
  assert.equal(otherAccount.allowed, true);
});

test("rejects missing authenticated identity or Firestore", async () => {
  await assert.rejects(consumeAIRequestQuota({ db: createMemoryFirestore(), uid: "" }), /authenticated uid/);
  await assert.rejects(consumeAIRequestQuota({ uid: "client-a" }), /authenticated uid/);
});

test("signals at most once per five-minute blocked window while keeping the quota denial active", async () => {
  const db = createMemoryFirestore();
  const now = 1_800_000_000_000;
  const signals = [];
  await consumeAIRequestQuota({ db, uid: "client-a", now, perMinute: 1, perHour: 10 });
  const onAbuseSignal = async (uid, at) => signals.push({ uid, at });

  const firstBlock = await consumeAIRequestQuota({ db, uid: "client-a", now, perMinute: 1, perHour: 10, onAbuseSignal });
  const repeatedBlock = await consumeAIRequestQuota({ db, uid: "client-a", now, perMinute: 1, perHour: 10, onAbuseSignal });
  assert.equal(firstBlock.allowed, false);
  assert.equal(repeatedBlock.allowed, false);
  assert.equal(firstBlock.shouldSignalAbuse, true);
  assert.equal(repeatedBlock.shouldSignalAbuse, false);
  assert.deepEqual(signals, [{ uid: "client-a", at: now }]);

  const later = now + 5 * 60_000;
  await consumeAIRequestQuota({ db, uid: "client-a", now: later, perMinute: 1, perHour: 10 });
  const laterBlock = await consumeAIRequestQuota({ db, uid: "client-a", now: later, perMinute: 1, perHour: 10, onAbuseSignal });
  assert.equal(laterBlock.allowed, false);
  assert.equal(signals.length, 2);
});

test("message quotas use an independent account bucket and emit the configured signal", async () => {
  const db = createMemoryFirestore();
  const now = 1_800_000_000_000;
  const signals = [];
  for (let index = 0; index < MESSAGE_REQUEST_LIMITS.perMinute; index += 1) {
    assert.equal((await consumeMessageRequestQuota({ db, uid: "client-a", now })).allowed, true);
  }

  const limited = await consumeMessageRequestQuota({
    db,
    uid: "client-a",
    now,
    onAbuseSignal: async (uid, at) => signals.push({ uid, at }),
  });
  assert.equal(limited.allowed, false);
  assert.equal(limited.retryAfterSeconds, 60);
  assert.equal(db.records.get("messageRateLimits/client-a").minuteCount, MESSAGE_REQUEST_LIMITS.perMinute);
  assert.equal(db.records.has("aiSessionRateLimits/client-a"), false);
  assert.deepEqual(signals, [{ uid: "client-a", at: now }]);
});
