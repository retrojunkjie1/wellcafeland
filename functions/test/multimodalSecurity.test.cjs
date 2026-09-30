const test = require("node:test");
const assert = require("node:assert/strict");
const { __test } = require("../src/multimodal");

function responseMock() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    set(name, value) { this.headers[name] = value; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("rejects multimodal provider requests without a Firebase ID token", async () => {
  const res = responseMock();
  let quotaCalled = false;
  const uid = await __test.authorizeAICall({ headers: { "x-firebase-appcheck": "valid-app-check" } }, res, {
    verifyAppCheckToken: async () => true,
    auth: { verifyIdToken: async () => ({ uid: "should-not-run" }) },
    consumeQuota: async () => { quotaCalled = true; return { allowed: true }; },
  });

  assert.equal(uid, null);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "AUTH_REQUIRED");
  assert.equal(quotaCalled, false);
});

test("rejects invalid tokens before the provider quota is consumed", async () => {
  const res = responseMock();
  let quotaCalled = false;
  const uid = await __test.authorizeAICall({ headers: { authorization: "Bearer invalid", "x-firebase-appcheck": "valid-app-check" } }, res, {
    verifyAppCheckToken: async () => true,
    auth: { verifyIdToken: async () => { throw new Error("invalid token"); } },
    consumeQuota: async () => { quotaCalled = true; return { allowed: true }; },
  });

  assert.equal(uid, null);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "AUTH_INVALID");
  assert.equal(quotaCalled, false);
});

test("charges the verified account quota, never a caller-supplied identity", async () => {
  const res = responseMock();
  let quotaUid;
  const uid = await __test.authorizeAICall({
    headers: { Authorization: "Bearer verified-token", "x-firebase-appcheck": "valid-app-check" },
    body: { uid: "attacker-selected-account" },
  }, res, {
    verifyAppCheckToken: async () => true,
    auth: { verifyIdToken: async (token) => ({ uid: token === "verified-token" ? "verified-account" : null }) },
    consumeQuota: async ({ uid: requestedUid }) => { quotaUid = requestedUid; return { allowed: true }; },
    db: {},
  });

  assert.equal(uid, "verified-account");
  assert.equal(quotaUid, "verified-account");
  assert.equal(res.statusCode, null);
});

test("returns a retryable limit response when the account quota is exhausted", async () => {
  const res = responseMock();
  const uid = await __test.authorizeAICall({ headers: { authorization: "Bearer verified-token", "x-firebase-appcheck": "valid-app-check" } }, res, {
    verifyAppCheckToken: async () => true,
    auth: { verifyIdToken: async () => ({ uid: "verified-account" }) },
    consumeQuota: async () => ({ allowed: false, retryAfterSeconds: 45 }),
  });

  assert.equal(uid, null);
  assert.equal(res.statusCode, 429);
  assert.equal(res.headers["Retry-After"], "45");
  assert.equal(res.body.code, "RATE_LIMITED");
});

test("fails closed when the shared quota service is unavailable", async () => {
  const res = responseMock();
  const uid = await __test.authorizeAICall({ headers: { authorization: "Bearer verified-token", "x-firebase-appcheck": "valid-app-check" } }, res, {
    verifyAppCheckToken: async () => true,
    auth: { verifyIdToken: async () => ({ uid: "verified-account" }) },
    consumeQuota: async () => { throw new Error("database unavailable"); },
  });

  assert.equal(uid, null);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "AI_RATE_LIMIT_UNAVAILABLE");
});

test("rejects missing App Check before Firebase auth or quota", async () => {
  const res = responseMock();
  let authCalled = false;
  let quotaCalled = false;
  const uid = await __test.authorizeAICall({ headers: {} }, res, {
    auth: { verifyIdToken: async () => { authCalled = true; return { uid: "user" }; } },
    consumeQuota: async () => { quotaCalled = true; return { allowed: true }; },
  });
  assert.equal(uid, null);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "APP_CHECK_REQUIRED");
  assert.equal(authCalled, false);
  assert.equal(quotaCalled, false);
});

test("rejects invalid App Check before Firebase auth or quota", async () => {
  const res = responseMock();
  let authCalled = false;
  let quotaCalled = false;
  const uid = await __test.authorizeAICall({ headers: { "x-firebase-appcheck": "invalid" } }, res, {
    verifyAppCheckToken: async () => { throw new Error("bad attestation"); },
    auth: { verifyIdToken: async () => { authCalled = true; return { uid: "user" }; } },
    consumeQuota: async () => { quotaCalled = true; return { allowed: true }; },
  });
  assert.equal(uid, null);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "APP_CHECK_INVALID");
  assert.equal(authCalled, false);
  assert.equal(quotaCalled, false);
});
