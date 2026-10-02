const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

if (!admin.apps.length) admin.initializeApp();

const REGION = "us-central1";
const ACCESS_COLLECTION = "admin_access_assignments";
const AUDIT_COLLECTION = "admin_access_audit";
const MAX_ASSIGNMENT_DAYS = 365;
const ADMIN_AUDIT_LIMIT = 100;
const SCOPES = Object.freeze([
  "admin.roles.manage",
  "platform.operations.view",
  "platform.operations.control",
  "workspace.access.manage",
  "support.activity.read",
  "trust_safety.review",
  "support_directory.manage",
  "meeting_sources.manage",
  "giving.review",
  "practitioner.review",
  "practitioner.directory.manage",
]);
const REGIONAL_SCOPES = new Set(["support_directory.manage", "giving.review", "practitioner.review"]);
const STATE_CODES = new Set(["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"]);
const GLOBAL_SCOPES = new Set([
  "admin.roles.manage",
  "platform.operations.view",
  "platform.operations.control",
  "workspace.access.manage",
  "support.activity.read",
  "practitioner.directory.manage",
  "meeting_sources.manage",
]);

const db = () => admin.firestore();

function cleanEmail(value) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Enter a valid account email address.");
  }
  return email;
}

function isConfiguredOwner(request) {
  const auth = request.auth;
  const token = auth?.token || {};
  if (!auth?.uid) return false;
  if (token.godAdmin === true) return true;

  const ownerUid = (process.env.ALPHA_OWNER_UID || "").trim();
  if (ownerUid && auth.uid === ownerUid) return true;

  const ownerEmail = (process.env.ALPHA_OWNER_EMAIL || "").trim().toLowerCase();
  return Boolean(ownerEmail && token.email_verified === true
    && typeof token.email === "string" && token.email.trim().toLowerCase() === ownerEmail);
}

function requireSignedIn(request) {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Sign in to continue.");
  if (request.auth.token?.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("permission-denied", "Use a verified account to access administration.");
  }
  return request.auth.uid;
}

function normalizeRegions(regions) {
  if (regions === undefined) return [];
  if (!Array.isArray(regions) || regions.length > 25) {
    throw new HttpsError("invalid-argument", "Choose up to 25 service regions.");
  }
  const values = [...new Set(regions.map((region) => typeof region === "string" ? region.trim().toUpperCase() : ""))];
  if (values.includes("*") && values.length > 1) {
    throw new HttpsError("invalid-argument", "Choose all service areas or specific states, not both.");
  }
  if (values.some((region) => region !== "*" && !STATE_CODES.has(region))) {
    throw new HttpsError("invalid-argument", "Choose valid two-letter U.S. state or district codes.");
  }
  return values;
}

function normalizeScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length < 1 || scopes.length > SCOPES.length) {
    throw new HttpsError("invalid-argument", "Choose at least one permitted admin responsibility.");
  }
  const values = [...new Set(scopes)];
  if (values.some((scope) => typeof scope !== "string" || !SCOPES.includes(scope) || scope === "admin.roles.manage")) {
    throw new HttpsError("invalid-argument", "One or more selected responsibilities are not supported.");
  }
  return values;
}

function expiryFromInput(value, now = Date.now()) {
  if (value === undefined || value === null || value === "") return null;
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= now
    || expiry.getTime() > now + MAX_ASSIGNMENT_DAYS * 24 * 60 * 60 * 1000) {
    throw new HttpsError("invalid-argument", "Access expiry must be a future date within one year.");
  }
  return expiry;
}

function hasCurrentExpiry(access, now = Date.now()) {
  if (!access?.expiresAt) return true;
  const expiry = access.expiresAt.toDate ? access.expiresAt.toDate().getTime() : new Date(access.expiresAt).getTime();
  return Number.isFinite(expiry) && expiry > now;
}

