const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-admin-access";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const auth = admin.auth();
const access = require("../src/adminUserAccess");
const findAccount = access.findAdminWorkspaceAccount.run;
const grantWorkspace = access.grantPractitionerWorkspace.run;
const listEvents = access.listAdminWorkspaceAccessEvents.run;
const targetEmail = "access-candidate@example.test";

function adminRequest(data = {}) {
  return { auth: { uid: "workspace-admin", token: { godAdmin: true } }, data };
}

async function clean() {
  try {
    const user = await auth.getUserByEmail(targetEmail);
    await auth.deleteUser(user.uid);
  } catch (error) {
    if (error?.code !== "auth/user-not-found") throw error;
  }
  for (const name of ["users", "practitioner_applications", "admin_workspace_access_events"]) {
    const snapshot = await db.collection(name).get();
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((item) => batch.delete(item.ref));
      await batch.commit();
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
});

test("email lookup is admin-only, exact, and returns only account setup fields", async () => {
  const target = await auth.createUser({ email: targetEmail, displayName: "Practice Candidate", emailVerified: true });
  await db.collection("users").doc(target.uid).set({ role: "client", roles: ["client"] });
  await db.collection("practitioner_applications").doc(target.uid).set({ status: "pending", bio: "private draft" });

  await assert.rejects(findAccount({ data: { email: targetEmail } }), (error) => error.code === "unauthenticated");
  await assert.rejects(
    findAccount({ auth: { uid: "client", token: { role: "client" } }, data: { email: targetEmail } }),
    (error) => error.code === "permission-denied",
  );
  const result = await findAccount(adminRequest({ email: targetEmail.toUpperCase() }));
  assert.equal(result.found, true);
  assert.equal(result.account.email, targetEmail);
  assert.equal(result.account.applicationStatus, "pending");
  assert.equal("bio" in result.account, false);
  assert.deepEqual((await findAccount(adminRequest({ email: "nobody@example.test" }))), { found: false });
});

test("an admin grants workspace access without publishing a practitioner profile and records an audit", async () => {
  const target = await auth.createUser({ email: targetEmail, displayName: "Practice Candidate", emailVerified: true });
  await db.collection("users").doc(target.uid).set({ role: "client", roles: ["client"], workspaceIntent: "client" });

  await assert.rejects(
    grantWorkspace({ auth: { uid: "client", token: { role: "client" } }, data: { email: targetEmail, providerType: "yoga" } }),
    (error) => error.code === "permission-denied",
  );
  await assert.rejects(
    grantWorkspace(adminRequest({ email: targetEmail, providerType: "administrator" })),
    (error) => error.code === "invalid-argument",
  );

  const result = await grantWorkspace(adminRequest({ email: targetEmail, providerType: "yoga" }));
  assert.equal(result.ok, true);
  assert.equal(result.account.providerType, "yoga");
  assert.equal(result.requiresSignInRefresh, true);
  assert.equal(result.profilePublished, false);
  const updatedAuth = await auth.getUser(target.uid);
  assert.equal(updatedAuth.customClaims.provider, true);
  assert.equal(updatedAuth.customClaims.role, "provider");
  assert.deepEqual(new Set(updatedAuth.customClaims.roles), new Set(["client", "provider"]));
  const userData = (await db.collection("users").doc(target.uid).get()).data();
  assert.equal(userData.role, "provider");
  assert.deepEqual(new Set(userData.roles), new Set(["client", "provider"]));
  assert.equal((await db.collection("realHelpProviders").doc(target.uid).get()).exists, false);
  const audit = await db.collection("admin_workspace_access_events").get();
  assert.equal(audit.size, 1);
  assert.equal(audit.docs[0].get("actorUid"), "workspace-admin");
  assert.equal(audit.docs[0].get("targetUid"), target.uid);
  assert.equal(audit.docs[0].get("providerType"), "yoga");
});

test("recent grant history is admin-only, deduplicated, and exposes application status only", async () => {
  const target = await auth.createUser({ email: targetEmail, displayName: "Practice Candidate" });
  await db.collection("admin_workspace_access_events").doc("older-grant").set({
    actorUid: "workspace-admin", targetUid: target.uid, targetEmail, providerType: "yoga",
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-20T00:00:00Z")),
  });
  await db.collection("admin_workspace_access_events").doc("latest-grant").set({
    actorUid: "workspace-admin", targetUid: target.uid, targetEmail, providerType: "counselor",
    createdAt: admin.firestore.Timestamp.fromDate(new Date("2026-09-21T00:00:00Z")),
  });
  await db.collection("practitioner_applications").doc(target.uid).set({ status: "pending", bio: "private application details" });

  await assert.rejects(listEvents({ auth: { uid: "client", token: { role: "client" } }, data: {} }), (error) => error.code === "permission-denied");
  const result = await listEvents(adminRequest());
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].eventId, "latest-grant");
  assert.equal(result.events[0].providerType, "counselor");
  assert.equal(result.events[0].applicationStatus, "pending");
  assert.equal("uid" in result.events[0], false);
  assert.equal("bio" in result.events[0], false);
});

test("an admin account can add practitioner access while preserving admin roles; disabled accounts stay blocked", async () => {
  const adminTarget = await auth.createUser({ email: targetEmail, displayName: "Admin Account" });
  await auth.setCustomUserClaims(adminTarget.uid, { admin: true, role: "admin" });
  const result = await grantWorkspace(adminRequest({ email: targetEmail, providerType: "therapist" }));
  assert.equal(result.ok, true);
  assert.equal(result.account.isAdmin, true);
  assert.equal(result.account.alreadyHasPractitionerAccess, true);
  assert.equal(result.profilePublished, false);
  const updatedAuth = await auth.getUser(adminTarget.uid);
  assert.equal(updatedAuth.customClaims.admin, true);
  assert.equal(updatedAuth.customClaims.role, "admin");
  assert.equal(updatedAuth.customClaims.provider, true);
  assert.deepEqual(new Set(updatedAuth.customClaims.roles), new Set(["admin", "client", "provider"]));
  const userData = (await db.collection("users").doc(adminTarget.uid).get()).data();
  assert.equal(userData.role, "admin");
  assert.deepEqual(new Set(userData.roles), new Set(["admin", "client", "provider"]));
  assert.equal(userData.workspaceIntent, "admin");

  await auth.deleteUser(adminTarget.uid);
  await db.collection("users").doc(adminTarget.uid).delete();
  await auth.createUser({ email: targetEmail, disabled: true });
  await assert.rejects(
    grantWorkspace(adminRequest({ email: targetEmail, providerType: "therapist" })),
    (error) => error.code === "failed-precondition",
  );
});
