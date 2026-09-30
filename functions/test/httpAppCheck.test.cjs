const test = require("node:test");
const assert = require("node:assert/strict");
const { verifyHttpAppCheck } = require("../src/httpAppCheck");

function responseMock() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("requires an App Check token for HTTP requests", async () => {
  const res = responseMock();
  let verifierCalled = false;
  const accepted = await verifyHttpAppCheck({ headers: {} }, res, {
    verifyToken: async () => { verifierCalled = true; },
  });
  assert.equal(accepted, false);
  assert.equal(verifierCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "APP_CHECK_REQUIRED");
});

test("rejects invalid App Check tokens without exposing token details", async () => {
  const res = responseMock();
  const accepted = await verifyHttpAppCheck({ headers: { "x-firebase-appcheck": "secret-token" } }, res, {
    verifyToken: async () => { throw new Error("token invalid: secret-token"); },
  });
  assert.equal(accepted, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.code, "APP_CHECK_INVALID");
  assert.equal(JSON.stringify(res.body).includes("secret-token"), false);
});

test("accepts verified App Check tokens", async () => {
  const res = responseMock();
  let verifiedToken = null;
  const accepted = await verifyHttpAppCheck({ headers: { "x-firebase-appcheck": "valid-token" } }, res, {
    verifyToken: async (token) => { verifiedToken = token; return { appId: "web-app" }; },
  });
  assert.equal(accepted, true);
  assert.equal(verifiedToken, "valid-token");
  assert.equal(res.statusCode, null);
});

test("allows local Functions Emulator requests without a token", async () => {
  const previous = process.env.FUNCTIONS_EMULATOR;
  process.env.FUNCTIONS_EMULATOR = "true";
  try {
    const res = responseMock();
    const accepted = await verifyHttpAppCheck({ headers: {} }, res, {
      verifyToken: async () => { throw new Error("must not run"); },
    });
    assert.equal(accepted, true);
    assert.equal(res.statusCode, null);
  } finally {
    if (previous === undefined) delete process.env.FUNCTIONS_EMULATOR;
    else process.env.FUNCTIONS_EMULATOR = previous;
  }
});
