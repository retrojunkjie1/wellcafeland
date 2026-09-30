const test = require("node:test");
const assert = require("node:assert/strict");
const { addCommunityGiverRole } = require("../src/workspaceRoles");

test("approved community giver keeps client and practitioner roles on the same account", () => {
  const result = addCommunityGiverRole({ role: "provider", roles: ["client", "provider"] });
  assert.equal(result.role, "provider");
  assert.deepEqual(new Set(result.roles), new Set(["client", "provider", "giver"]));
});

test("approved community giver retains admin role and other workspace capabilities", () => {
  const result = addCommunityGiverRole({ role: "admin", roles: ["admin", "provider"] });
  assert.equal(result.role, "admin");
  assert.deepEqual(new Set(result.roles), new Set(["admin", "provider", "giver"]));
});

test("new giver account receives client and giver workspace roles", () => {
  const result = addCommunityGiverRole({});
  assert.equal(result.role, "client");
  assert.deepEqual(new Set(result.roles), new Set(["client", "giver"]));
});