async function getAdminAccess(request, firestore = db()) {
  const uid = requireSignedIn(request);
  if (isConfiguredOwner(request)) {
    return {
      uid,
      isGodAdmin: true,
      active: true,
      scopes: SCOPES.filter((scope) => !REGIONAL_SCOPES.has(scope)),
      regionalScopes: Object.fromEntries([...REGIONAL_SCOPES].map((scope) => [scope, ["*"]])),
      expiresAt: null,
    };
  }
  const snapshot = await firestore.collection(ACCESS_COLLECTION).doc(uid).get();
  const assignment = snapshot.exists ? snapshot.data() : null;
  if (!assignment?.active || !hasCurrentExpiry(assignment)) {
    return { uid, isGodAdmin: false, active: false, scopes: [], regionalScopes: {}, expiresAt: null };
  }
  const regionalScopes = {};
  if (assignment.regionalScopes && typeof assignment.regionalScopes === "object") {
    for (const [scope, regions] of Object.entries(assignment.regionalScopes)) {
      if (REGIONAL_SCOPES.has(scope) && Array.isArray(regions)) {
        regionalScopes[scope] = regions.filter((region) => region === "*" || STATE_CODES.has(region));
      }
    }
  }
  return {
    uid,
    isGodAdmin: false,
    active: true,
    scopes: Array.isArray(assignment.scopes) ? assignment.scopes.filter((scope) => SCOPES.includes(scope) && !REGIONAL_SCOPES.has(scope)) : [],
    regionalScopes,
    expiresAt: assignment.expiresAt?.toDate?.()?.toISOString?.() || null,
  };
}

async function requireAdminScope(request, scope, region, firestore = db()) {
  if (!SCOPES.includes(scope)) throw new Error(`Unknown admin authorization scope: ${scope}`);
  const access = await getAdminAccess(request, firestore);
  if (access.isGodAdmin) return access;
  const scopeRegions = access.regionalScopes?.[scope];
  const hasRegionalScope = REGIONAL_SCOPES.has(scope) && Array.isArray(scopeRegions) && scopeRegions.length > 0;
  if (!access.active || (!access.scopes.includes(scope) && !hasRegionalScope)) {
    throw new HttpsError("permission-denied", "Your admin assignment does not include this responsibility.");
  }
  if (hasRegionalScope && !scopeRegions.includes("*")) {
    const requestedRegion = typeof region === "string" ? region.trim().toUpperCase() : "";
    if (!requestedRegion || !scopeRegions.includes(requestedRegion)) {
      throw new HttpsError("permission-denied", "Choose a service region included in your admin assignment.");
    }
  }
  return access;
}

async function requireAdminScopeForListing(request, scope, firestore = db()) {
  if (!SCOPES.includes(scope)) throw new Error(`Unknown admin authorization scope: ${scope}`);
  const access = await getAdminAccess(request, firestore);
  const hasRegionalScope = REGIONAL_SCOPES.has(scope)
    && Array.isArray(access.regionalScopes?.[scope])
    && access.regionalScopes[scope].length > 0;
  if (!access.active || (!access.isGodAdmin && !access.scopes.includes(scope) && !hasRegionalScope)) {
    throw new HttpsError("permission-denied", "Your admin assignment does not include this responsibility.");
  }
  return access;
}

function constrainQueryToAdminRegions(query, access, scope, field) {
  if (access?.isGodAdmin || access?.scopes?.includes(scope)) return query;
  const regions = access?.regionalScopes?.[scope];
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new HttpsError("permission-denied", "Your admin assignment does not include a service region for this responsibility.");
  }
  if (regions.includes("*")) return query;
  if (regions.length === 1) return query.where(field, "==", regions[0]);
  return query.where(field, "in", regions);
}

function requireGodAdmin(request) {
  requireSignedIn(request);
  if (!isConfiguredOwner(request)) {
    throw new HttpsError("permission-denied", "Only the Alpha Owner can manage administrator assignments.");
  }
  return request.auth.uid;
}

