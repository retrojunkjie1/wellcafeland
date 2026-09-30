const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-security-signals";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const securitySignals = require("../src/securitySignals");
const listSignals = securitySignals.listOpenAccountSecuritySignals.run;
const reviewSignal = securitySignals.reviewAccountSecuritySignal.run;
const { recordAIQuotaBlock, signalId } = securitySignals;

const uid = "security-signal-account";
const adminUid = "trusted-admin";
const signalDocId = signalId(uid, "ai_quota_blocks");

function adminRequest(data = {}) {
  return { auth: { uid: adminUid, token: { godAdmin: true } }, data };
}

async function clean() {
  for (const collectionName of ["account_security_signals", "account_security_signal_reviews"]) {
    const snapshot = await db.collection(collectionName).get();
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  await clean();
});

beforeEach(async () => {
  await clean();
  for (let index = 0; index < 5; index += 1) {
    await recordAIQuotaBlock({ firestore: db, uid, now: Date.now() + index * 6 * 60_000 });
  }
});

after(async () => {
  await clean();
  await admin.app().delete();
});

test("trusted admin can keep an account signal open with a durable review audit", async () => {
  const result = await reviewSignal(adminRequest({ id: signalDocId, outcome: "monitor" }));
  assert.deepEqual(result, { reviewed: true, status: "open" });

  const signal = await db.collection("account_security_signals").doc(signalDocId).get();
  assert.equal(signal.data().status, "open");
  assert.equal(signal.data().reviewOutcome, "monitor");
  const reviews = await db.collection("account_security_signal_reviews").where("signalId", "==", signalDocId).get();
  assert.equal(reviews.size, 1);
  assert.equal(reviews.docs[0].data().reviewedBy, adminUid);
});

test("trusted admin can close a signal and list rejects non-admin access", async () => {
  const result = await reviewSignal(adminRequest({ id: signalDocId, outcome: "false_positive" }));
  assert.deepEqual(result, { reviewed: true, status: "reviewed" });

  const signal = await db.collection("account_security_signals").doc(signalDocId).get();
  assert.equal(signal.data().status, "reviewed");
  await assert.rejects(
    listSignals({ auth: { uid: "ordinary-user", token: { role: "client" } }, data: {} }),
    (error) => error.code === "permission-denied",
  );
});
