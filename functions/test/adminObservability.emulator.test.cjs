const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-admin-observability";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const operations = require("../src/agentOperations");
const { handleSession } = require("../aiBrain");
const getSnapshot = operations.getAdminOperationalSnapshot.run;
const getSettings = operations.getAdminSystemSettings.run;
const setSettings = operations.setAdminSystemSettings.run;
const getPublicPracticeAvailability = operations.getPublicPracticeAvailability.run;
const getQueueCounts = operations.getAdminApplicationQueueCounts.run;

const adminRequest = { auth: { uid: "ops-admin", token: { godAdmin: true } }, data: {} };

async function clearCollection(name) {
  const result = await db.collection(name).get();
  if (result.empty) return;
  const batch = db.batch();
  result.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function clean() {
  await Promise.all(["agent_events", "users", "sessions", "user_runtime", "checkins", "practitioner_applications", "community_supporter_applications"].map(clearCollection));
  await db.doc("admin/systemSettings").delete();
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});
beforeEach(clean);
after(async () => {
  await clean();
  await admin.app().delete();
});

test("system snapshot requires an authenticated administrator", async () => {
  await assert.rejects(getSnapshot({ data: {} }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    getSnapshot({ auth: { uid: "client", token: { role: "client" } }, data: {} }),
    (error) => error.code === "permission-denied",
  );
});

test("review queue counts are admin-only aggregates and never return application details", async () => {
  await assert.rejects(getQueueCounts({ data: {} }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    getQueueCounts({ auth: { uid: "client", token: { role: "client" } }, data: {} }),
    (error) => error.code === "permission-denied",
  );

  await Promise.all([
    db.collection("practitioner_applications").doc("pending-one").set({ status: "pending", email: "private@example.test" }),
    db.collection("practitioner_applications").doc("approved").set({ status: "approved" }),
    db.collection("community_supporter_applications").doc("pending-two").set({ status: "pending", email: "private2@example.test" }),
    db.collection("community_supporter_applications").doc("pending-three").set({ status: "pending" }),
  ]);

  const result = await getQueueCounts(adminRequest);
  assert.deepEqual(result, { practitioner: 1, communityGivers: 2 });
  assert.equal(JSON.stringify(result).includes("private@example.test"), false);
});

test("admin snapshot returns metrics and scrubbed event and risk summaries", async () => {
  const now = Date.now();
  await Promise.all([
    db.collection("users").doc("client-1").set({ email: "private@example.test" }),
    db.collection("sessions").doc("session-1").set({ userId: "client-1" }),
    db.collection("checkins").doc("checkin-1").set({
      userId: "client-1", completed: true, timestamp: admin.firestore.Timestamp.fromMillis(now - 2 * 24 * 60 * 60 * 1000),
      journal: "private reflection must never reach the console",
    }),
    db.collection("user_runtime").doc("client-1").set({ lastActiveAt: admin.firestore.Timestamp.fromMillis(now - 60_000) }),
    db.collection("agent_events").doc("success").set({
      agentId: "sentinel", eventType: "agent_execution", success: true, responseTime: 120,
      timestamp: admin.firestore.Timestamp.fromMillis(now - 30_000),
      userId: "client-1", message: "private clinical note", meta: { secret: "never return" },
    }),
    db.collection("agent_events").doc("risk").set({
      agentId: "seer", eventType: "risk_signal", severity: "warning", timestamp: admin.firestore.Timestamp.fromMillis(now - 15_000),
      userId: "client-1", message: "private reflection", meta: { private: true },
    }),
    db.collection("agent_events").doc("failure").set({
      agentId: "oracle", eventType: "agent_execution_error", success: false, errorCode: "PROVIDER_UNAVAILABLE",
      responseTime: 300, timestamp: admin.firestore.Timestamp.fromMillis(now - 10_000),
      userId: "client-1", message: "private context",
    }),
  ]);

  const result = await getSnapshot(adminRequest);
  assert.equal(result.metrics.totalUsers, 1);
  assert.equal(result.metrics.activeUsers, 1);
  assert.equal(result.metrics.totalSessions, 1);
  assert.equal(result.metrics.totalCheckins, 1);
  assert.equal(result.metrics.checkinsLast7Days, 1);
  assert.equal(result.metrics.agentExecutions, 2);
  assert.equal(result.metrics.errorRate, 50);
  assert.equal(result.riskRadar.warningCount, 1);
  assert.equal(result.riskRadar.totalEvents, 1);
  assert.equal(result.agentMetrics.sentinel.runCount, 1);
  assert.equal(result.agentMetrics.sentinel.avgResponseTime, 120);
  assert.equal(result.agentMetrics.sentinel.health, "healthy");
  assert.equal(result.agentMetrics.oracle.errorCount, 1);
  assert.equal(result.events.length, 3);
  assert.equal(result.events.some((event) => "userId" in event || "message" in event || "meta" in event), false);
  assert.equal(JSON.stringify(result).includes("private@example.test"), false);
  assert.equal(JSON.stringify(result).includes("private clinical note"), false);
  assert.equal(JSON.stringify(result).includes("private reflection must never reach the console"), false);
});

test("empty operational data is a truthful zero with unmeasured health", async () => {
  const result = await getSnapshot(adminRequest);
  assert.equal(result.metrics.totalUsers, 0);
  assert.equal(result.metrics.agentExecutions, 0);
  assert.equal(result.metrics.totalCheckins, 0);
  assert.equal(result.metrics.checkinsLast7Days, 0);
  assert.equal(result.metrics.systemHealth, "not_measured");
  assert.equal(result.metrics.avgResponseTime, null);
  assert.equal(result.riskRadar.totalEvents, 0);
  assert.equal(result.riskRadar.dailyCounts.length, 7);
});

test("Risk Radar setting gates risk signals while retaining the operational event feed", async () => {
  const now = Date.now();
  await setSettings({ ...adminRequest, data: { settings: { features: { riskRadar: false } } } });
  await Promise.all([
    db.collection("agent_events").doc("hidden-risk").set({
      agentId: "seer", eventType: "risk_signal", severity: "critical",
      timestamp: admin.firestore.Timestamp.fromMillis(now - 5_000), message: "private risk detail",
    }),
    db.collection("agent_events").doc("visible-run").set({
      agentId: "sentinel", eventType: "agent_execution", success: true,
      timestamp: admin.firestore.Timestamp.fromMillis(now - 4_000),
    }),
  ]);

  const result = await getSnapshot(adminRequest);
  assert.equal(result.riskRadarEnabled, false);
  assert.equal(result.riskRadar.totalEvents, 0);
  assert.equal(result.riskRadar.criticalCount, 0);
  assert.equal(result.events.some((event) => event.eventType === "risk_signal"), false);
  assert.equal(result.events.some((event) => event.eventType === "agent_execution"), true);
  assert.equal(JSON.stringify(result).includes("private risk detail"), false);
});

test("system settings require admin and persist a validated account-wide snapshot", async () => {
  await assert.rejects(getSettings({ data: {} }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    setSettings({ auth: { uid: "client", token: { role: "client" } }, data: { settings: {} } }),
    (error) => error.code === "permission-denied",
  );
  assert.equal((await getSettings(adminRequest)).hasSavedSettings, false);
  const settings = {
    features: { riskRadar: false },
    thresholds: { riskLevelLow: 2, riskLevelMedium: 5, riskLevelHigh: 9 },
    notifications: { frequency: "low", quietHours: { enabled: true, start: 21, end: 6 } },
  };
  const saved = await setSettings({ ...adminRequest, data: { settings } });
  assert.equal(saved.saved, true);
  assert.equal(saved.settings.features.riskRadar, false);
  const loaded = await getSettings(adminRequest);
  assert.equal(loaded.hasSavedSettings, true);
  assert.equal(loaded.settings.features.riskRadar, false);
  assert.equal(loaded.settings.features.aiSessions, true);
  assert.equal(loaded.settings.thresholds.riskLevelHigh, 9);
  await assert.rejects(
    setSettings({ ...adminRequest, data: { settings: { thresholds: { riskLevelLow: 8, riskLevelMedium: 4, riskLevelHigh: 9 } } } }),
    (error) => error.code === "invalid-argument",
  );
  await assert.rejects(
    setSettings({ ...adminRequest, data: { settings: { features: { unknownSwitch: true } } } }),
    (error) => error.code === "invalid-argument",
  );
});

test("AI session feature setting defaults on and reads the saved server value", async () => {
  assert.equal(await operations.isProductFeatureEnabled("aiSessions", db), true);
  await setSettings({ ...adminRequest, data: { settings: { features: { aiSessions: false } } } });
  assert.equal(await operations.isProductFeatureEnabled("aiSessions", db), false);
  await assert.rejects(operations.isProductFeatureEnabled("notAFeature", db), /Unknown product feature/);
});

test("public practice availability exposes allowlisted catalog and practitioner discovery flags", async () => {
  assert.deepEqual(await getPublicPracticeAvailability({ data: {} }), { toolsCatalog: true, providersMarketplace: true });
  await setSettings({ ...adminRequest, data: { settings: { features: { toolsCatalog: false, providersMarketplace: false } } } });
  assert.deepEqual(await getPublicPracticeAvailability({ data: {} }), { toolsCatalog: false, providersMarketplace: false });
});

test("paused custom AI sessions stop at the server feature gate", async () => {
  await setSettings({ ...adminRequest, data: { settings: { features: { aiSessions: false } } } });
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "none" })}.${encode({ sub: "test-client" })}.`;
  const response = {
    headers: {},
    set(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
  };

  await handleSession({
    method: "POST",
    headers: { host: "localhost", authorization: `Bearer ${token}` },
    body: { mode: "generate_session", correlationId: "test-paused-session" },
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.code, "AI_SESSIONS_PAUSED");
  assert.match(response.body.error.message, /saved practices and AI Guide remain available/i);
});
