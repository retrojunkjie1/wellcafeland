const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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

test("preserves supported browser recording formats for transcription uploads", () => {
  assert.deepEqual(__test.resolveTranscriptionAudioType("audio/mp4;codecs=mp4a.40.2"), {
    mimeType: "audio/mp4",
    extension: ".mp4",
  });
  assert.deepEqual(__test.resolveTranscriptionAudioType("audio/webm;codecs=opus"), {
    mimeType: "audio/webm",
    extension: ".webm",
  });
  assert.deepEqual(__test.resolveTranscriptionAudioType("audio/x-wav"), {
    mimeType: "audio/x-wav",
    extension: ".wav",
  });
});

test("uses WebM only for legacy requests without a MIME type and rejects unknown formats", () => {
  assert.deepEqual(__test.resolveTranscriptionAudioType(undefined), {
    mimeType: "audio/webm",
    extension: ".webm",
  });
  assert.equal(__test.resolveTranscriptionAudioType("video/mp4"), null);
  assert.equal(__test.resolveTranscriptionAudioType("application/octet-stream"), null);
});

test("writes an MP4 capture with its matching extension and removes the temporary upload", async () => {
  let uploadPath;
  const openai = {
    audio: {
      transcriptions: {
        async create({ file, model, language }) {
          uploadPath = file.path;
          assert.equal(model, "whisper-1");
          assert.equal(language, "en");
          assert.deepEqual(await fs.promises.readFile(uploadPath), Buffer.from("voice bytes"));
          return { text: "A captured sentence." };
        },
      },
    },
  };

  const result = await __test.transcribeAudioPayload({
    audio: Buffer.from("voice bytes").toString("base64"),
    mimeType: "audio/mp4;codecs=mp4a.40.2",
  }, openai);

  assert.deepEqual(result, { status: 200, body: { ok: true, text: "A captured sentence." } });
  assert.match(uploadPath, /recording\.mp4$/);
  await assert.rejects(fs.promises.access(path.dirname(uploadPath)));
});

test("rejects unsupported or malformed audio before contacting transcription", async () => {
  let providerCalled = false;
  const openai = { audio: { transcriptions: { create: async () => { providerCalled = true; } } } };

  const unsupported = await __test.transcribeAudioPayload({ audio: "d29yZA==", mimeType: "video/mp4" }, openai);
  const malformed = await __test.transcribeAudioPayload({ audio: "not-base64!", mimeType: "audio/webm" }, openai);

  assert.equal(unsupported.status, 415);
  assert.equal(unsupported.body.code, "AUDIO_FORMAT_UNSUPPORTED");
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.code, "AUDIO_INVALID");
  assert.equal(providerCalled, false);
});

test("removes the temporary upload when the transcription provider fails", async () => {
  let uploadPath;
  const openai = {
    audio: {
      transcriptions: {
        async create({ file }) {
          uploadPath = file.path;
          throw new Error("provider unavailable");
        },
      },
    },
  };

  await assert.rejects(__test.transcribeAudioPayload({ audio: "d29yZA==", mimeType: "audio/webm" }, openai), /provider unavailable/);
  await assert.rejects(fs.promises.access(path.dirname(uploadPath)));
});
