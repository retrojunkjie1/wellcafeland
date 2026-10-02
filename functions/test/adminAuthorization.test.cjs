const test = require("node:test");
const assert = require("node:assert/strict");
const authorization = require("../src/adminAuthorization");

function request(uid = "scoped-admin", token = {}) {
  return { auth: { uid, token } };
}

function firestoreWith(assignment) {
  return {
    collection(name) {
      assert.equal(name, "admin_access_assignments");
      return { doc(uid) { return { async get() { return { exists: Boolean(assignment), data: () => assignment }; } }; } };
    },
  };
}

test("legacy admin and practitioner role claims do not grant God-Eye access", async () => {
  const access = await authorization.getAdminAccess(request("legacy", { admin: true, role: "superadmin" }), firestoreWith(null));
  assert.equal(access.isGodAdmin, false);
  assert.equal(access.active, false);
  await assert.rejects(
    authorization.requireAdminScope(request("legacy", { admin: true, role: "provider_admin" }), "platform.operations.view", undefined, firestoreWith(null)),
    { code: "permission-denied" },
  );
});

test("configured Alpha Owner has all scopes without a legacy admin claim", async () => {
  const priorUid = process.env.ALPHA_OWNER_UID;
  process.env.ALPHA_OWNER_UID = "owner-uid";
  try {
    const access = await authorization.getAdminAccess(request("owner-uid"), firestoreWith(null));
    assert.equal(access.isGodAdmin, true);
    assert.ok(access.scopes.includes("admin.roles.manage"));
    assert.ok(access.scopes.includes("platform.operations.control"));
  } finally {
    if (priorUid === undefined) delete process.env.ALPHA_OWNER_UID;
    else process.env.ALPHA_OWNER_UID = priorUid;
  }
});

test("a scoped assignment grants only its active responsibility and can be revoked immediately", async () => {
  const assignment = { active: true, scopes: ["support.activity.read"], expiresAt: null };
  const access = await authorization.requireAdminScope(request(), "support.activity.read", undefined, firestoreWith(assignment));
  assert.equal(access.uid, "scoped-admin");
  await assert.rejects(
    authorization.requireAdminScope(request(), "platform.operations.view", undefined, firestoreWith(assignment)),
    { code: "permission-denied" },
  );
  await assert.rejects(
    authorization.requireAdminScope(request(), "support.activity.read", undefined, firestoreWith({ ...assignment, active: false })),
    { code: "permission-denied" },
  );
});

test("region-bound responsibilities require an assigned state and reject unrelated regions", async () => {
  const assignment = { active: true, scopes: [], regionalScopes: { "support_directory.manage": ["CO"] }, expiresAt: null };
  await authorization.requireAdminScope(request(), "support_directory.manage", "CO", firestoreWith(assignment));
  await assert.rejects(
    authorization.requireAdminScope(request(), "support_directory.manage", "TX", firestoreWith(assignment)),
    { code: "permission-denied" },
  );
  await assert.rejects(
    authorization.requireAdminScope(request(), "support_directory.manage", undefined, firestoreWith(assignment)),
    { code: "permission-denied" },
  );
});

test("role validation rejects unknown scopes and malformed or mixed regions", () => {
  assert.throws(() => authorization._normalizeScopes(["god-mode"]), { code: "invalid-argument" });
  assert.throws(() => authorization._normalizeScopes(["admin.roles.manage"]), { code: "invalid-argument" });
  assert.deepEqual(authorization._normalizeRegions(["co", "CO"]), ["CO"]);
  assert.throws(() => authorization._normalizeRegions(["Colorado"]), { code: "invalid-argument" });
  assert.throws(() => authorization._normalizeRegions(["*", "CO"]), { code: "invalid-argument" });
});

test("a regional administrator can load an assigned-scope queue without seeing unrelated states", async () => {
  const assignment = { active: true, scopes: [], regionalScopes: { "giving.review": ["CO", "WY"] }, expiresAt: null };
  const access = await authorization.requireAdminScopeForListing(request(), "giving.review", firestoreWith(assignment));
  assert.equal(access.isGodAdmin, false);
  assert.deepEqual(access.regionalScopes["giving.review"], ["CO", "WY"]);
  await assert.rejects(
    authorization.requireAdminScope(request(), "giving.review", "TX", firestoreWith(assignment)),
    { code: "permission-denied" },
  );
});

test("regional queue query uses only the assigned region set", () => {
  const filters = [];
  const query = { where(...args) { filters.push(args); return this; } };
  const access = { isGodAdmin: false, scopes: [], regionalScopes: { "support_directory.manage": ["CO", "WY"] } };
  assert.equal(authorization.constrainQueryToAdminRegions(query, access, "support_directory.manage", "state"), query);
  assert.deepEqual(filters, [["state", "in", ["CO", "WY"]]]);

  const oneRegionFilters = [];
  authorization.constrainQueryToAdminRegions({ where(...args) { oneRegionFilters.push(args); return this; } }, {
    isGodAdmin: false, scopes: [], regionalScopes: { "practitioner.review": ["CO"] },
  }, "practitioner.review", "region");
  assert.deepEqual(oneRegionFilters, [["region", "==", "CO"]]);
  assert.throws(() => authorization.constrainQueryToAdminRegions(query, {
    isGodAdmin: false, scopes: [], regionalScopes: {},
  }, "giving.review", "state"), { code: "permission-denied" });
});

test("verified owner email can bootstrap Alpha Owner when a stable UID is not configured", () => {
  const priorEmail = process.env.ALPHA_OWNER_EMAIL;
  process.env.ALPHA_OWNER_EMAIL = "owner@example.com";
  try {
    assert.equal(authorization.isConfiguredOwner(request("uid", { email: "owner@example.com", email_verified: true })), true);
    assert.equal(authorization.isConfiguredOwner(request("uid", { email: "owner@example.com", email_verified: false })), false);
  } finally {
    if (priorEmail === undefined) delete process.env.ALPHA_OWNER_EMAIL;
    else process.env.ALPHA_OWNER_EMAIL = priorEmail;
  }
});
