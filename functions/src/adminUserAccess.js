const admin = require("./firebaseAdminCompat.cjs");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope } = require("./adminAuthorization");
const { CURRENT_PROVIDER_TYPES } = require("./practitionerWorkspacePolicy");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const PROVIDER_TYPES = new Set(CURRENT_PROVIDER_TYPES);

function normalizeEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Enter a valid account email address.");
  }
  return email;
}

function accountSummary(user, userData = {}, application = {}) {
  const claims = user.customClaims || {};
  const roles = new Set(Array.isArray(claims.roles) ? claims.roles : []);
  if (claims.role) roles.add(claims.role);
  if (claims.provider === true) roles.add("provider");
  if (claims.admin === true) roles.add("admin");
  for (const role of Array.isArray(userData.roles) ? userData.roles : []) roles.add(role);
  if (userData.role) roles.add(userData.role);
  const workspaceAccessActive = userData.practitionerWorkspaceActive === false
    ? false
    : claims.provider === true || roles.has("provider") || roles.has("provider_admin");
  if (!workspaceAccessActive) roles.delete("provider");
  const isAdmin = claims.admin === true
    || ["admin", "superadmin", "provider_admin"].some((role) => roles.has(role))
    || userData.isAdmin === true;
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || "",
    emailVerified: user.emailVerified === true,
    disabled: user.disabled === true,
    isAdmin,
    roles: [...roles],
    providerType: workspaceAccessActive ? claims.providerType || userData.providerType || "" : "",
    applicationStatus: application.status || "none",
    workspaceAccessActive,
    alreadyHasPractitionerAccess: workspaceAccessActive,
  };
}

function composePractitionerRoleGrant(currentClaims = {}, userData = {}, providerType) {
  const existingRoles = new Set(Array.isArray(currentClaims.roles) ? currentClaims.roles : []);
  if (currentClaims.role) existingRoles.add(currentClaims.role);
  for (const role of Array.isArray(userData.roles) ? userData.roles : []) existingRoles.add(role);
  if (userData.role) existingRoles.add(userData.role);

  const isAdminAccount = currentClaims.admin === true || userData.isAdmin === true
    || ["admin", "superadmin", "org_admin", "provider_admin"].some((role) => existingRoles.has(role));
  if (isAdminAccount && !["admin", "superadmin", "org_admin", "provider_admin"].some((role) => existingRoles.has(role))) {
    existingRoles.add("admin");
  }
  existingRoles.add("client");
  existingRoles.add("provider");
  const preservedAdminRole = ["admin", "superadmin", "org_admin", "provider_admin"].find((role) => existingRoles.has(role));
  const primaryRole = isAdminAccount ? (preservedAdminRole || "admin") : "provider";

  return {
    isAdminAccount,
    roles: [...existingRoles],
    primaryRole,
    workspaceIntent: isAdminAccount ? (userData.workspaceIntent || "admin") : "practitioner",
    claims: {
      ...currentClaims,
      role: primaryRole,
      roles: [...existingRoles],
      provider: true,
      providerType,
    },
  };
}

async function searchAccount(emailValue, { authApi = admin.auth(), firestore = admin.firestore() } = {}) {
  const email = normalizeEmail(emailValue);
  let user;
  try {
    user = await authApi.getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") return { found: false };
    throw error;
  }
  const [userDoc, applicationDoc] = await Promise.all([
    firestore.collection("users").doc(user.uid).get(),
    firestore.collection("practitioner_applications").doc(user.uid).get(),
  ]);
  return {
    found: true,
    account: accountSummary(user, userDoc.exists ? userDoc.data() : {}, applicationDoc.exists ? applicationDoc.data() : {}),
  };
}

const findAdminWorkspaceAccount = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "workspace.access.manage");
  try {
    return await searchAccount(request.data?.email);
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[adminUserAccess] Account lookup failed", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "That account could not be looked up. Check the address and try again.");
  }
});

const listAdminWorkspaceAccessEvents = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "workspace.access.manage");
  try {
    const snapshot = await db.collection("admin_workspace_access_events")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const latestByTarget = new Map();
    for (const entry of snapshot.docs) {
      const value = entry.data();
      if (!value.targetUid || latestByTarget.has(value.targetUid)) continue;
      latestByTarget.set(value.targetUid, { ...value, eventId: entry.id });
    }
    const events = await Promise.all([...latestByTarget.values()].map(async (event) => {
      const application = await db.collection("practitioner_applications").doc(event.targetUid).get();
      const createdAt = event.createdAt?.toDate?.();
      return {
        eventId: event.eventId,
        email: event.targetEmail || "",
        providerType: event.providerType || "",
        action: event.action || "granted",
        workspaceAccessActive: event.action !== "revoked",
        applicationStatus: application.exists ? application.get("status") || "unknown" : "not-started",
        assignedAt: createdAt ? createdAt.toISOString() : null,
      };
    }));
    return { events };
  } catch (error) {
    console.error("[adminUserAccess] Workspace grant history failed", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Workspace grant history is unavailable. Try refreshing it.");
  }
});

