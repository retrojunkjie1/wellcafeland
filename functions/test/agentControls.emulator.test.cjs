const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-agent-controls";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const controls = require("../src/agentOperations");

const getControls = controls.getAdminAgentControls.run;
const setControl = controls.setAdminAgentControl.run;

function adminRequest(data = {}) {
  return { auth: { uid: "ops-admin", token: { godAdmin: true } }, data };
}

async function clean() {
  await db.doc("admin/agentControls").delete();
  const events = await db.collection("admin_agent_control_events").get();
  if (!events.empty) {
    const batch = db.batch();
    events.docs.forEach((event) => batch.delete(event.ref));
    await batch.commit();
  }
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

test("agent controls require a signed-in administrator", async () => {
  await assert.rejects(getControls({ data: {} }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    getControls({ auth: { uid: "client", token: { role: "client" } }, data: {} }),
    (error) => error.code === "permission-denied",
  );
});

test("admins see only production-supported agents and current default states", async () => {
  const result = await getControls(adminRequest());
  assert.deepEqual(result.implementedAgentIds, ["seer", "oracle", "overseer", "sentinel", "healer_spiritual"]);
  assert.equal(result.enabled.seer, true);
  assert.equal(result.enabled.healer_spiritual, true);
  assert.equal(result.enabled.healer_grounding, undefined);
});

test("a control change is persisted, audited, and enforced for subsequent calls", async () => {
  const result = await setControl(adminRequest({ agentId: "seer", enabled: false }));
  assert.deepEqual(result, { agentId: "seer", enabled: false });

  const current = await getControls(adminRequest());
  assert.equal(current.enabled.seer, false);
  assert.equal((await controls.getAgentAvailability("seer", db)).enabled, false);
  assert.equal((await controls.getAgentAvailability("seer", db)).reason, "An administrator has paused this agent.");

  const events = await db.collection("admin_agent_control_events").get();
  assert.equal(events.size, 1);
  assert.equal(events.docs[0].data().actorUid, "ops-admin");
  assert.equal(events.docs[0].data().previousEnabled, true);
  assert.equal(events.docs[0].data().enabled, false);
});

test("unsupported agents and malformed control values are rejected", async () => {
  await assert.rejects(
    setControl(adminRequest({ agentId: "cherubim", enabled: false })),
    (error) => error.code === "invalid-argument",
  );
  await assert.rejects(
    setControl(adminRequest({ agentId: "seer", enabled: "false" })),
    (error) => error.code === "invalid-argument",
  );
  assert.equal((await controls.getAgentAvailability("cherubim", db)).implemented, false);
});