const getMyAdminAccess = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  requireSignedIn(request);
  try {
    const access = await getAdminAccess(request);
    return {
      isAdmin: access.active && (access.isGodAdmin || access.scopes.length > 0 || Object.keys(access.regionalScopes || {}).length > 0),
      ...access,
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[adminAuthorization] Access lookup failed", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Administrator access could not be checked. Try again.");
  }
});

const listAdminAssignments = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  requireGodAdmin(request);
  try {
    const records = await db().collection(ACCESS_COLLECTION).orderBy("updatedAt", "desc").limit(200).get();
    const assignments = await Promise.all(records.docs.map(async (record) => {
      const data = record.data();
      let user = null;
      try { user = await admin.auth().getUser(record.id); } catch (error) {
        if (error?.code !== "auth/user-not-found") throw error;
      }
      return {
        uid: record.id,
        email: user?.email || data.email || "",
        displayName: user?.displayName || "",
        emailVerified: user?.emailVerified === true,
        disabled: user?.disabled === true,
        active: data.active === true && hasCurrentExpiry(data),
        scopes: [
          ...(Array.isArray(data.scopes) ? data.scopes.filter((scope) => SCOPES.includes(scope) && !REGIONAL_SCOPES.has(scope)) : []),
          ...Object.keys(data.regionalScopes || {}).filter((scope) => REGIONAL_SCOPES.has(scope)),
        ],
        regionalScopes: Object.fromEntries(Object.entries(data.regionalScopes || {})
          .filter(([scope, regions]) => REGIONAL_SCOPES.has(scope) && Array.isArray(regions))
          .map(([scope, regions]) => [scope, regions.filter((region) => region === "*" || STATE_CODES.has(region))])),
        regions: [...new Set(Object.values(data.regionalScopes || {}).flat())],
        expiresAt: data.expiresAt?.toDate?.()?.toISOString?.() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
      };
    }));
    return { assignments };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[adminAuthorization] Assignment list failed", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Admin assignments could not be loaded. Try again.");
  }
});

const listAdminAssignmentAudit = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  requireGodAdmin(request);
  try {
    const records = await db().collection(AUDIT_COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(ADMIN_AUDIT_LIMIT)
      .get();
    return {
      events: records.docs.map((record) => {
        const data = record.data();
        return {
          id: record.id,
          targetEmail: typeof data.targetEmail === "string" ? data.targetEmail : "",
          action: data.action === "assignment_revoked" ? "assignment_revoked" : "assignment_set",
          scopes: Array.isArray(data.scopes) ? data.scopes.filter((scope) => SCOPES.includes(scope)) : [],
          previousScopes: Array.isArray(data.previousScopes) ? data.previousScopes.filter((scope) => SCOPES.includes(scope)) : [],
          regionalScopes: Object.fromEntries(Object.entries(data.regionalScopes || {})
            .filter(([scope, regions]) => REGIONAL_SCOPES.has(scope) && Array.isArray(regions))
            .map(([scope, regions]) => [scope, regions.filter((region) => region === "*" || STATE_CODES.has(region))])),
          previousRegionalScopes: Object.fromEntries(Object.entries(data.previousRegionalScopes || {})
            .filter(([scope, regions]) => REGIONAL_SCOPES.has(scope) && Array.isArray(regions))
            .map(([scope, regions]) => [scope, regions.filter((region) => region === "*" || STATE_CODES.has(region))])),
          expiresAt: data.expiresAt?.toDate?.()?.toISOString?.() || null,
          reason: typeof data.reason === "string" ? data.reason : "",
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
        };
      }),
      limit: ADMIN_AUDIT_LIMIT,
    };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[adminAuthorization] Assignment audit lookup failed", { uid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Administrator access history could not be loaded. Try again.");
  }
});