const grantPractitionerWorkspace = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: actorUid } = await requireAdminScope(request, "workspace.access.manage");
  const email = normalizeEmail(request.data?.email);
  const providerType = request.data?.providerType;
  if (!PROVIDER_TYPES.has(providerType)) throw new HttpsError("invalid-argument", "Choose a supported practitioner service.");

  const authApi = admin.auth();
  const firestore = admin.firestore();
  let target;
  try {
    target = await authApi.getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") throw new HttpsError("not-found", "No WellnessCafe account uses that email. Ask them to create an account first.");
    throw new HttpsError("unavailable", "The account could not be checked. Try again.");
  }
  if (target.disabled) throw new HttpsError("failed-precondition", "This account is disabled. Restore the account before assigning workspace access.");

  const currentClaims = target.customClaims || {};
  const userRef = firestore.collection("users").doc(target.uid);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.exists ? userSnapshot.data() : {};
  const grant = composePractitionerRoleGrant(currentClaims, userData, providerType);
  const auditRef = firestore.collection("admin_workspace_access_events").doc();

  try {
    await authApi.setCustomUserClaims(target.uid, grant.claims);
    await userRef.set({
      uid: target.uid,
      email: target.email || email,
      displayName: target.displayName || userData.displayName || "",
      role: grant.primaryRole,
      roles: grant.roles,
      providerId: target.uid,
      providerType,
      practitionerWorkspaceActive: true,
      workspaceIntent: grant.workspaceIntent,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await auditRef.set({
      actorUid,
      targetUid: target.uid,
      targetEmail: target.email || email,
      workspace: "practitioner",
      action: "granted",
      providerType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {
      ok: true,
      account: accountSummary({ ...target, customClaims: grant.claims }, { ...userData, role: grant.primaryRole, roles: grant.roles, providerType }),
      requiresSignInRefresh: true,
      profileStatus: "not_submitted",
      profilePublished: false,
    };
  } catch (error) {
    console.error("[adminUserAccess] Practitioner workspace assignment failed", {
      actorUid,
      targetUid: target.uid,
      code: error?.code || "UNKNOWN",
    });
    throw new HttpsError("unavailable", "Workspace access could not be fully saved. Refresh the account and try again.");
  }
});

const revokePractitionerWorkspace = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid: actorUid } = await requireAdminScope(request, "workspace.access.manage");
  const email = normalizeEmail(request.data?.email);
  const authApi = admin.auth();
  const firestore = admin.firestore();
  let target;
  try {
    target = await authApi.getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") throw new HttpsError("not-found", "No WellnessCafe account uses that email.");
    throw new HttpsError("unavailable", "The account could not be checked. Try again.");
  }

  const userRef = firestore.collection("users").doc(target.uid);
  const userSnapshot = await userRef.get();
  const userData = userSnapshot.exists ? userSnapshot.data() : {};
  const currentClaims = target.customClaims || {};
  const currentRoles = new Set([
    ...(Array.isArray(currentClaims.roles) ? currentClaims.roles : []),
    ...(Array.isArray(userData.roles) ? userData.roles : []),
  ]);
  if (currentClaims.role) currentRoles.add(currentClaims.role);
  if (userData.role) currentRoles.add(userData.role);
  currentRoles.delete("provider");
  if (currentRoles.size === 0) currentRoles.add("client");

  const adminRoles = ["admin", "superadmin", "org_admin", "provider_admin"];
  const isAdminAccount = currentClaims.admin === true || userData.isAdmin === true
    || adminRoles.some((role) => currentRoles.has(role));
  const existingPrimaryRole = userData.role || currentClaims.role || "";
  const primaryRole = existingPrimaryRole !== "provider"
    ? existingPrimaryRole
    : (isAdminAccount ? adminRoles.find((role) => currentRoles.has(role)) || "admin" : "client");
  const claims = { ...currentClaims, role: primaryRole, roles: [...currentRoles], provider: false };
  delete claims.providerType;
  const auditRef = firestore.collection("admin_workspace_access_events").doc();
  const providerType = userData.providerType || currentClaims.providerType || "";

  try {
    // The account record is the server authorization source. Close it first so
    // stale ID tokens cannot keep practitioner callables available if Auth
    // claim refresh or audit persistence encounters an error.
    await userRef.set({
      uid: target.uid,
      role: primaryRole,
      roles: [...currentRoles],
      practitionerWorkspaceActive: false,
      providerType: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    await authApi.setCustomUserClaims(target.uid, claims);
    await auditRef.set({
      actorUid,
      targetUid: target.uid,
      targetEmail: target.email || email,
      workspace: "practitioner",
      action: "revoked",
      providerType,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const updatedUserData = {
      ...userData,
      role: primaryRole,
      roles: [...currentRoles],
      practitionerWorkspaceActive: false,
      providerType: "",
    };
    return {
      ok: true,
      account: accountSummary({ ...target, customClaims: claims }, updatedUserData),
      requiresSignInRefresh: true,
      directoryProfileUnchanged: true,
    };
  } catch (error) {
    console.error("[adminUserAccess] Practitioner workspace revocation failed", {
      actorUid,
      targetUid: target.uid,
      code: error?.code || "UNKNOWN",
    });
    throw new HttpsError("unavailable", "Workspace access was changed incompletely. Refresh the account status before taking another action.");
  }
});

module.exports = {
  findAdminWorkspaceAccount,
  listAdminWorkspaceAccessEvents,
  grantPractitionerWorkspace,
  revokePractitionerWorkspace,
  searchAccount,
  normalizeEmail,
  accountSummary,
  composePractitionerRoleGrant,
  PROVIDER_TYPES,
};
