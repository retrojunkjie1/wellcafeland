const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-client-agent-workflows";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });
process.env.FUNCTIONS_EMULATOR = "true";
const originalApiKey = process.env.OPENAI_API_KEY;
process.env.OPENAI_API_KEY = "test-key-client-agent-workflows-not-a-secret";

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const aiBrain = require("../aiBrain");
const AGENTS = ["scribe", "anchor", "breathkeeper", "rhythm", "lantern", "gardener"];
const ADDITIONAL_CLIENT_AGENTS = [
  "oracle", "cherubim", "healer_spiritual", "cartographer", "bridge", "mirror", "steward",
  "shepherd", "compass", "translator", "hearth", "lighthouse",
];
const CLIENT_WORKFLOW_AGENTS = [...AGENTS, ...ADDITIONAL_CLIENT_AGENTS, "sentinel"];
const ADMIN_AGENTS = ["seer", "overseer", "pulse", "towncrier"];
const PRACTITIONER_AGENTS = ["gatekeeper", "witness"];
const PRIVATE_MARKER = "private-journal-marker-should-not-cross";
const testUids = new Set();

const VALID_OUTPUTS = {
  scribe: { summary: "A gentle opening.", prompt: "What would feel supportive?", followUp: "You may skip this." },
  anchor: { summary: "A grounding choice.", invitation: "Notice one neutral color.", nextStep: "Continue or stop.", toolId: "breathing" },
  breathkeeper: { summary: "A gentle invitation.", invitation: "Breathe naturally, or use the optional guide.", nextStep: "Stop if it feels uncomfortable.", toolId: "grounding" },
  rhythm: { summary: "One small choice.", invitation: "Take one sip of water.", nextStep: "Pause if that is enough." },
  lantern: { summary: "An urge can rise and fall.", takeaway: "A feeling does not require an action.", nextStep: "Notice what support you want." },
  gardener: { summary: "One practice was recorded.", win: "You chose a practice.", reinforcement: "That is what the count shows.", nextStep: "You may acknowledge it or move on." },
  oracle: { summary: "One gentle next step.", wisdom: "You can choose one manageable thing and leave the rest for later." },
  cherubim: { safe: true, category: "allowed", reason: "", suggestion: "" },
  healer_spiritual: {
    summary: "Optional words for this moment.",
    phrases: ["I can take this one moment at a time.", "I can ask for support when I choose.", "I can leave this thought unfinished.", "I can make room for how I feel."],
  },
  cartographer: { overview: "A small map based on your selected preferences.", helpfulSupports: ["one small practical step"] },
  bridge: { summary: "Prepare a question to ask.", openingLine: "Hi, I would like to learn what support may be available.", questions: ["What services can I ask about?"], nextStep: "You can edit this before using it." },
  mirror: { summary: "A reflection of your words.", reflection: "You described a difficult moment.", question: "What feels most useful to notice?" },
  shepherd: { summary: "Explore at your pace.", invitation: "You can look around without joining.", nextStep: "Choose later if you want." },
  compass: { summary: "A choice connected to what matters to you.", value: "Rest", choice: "You could take a short pause.", nextStep: "Change or skip this option whenever you like." },
  translator: { translation: "Una urgencia puede aparecer y cambiar con el tiempo." },
  hearth: { summary: "A quiet moment of company.", invitation: "You can sit with this without needing to explain.", nextStep: "You may pause or choose another kind of support." },
  lighthouse: { reflection: "You noticed an urge beginning to build.", option: "You could pause and choose what feels manageable.", supportStep: "If useful, consider contacting someone you trust." },
  steward: { answer: "You control what each connected practitioner can access in sharing settings." },
  seer: { summary: "The aggregate snapshot shows limited recent activity.", insights: ["The snapshot is a point-in-time view."], nextCheck: "Refresh the operations snapshot." },
  overseer: { summary: "Review the current operational signal.", steps: ["Check the snapshot age.", "Review the aggregate counts."], evidenceLimit: "This snapshot cannot establish member outcomes." },
  pulse: { summary: "The measured service health is available.", healthStatus: "healthy", nextCheck: "Refresh the service snapshot when needed." },
  towncrier: { title: "Service update draft", message: "A service update is ready for review.", reviewNote: "Confirm details before publishing." },
  gatekeeper: { openingQuestion: "What kind of support would feel useful to discuss?", nextStep: "You could review one possible next step together.", preferenceCheck: "Would you like to explore this option?" },
};

