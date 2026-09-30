const assert = require("node:assert/strict");
const test = require("node:test");
const { composePractitionerRoleGrant } = require("../src/adminUserAccess");

test("practitioner role grant adds provider and client roles without changing a client's intent", () => {
  const result = composePractitionerRoleGrant({ role: "client", roles: ["client"] }, { workspaceIntent: "client" }, "yoga");

  assert.equal(result.isAdminAccount, false);
  assert.equal(result.primaryRole, "provider");
  assert.equal(result.workspaceIntent, "practitioner");
  assert.deepEqual(new Set(result.roles), new Set(["client", "provider"]));
  assert.equal(result.claims.providerType, "yoga");
});

test("an administrator claim is retained as a switchable role and remains the default workspace", () => {
  const result = composePractitionerRoleGrant({ admin: true, role: "admin" }, {}, "therapist");

  assert.equal(result.isAdminAccount, true);
  assert.equal(result.primaryRole, "admin");
  assert.equal(result.workspaceIntent, "admin");
  assert.deepEqual(new Set(result.roles), new Set(["admin", "client", "provider"]));
  assert.equal(result.claims.admin, true);
  assert.equal(result.claims.provider, true);
});

test("existing roles and custom claims survive practitioner access grants", () => {
  const result = composePractitionerRoleGrant(
    { role: "superadmin", roles: ["superadmin", "client"], admin: true, auditScope: "all" },
    { roles: ["philanthropist"], workspaceIntent: "practitioner" },
    "community-supporter",
  );

  assert.equal(result.primaryRole, "superadmin");
  assert.equal(result.workspaceIntent, "practitioner");
  assert.deepEqual(new Set(result.roles), new Set(["superadmin", "client", "philanthropist", "provider"]));
  assert.equal(result.claims.auditScope, "all");
  assert.equal(result.claims.admin, true);
});