const setAdminAssignment = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const actorUid = requireGodAdmin(request);
  const email = cleanEmail(request.data?.email);
  const active = request.data?.active !== false;
  const scopes = active ? normalizeScopes(request.data?.scopes) : [];
  const regions = active ? normalizeRegions(request.data?.regions) : [];
  const globalScopes = scopes.filter((scope) => !REGIONAL_SCOPES.has(scope));
  const regionalScopes = Object.fromEntries(scopes.filter((scope) => REGIONAL_SCOPES.has(scope)).map((scope) => [scope, regions]));
  const expiresAt = active ? expiryFromInput(request.data?.expiresAt) : null;
  const reason = typeof request.data?.reason === "string" ? request.data.reason.trim() : "";
  if (reason.length < 12 || reason.length > 300) {
    throw new HttpsError("invalid-argument", "Add a short reason (12 to 300 characters) for this access change.");
  }
  if (scopes.some((scope) => REGIONAL_SCOPES.has(scope)) && regions.length === 0) {
    throw new HttpsError("invalid-argument", "Choose specific service states or all service areas for location-based responsibilities.");
  }
  if (regions.length && scopes.every((scope) => !REGIONAL_SCOPES.has(scope))) {
    throw new HttpsError("invalid-argument", "Choose at least one location-based responsibility before assigning service regions.");
  }

  let target;
  try { target = await admin.auth().getUserByEmail(email); } catch (error) {
    if (error?.code === "auth/user-not-found") throw new HttpsError("not-found", "No account uses that email address yet.");
    throw new HttpsError("unavailable", "The account could not be verified. Try again.");
  }
  if (active && target.disabled) throw new HttpsError("failed-precondition", "This account is disabled; restore it before assigning admin access.");
  if (active && !target.emailVerified) throw new HttpsError("failed-precondition", "The person must verify this email before admin access can be assigned.");
  if (isConfiguredOwner({ auth: { uid: target.uid, token: {
    ...(target.customClaims || {}), email: target.email, email_verified: target.emailVerified === true,
  } } })) {
    throw new HttpsError("failed-precondition", "The Alpha Owner assignment is managed separately and cannot be changed here.");
  }

  const firestore = db();
  const assignmentRef = firestore.collection(ACCESS_COLLECTION).doc(target.uid);
  const auditRef = firestore.collection(AUDIT_COLLECTION).doc();
  try {
    await firestore.runTransaction(async (transaction) => {
      const currentSnapshot = await transaction.get(assignmentRef);
      const current = currentSnapshot.exists ? currentSnapshot.data() : {};
      const assignment = {
        uid: target.uid,
        email: target.email || email,
        active,
        scopes: globalScopes,
        regionalScopes,
        expiresAt: expiresAt ? admin.firestore.Timestamp.fromDate(expiresAt) : null,
        createdAt: current.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: actorUid,
        reason,
        policyVersion: 1,
      };
      transaction.set(assignmentRef, assignment);
      transaction.create(auditRef, {
        actorUid,
        targetUid: target.uid,
        targetEmail: target.email || email,
        action: active ? "assignment_set" : "assignment_revoked",
        previousActive: current.active === true && hasCurrentExpiry(current),
        previousScopes: Array.isArray(current.scopes) ? current.scopes : [],
        previousRegionalScopes: current.regionalScopes || {},
        previousRegions: Array.isArray(current.regions) ? current.regions : [],
        scopes,
        regionalScopes,
        regions,
        expiresAt: assignment.expiresAt,
        reason,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    return { ok: true, email: target.email || email, active, scopes: globalScopes, regionalScopes, expiresAt: expiresAt?.toISOString() || null };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error("[adminAuthorization] Assignment write failed", { actorUid, targetUid: target.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The admin assignment could not be saved. No access change was confirmed.");
  }
});

module.exports = {
  SCOPES,
  GLOBAL_SCOPES,
  REGIONAL_SCOPES,
  isConfiguredOwner,
  getAdminAccess,
  requireAdminScope,
  requireAdminScopeForListing,
  constrainQueryToAdminRegions,
  requireGodAdmin,
  getMyAdminAccess,
  listAdminAssignments,
  listAdminAssignmentAudit,
  setAdminAssignment,
  _normalizeScopes: normalizeScopes,
  _normalizeRegions: normalizeRegions,
  _expiryFromInput: expiryFromInput,
};