const ADDITIONAL_CLIENT_REQUESTS = {
  oracle: { question: "What is one next step?" },
  cherubim: { content: "I would like to ask my peer group for support." },
  healer_spiritual: { concern: "shame" },
  cartographer: { situations: ["uncertainty"], helps: ["one_step"], avoid: [] },
  bridge: { category: "programs", contactMethod: "website" },
  mirror: { content: "Today was difficult, and I am trying to take it one step at a time." },
  shepherd: { preference: "browse_first" },
  compass: { values: ["Rest"], selectedMove: "hands-busy" },
  translator: { topicId: "cravings-and-urges", language: "es" },
  hearth: { choice: "quiet-company" },
  lighthouse: { cue: "urge-building" },
  steward: { topicId: "sharing" },
};

const ADMIN_REQUESTS = {
  seer: { telemetry: { snapshotAgeSeconds: 24, agentExecutions: 12, errorRatePercent: 1.5, avgResponseTimeMs: 520, activeUsers24h: 7, checkinsLast7Days: 18, reflection: PRIVATE_MARKER } },
  overseer: { goal: "agent-health", state: { snapshotAgeSeconds: 24, agentExecutions: 12, errorRatePercent: 1.5, avgResponseTimeMs: 520, enabledHandlers: 25, implementedHandlers: 25, healthRecord: PRIVATE_MARKER } },
  pulse: { metrics: { systemHealth: "healthy", agentExecutions: 12, errorRate: 1.5, avgResponseTime: 520, reflections: PRIVATE_MARKER } },
  towncrier: { updateType: "maintenance", audience: "practitioners", details: PRIVATE_MARKER },
};

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    send(body) { this.body = body; return this; },
  };
}

async function createEmulatorIdentity(label) {
  const email = `wellnesscafe-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;
  const response = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Test-only-password-482!", returnSecureToken: true }),
  });
  const result = await response.json();
  assert.equal(response.ok, true, `Auth Emulator should create a test identity: ${JSON.stringify(result)}`);
  testUids.add(result.localId);
  return { uid: result.localId, idToken: result.idToken, email, password: "Test-only-password-482!" };
}

async function createScopedIdentity(label, scopes) {
  const identity = await createEmulatorIdentity(label);
  await db.collection("admin_access_assignments").doc(identity.uid).set({ active: true, scopes, expiresAt: null });
  return identity;
}

async function createVerifiedProviderIdentity(label, providerType = "therapist") {
  const identity = await createEmulatorIdentity(label);
  await admin.auth().updateUser(identity.uid, { emailVerified: true });
  await db.doc(`users/${identity.uid}`).set({
    role: "provider", providerType, practitionerWorkspaceActive: true,
  });
  const response = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: identity.email, password: identity.password, returnSecureToken: true }),
  });
  const result = await response.json();
  assert.equal(response.ok, true, `Auth Emulator should refresh the verified provider identity: ${JSON.stringify(result)}`);
  identity.idToken = result.idToken;
  return identity;
}

async function postAgent({ identity, agent, body = {}, authenticated = true }) {
  const response = responseRecorder();
  const req = {
    method: "POST",
    headers: {
      host: "localhost",
      ...(authenticated ? { authorization: `Bearer ${identity.idToken}` } : {}),
    },
    body: { mode: "agent", agent, ...body },
  };
  await aiBrain.handleSession(req, response);
  return response;
}

function fakeProviderResponse(output, captured) {
  return async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/chat/completions", "tests must intercept model traffic before it leaves the process");
    captured.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(output) } }] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
}

async function clean() {
  await db.doc("admin/agentControls").delete();
  for (const uid of testUids) {
    await db.collection("admin_access_assignments").doc(uid).delete();
    await db.doc(`users/${uid}`).delete();
    await db.doc(`realHelpProviders/${uid}`).delete();
    await db.doc(`client_practitioner_shares/shared-client_${uid}`).delete();
    const assignments = await db.collection("clientProviderAssignments").where("providerId", "==", uid).get();
    if (!assignments.empty) {
      const assignmentBatch = db.batch();
      assignments.docs.forEach((doc) => assignmentBatch.delete(doc.ref));
      await assignmentBatch.commit();
    }
    const checkins = await db.collection("checkins").where("userId", "==", `shared-client_${uid}`).get();
    if (!checkins.empty) {
      const checkinBatch = db.batch();
      checkins.docs.forEach((doc) => checkinBatch.delete(doc.ref));
      await checkinBatch.commit();
    }
    const audits = await db.collection("practitioner_data_access_audit").where("actorUid", "==", uid).get();
    if (!audits.empty) {
      const auditBatch = db.batch();
      audits.docs.forEach((doc) => auditBatch.delete(doc.ref));
      await auditBatch.commit();
    }
    await db.doc(`aiSessionRateLimits/${uid}`).delete();
    await admin.auth().deleteUser(uid).catch(() => {});
  }
  testUids.clear();
  for (const [collection, field] of [["agent_events", "agentId"], ["agentExecutions", "agent"]]) {
    for (const agent of [...CLIENT_WORKFLOW_AGENTS, ...ADMIN_AGENTS]) {
      const snapshot = await db.collection(collection).where(field, "==", agent).get();
      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    }
  }
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  assert.ok(process.env.FIREBASE_AUTH_EMULATOR_HOST, "Run this suite through the Auth emulator");
  await clean();
});

beforeEach(clean);

after(async () => {
  await clean();
  await admin.app().delete();
  if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = originalApiKey;
});

test("authenticated client requests reach all six shared workflows using only the selected question", async () => {
  const originalFetch = global.fetch;
  const captured = [];
  try {
    const identities = new Map(await Promise.all(AGENTS.map(async (agent) => [agent, await createEmulatorIdentity(agent)])));
    for (const agent of AGENTS) {
      const providerMock = fakeProviderResponse(VALID_OUTPUTS[agent], captured);
      global.fetch = (url, options) => String(url).includes("api.openai.com/v1/chat/completions")
        ? providerMock(url, options)
        : originalFetch(url, options);
      const question = `A short selected request for ${agent}.`;
      const response = await postAgent({
        identity: identities.get(agent),
        agent,
        body: { question, privateJournal: PRIVATE_MARKER, history: PRIVATE_MARKER, memory: PRIVATE_MARKER },
      });

      assert.equal(response.statusCode, 200, `${agent} should complete through the authenticated handler: ${JSON.stringify(response.body)}`);
      assert.equal(response.body.success, true);
      assert.equal(response.body.agent, agent);
      assert.equal(captured.at(-1).messages.find((message) => message.role === "user").content, question);
      assert.equal(JSON.stringify(captured.at(-1)).includes(PRIVATE_MARKER), false);
      assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);
      if (agent === "anchor") assert.equal(response.body.result.toolId, "grounding");
      if (agent === "breathkeeper") assert.equal(response.body.result.toolId, "breathing");
      assert.equal(Object.hasOwn(response.body.result, "privateJournal"), false);
    }
    assert.equal(captured.length, AGENTS.length);
  } finally {
    global.fetch = originalFetch;
  }
});

test("authenticated chat with an image reaches the model with image guidance and no server error", async () => {
  const identity = await createEmulatorIdentity("chat-image");
  const originalFetch = global.fetch;
  const captured = [];
  const imageDataUrl = "data:image/jpeg;base64,/9j/2Q==";
  global.fetch = (url, options) => String(url).includes("api.openai.com/v1/chat/completions")
    ? fakeProviderResponse("A warm, appealing description can focus on her towel-wrapped hair, brown ribbed top, and relaxed selfie setting.", captured)(url, options)
    : originalFetch(url, options);

  try {
    const response = responseRecorder();
    await aiBrain.handleSession({
      method: "POST",
      headers: { host: "localhost", authorization: `Bearer ${identity.idToken}` },
      body: {
        prompt: "How do I describe her in an appealing way?",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "How do I describe her in an appealing way?" },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "auto" } },
          ],
        }],
      },
    }, response);

    assert.equal(response.statusCode, 200, `image chat should return a successful response: ${JSON.stringify(response.body)}`);
    assert.equal(response.body.ok, true);
    assert.equal(captured.length, 1);
    const modelMessages = captured[0].messages;
    assert.match(modelMessages[0].content, /An image is attached to this conversation/);
    const userMessage = modelMessages.find((message) => message.role === "user");
    assert.ok(Array.isArray(userMessage.content));
    assert.equal(userMessage.content.some((part) => part.type === "image_url" && part.image_url.url === imageDataUrl), true);
  } finally {
    global.fetch = originalFetch;
  }
});

test("authenticated client workflows pass the specialist contracts with bounded selected context", async () => {
  const originalFetch = global.fetch;
  const captured = [];
  try {
    const identities = new Map(await Promise.all(ADDITIONAL_CLIENT_AGENTS.map(async (agent) => [agent, await createEmulatorIdentity(agent)])));
    for (const agent of ADDITIONAL_CLIENT_AGENTS) {
      const providerMock = fakeProviderResponse(VALID_OUTPUTS[agent], captured);
      global.fetch = (url, options) => String(url).includes("api.openai.com/v1/chat/completions")
        ? providerMock(url, options)
        : originalFetch(url, options);
      const response = await postAgent({
        identity: identities.get(agent),
        agent,
        body: { ...ADDITIONAL_CLIENT_REQUESTS[agent], privateJournal: PRIVATE_MARKER, history: PRIVATE_MARKER },
      });

      assert.equal(response.statusCode, 200, `${agent} should complete through the authenticated handler: ${JSON.stringify(response.body)}`);
      assert.equal(response.body.success, true);
      assert.equal(response.body.agent, agent);
      assert.equal(JSON.stringify(captured.at(-1)).includes(PRIVATE_MARKER), false, `${agent} must not forward unrelated private fields`);
      assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);
      assert.equal(Object.hasOwn(response.body.result, "privateJournal"), false);
      if (agent === "cherubim") assert.equal(response.body.result.safe, true);
      if (agent === "cartographer") assert.deepEqual(response.body.result.helpfulSupports, ["one small practical step"]);
    }
    assert.equal(captured.length, ADDITIONAL_CLIENT_AGENTS.length);
  } finally {
    global.fetch = originalFetch;
  }
});

test("authenticated operations admins reach all four admin agent workflows with sanitized inputs", async () => {
  const originalFetch = global.fetch;
  const captured = [];
  try {
    const identity = await createScopedIdentity("operations-admin", ["platform.operations.view"]);
    for (const agent of ADMIN_AGENTS) {
      const providerMock = fakeProviderResponse(VALID_OUTPUTS[agent], captured);
      global.fetch = (url, options) => String(url).includes("api.openai.com/v1/chat/completions")
        ? providerMock(url, options)
        : originalFetch(url, options);
      const response = await postAgent({ identity, agent, body: ADMIN_REQUESTS[agent] });
      assert.equal(response.statusCode, 200, `${agent} should complete for its authorized admin identity: ${JSON.stringify(response.body)}`);
      assert.equal(response.body.success, true);
      assert.equal(response.body.agent, agent);
      assert.equal(JSON.stringify(captured.at(-1)).includes(PRIVATE_MARKER), false, `${agent} must exclude member-level/private data`);
      assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);
    }
    assert.equal(captured.length, ADMIN_AGENTS.length);
  } finally {
    global.fetch = originalFetch;
  }
});

test("authenticated client can request an explicitly consented Seer review without exposing journal fields", async () => {
  const identity = await createEmulatorIdentity("client-seer-review");
  const originalFetch = global.fetch;
  const captured = [];
  const review = {
    consent: true,
    selectedFields: ["stress"],
    entries: [
      { date: "2026-10-01", fields: { stress: 3, journal: PRIVATE_MARKER } },
      { date: "2026-10-02", fields: { stress: 5, cravingDetails: PRIVATE_MARKER } },
      { date: "2026-10-03", fields: { stress: 7, userId: PRIVATE_MARKER } },
    ],
  };
  try {
    global.fetch = fakeProviderResponse(VALID_OUTPUTS.seer, captured);
    const response = await postAgent({ identity, agent: "seer", body: { clientPatternReview: review } });
    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.success, true);
    assert.equal(response.body.agent, "seer");
    assert.equal(captured.length, 1);
    const modelInput = JSON.stringify(captured[0]);
    assert.match(modelInput, /2026-10-01/);
    assert.match(modelInput, /stress/);
    assert.equal(modelInput.includes(PRIVATE_MARKER), false);
    assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);

    const invalid = await postAgent({ identity, agent: "seer", body: { clientPatternReview: { ...review, consent: false } } });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.body.error.code, "INVALID_SEER_CLIENT_PATTERN");
    assert.equal(captured.length, 1, "invalid consent must fail before model invocation");
  } finally {
    global.fetch = originalFetch;
  }
});

test("unauthorized users cannot invoke admin intelligence workflows or reach the model", async () => {
  const identity = await createEmulatorIdentity("unscoped-admin");
  const originalFetch = global.fetch;
  let modelCalls = 0;
  global.fetch = async () => { modelCalls += 1; throw new Error("Unauthorized admin request must not call the model"); };
  try {
    for (const agent of ADMIN_AGENTS) {
      const response = await postAgent({ identity, agent, body: ADMIN_REQUESTS[agent] });
      assert.equal(response.statusCode, 403, `${agent} must require an operations scope`);
      assert.equal(response.body.success, false);
      assert.equal(response.body.error.code, "ADMIN_SCOPE_REQUIRED");
    }
    assert.equal(modelCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("verified practitioners use Gatekeeper without sending client records", async () => {
  const originalFetch = global.fetch;
  const captured = [];
  try {
    const identity = await createVerifiedProviderIdentity("gatekeeper-provider");
    const providerMock = fakeProviderResponse(VALID_OUTPUTS.gatekeeper, captured);
    global.fetch = (url, options) => String(url).includes("api.openai.com/v1/chat/completions")
      ? providerMock(url, options)
      : originalFetch(url, options);
    const response = await postAgent({
      identity,
      agent: "gatekeeper",
      body: { pathway: "primary-care", clientName: PRIVATE_MARKER, clientRecord: PRIVATE_MARKER },
    });
    assert.equal(response.statusCode, 200, `Gatekeeper should serve the verified practitioner: ${JSON.stringify(response.body)}`);
    assert.equal(response.body.success, true);
    assert.equal(response.body.agent, "gatekeeper");
    assert.equal(JSON.stringify(captured.at(-1)).includes(PRIVATE_MARKER), false);
    assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);
    assert.equal(captured.length, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Witness reads only allowed client-shared facts and stops after sharing is revoked", async () => {
  const identity = await createVerifiedProviderIdentity("witness-provider");
  const clientId = `shared-client_${identity.uid}`;
  const assignmentId = `shared-assignment_${identity.uid}`;
  const shareRef = db.doc(`client_practitioner_shares/${clientId}_${identity.uid}`);
  const baseTime = Date.UTC(2026, 9, 1, 12);
  await db.doc(`clientProviderAssignments/${assignmentId}`).set({ clientId, providerId: identity.uid, status: "active" });
  await shareRef.set({ assignmentId, scopes: { recoveryProgress: true, wellnessPatterns: false, writtenReflections: false, assessments: false, practiceProgress: false } });
  await db.collection("checkins").add({
    userId: clientId, timestamp: admin.firestore.Timestamp.fromMillis(baseTime), cravingIntensity: 7,
    journal: PRIVATE_MARKER, stress: 9,
  });
  await db.collection("checkins").add({
    userId: clientId, timestamp: admin.firestore.Timestamp.fromMillis(baseTime + 7 * 86400000), cravingIntensity: 4,
    journal: PRIVATE_MARKER, stress: 2,
  });
  await db.doc("admin/agentControls").set({ enabled: { witness: false } });
  const paused = await postAgent({ identity, agent: "witness", body: { clientId } });
  assert.equal(paused.statusCode, 503);
  assert.equal(paused.body.error.code, "AGENT_PAUSED");
  const pausedAudit = await db.collection("practitioner_data_access_audit").where("actorUid", "==", identity.uid).get();
  assert.equal(pausedAudit.size, 0, "a paused Witness must not read or audit client-shared data");
  await db.doc("admin/agentControls").delete();

  const originalFetch = global.fetch;
  let modelCalls = 0;
  global.fetch = async () => { modelCalls += 1; throw new Error("Witness must use consented facts without a model"); };
  try {
    const allowed = await postAgent({ identity, agent: "witness", body: { clientId, journal: PRIVATE_MARKER } });
    assert.equal(allowed.statusCode, 200, `Witness should read the active shared scope: ${JSON.stringify(allowed.body)}`);
    assert.equal(allowed.body.success, true);
    assert.equal(allowed.body.result.available, true);
    assert.deepEqual(allowed.body.result.metrics, [{
      label: "Craving intensity", first: 7, latest: 4, change: -3,
      firstDate: "2026-10-01", latestDate: "2026-10-08", entries: 2,
    }]);
    assert.equal(JSON.stringify(allowed.body.result).includes(PRIVATE_MARKER), false);
    assert.equal(JSON.stringify(allowed.body.result).includes("stress"), false);

    await shareRef.update({ scopes: { recoveryProgress: false, wellnessPatterns: false, writtenReflections: false, assessments: false, practiceProgress: false } });
    const revoked = await postAgent({ identity, agent: "witness", body: { clientId } });
    assert.equal(revoked.statusCode, 200);
    assert.equal(revoked.body.result.available, false);
    assert.equal(Object.hasOwn(revoked.body.result, "metrics"), false);
    assert.equal(JSON.stringify(revoked.body.result).includes(PRIVATE_MARKER), false);
    assert.equal(modelCalls, 0);
    const audit = await db.collection("practitioner_data_access_audit").where("actorUid", "==", identity.uid).get();
    assert.equal(audit.size, 2, "both allowed and revoked reads should remain auditable");
  } finally {
    global.fetch = originalFetch;
  }
});

test("authenticated Sentinel returns its deterministic support route without calling a model", async () => {
  const identity = await createEmulatorIdentity("sentinel");
  const originalFetch = global.fetch;
  let modelCalls = 0;
  global.fetch = async () => { modelCalls += 1; throw new Error("Sentinel must not call a model"); };
  try {
    const response = await postAgent({
      identity,
      agent: "sentinel",
      body: { supportNeed: "need-a-person", message: PRIVATE_MARKER, history: PRIVATE_MARKER },
    });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.agent, "sentinel");
    assert.equal(response.body.result.route, "human-crisis-support");
    assert.equal(JSON.stringify(response.body.result).includes(PRIVATE_MARKER), false);
    assert.equal(modelCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("missing sign-in and invalid requests stop before any model call", async () => {
  const identity = await createEmulatorIdentity("invalid");
  const originalFetch = global.fetch;
  let modelCalls = 0;
  global.fetch = async () => { modelCalls += 1; throw new Error("Model call should not run"); };
  try {
    const signedOut = await postAgent({ identity, agent: "scribe", authenticated: false, body: { question: "A question" } });
    assert.equal(signedOut.statusCode, 401);
    assert.equal(signedOut.body.code, "AUTH_REQUIRED");

    for (const agent of AGENTS) {
      const invalid = await postAgent({ identity, agent, body: { question: " " } });
      assert.equal(invalid.statusCode, 400, `${agent} should reject an empty selection`);
      assert.equal(invalid.body.success, false);
    }
    assert.equal(modelCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("a paused agent returns an unavailable state without reaching the model", async () => {
  await db.doc("admin/agentControls").set({ enabled: { rhythm: false } });
  const identity = await createEmulatorIdentity("paused");
  const originalFetch = global.fetch;
  let modelCalls = 0;
  global.fetch = async () => { modelCalls += 1; throw new Error("Model call should not run"); };
  try {
    const response = await postAgent({ identity, agent: "rhythm", body: { question: "Offer one small optional step." } });
    assert.equal(response.statusCode, 503);
    assert.equal(response.body.error.code, "AGENT_PAUSED");
    assert.equal(modelCalls, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("provider network failures return a safe service error", async () => {
  const identity = await createEmulatorIdentity("provider-failure");
  const originalFetch = global.fetch;
  global.fetch = async () => { throw new Error(`secret-network-detail ${PRIVATE_MARKER}`); };
  try {
    const response = await postAgent({
      identity,
      agent: "lantern",
      body: { question: "Explain this selected topic." },
    });
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.error.code, "AI_PROVIDER_ERROR");
    assert.equal(JSON.stringify(response.body).includes(PRIVATE_MARKER), false);
    assert.equal(JSON.stringify(response.body).includes("secret-network-detail"), false);
  } finally {
    global.fetch = originalFetch;
  }
});
