const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../src");
const protectedCallables = [
  ["foodDirectory.js", "foodDirectoryLookup"],
  ["practitionerRegistry.js", "searchPublicPractitionerDirectory"],
  ["helpDirectory.js", "searchPublicHelpListings"],
  ["adminAuthorization.js", "getMyAdminAccess"],
  ["adminAuthorization.js", "listAdminAssignments"],
  ["adminAuthorization.js", "listAdminAssignmentAudit"],
  ["adminAuthorization.js", "setAdminAssignment"],
  ["adminUserAccess.js", "findAdminWorkspaceAccount"],
  ["adminUserAccess.js", "listAdminWorkspaceAccessEvents"],
  ["adminUserAccess.js", "grantPractitionerWorkspace"],
  ["agentOperations.js", "getAdminAgentControls"],
  ["agentOperations.js", "setAdminAgentControl"],
  ["agentOperations.js", "getAdminOperationalSnapshot"],
  ["agentOperations.js", "getAdminApplicationQueueCounts"],
  ["agentOperations.js", "getAdminSystemSettings"],
  ["agentOperations.js", "getPublicPracticeAvailability"],
  ["agentOperations.js", "setAdminSystemSettings"],
  ["securitySignals.js", "listOpenAccountSecuritySignals"],
  ["securitySignals.js", "reviewAccountSecuritySignal"],
  ["supportActivity.js", "recordSupportActivity"],
  ["supportActivity.js", "listSupportActivityForAdmin"],
];

// Every callable in these modules either handles a private account workflow,
// practitioner/client records, or administrative directory operations.
// Keep module-level coverage so a new callable cannot silently bypass App Check.
const protectedModules = [
  "buildClinicalPlan.js",
  "communitySupport.js",
  "helpDirectory.js",
  "practitionerCare.js",
  "practitionerConnections.js",
  "practitionerMessaging.js",
  "practitionerRegistry.js",
  "providerScheduling.js",
  "recoveryMeetingSources.js",
];

const legacyOwnerOnlyCallables = [
  "adminGetOverview",
  "adminListUsers",
  "adminSetClaims",
  "adminUpdateFeatureFlags",
  "adminUpdateSystemSettings",
  "setUserRole",
  "revokeUserSessions",
  "disableUser",
  "resetUserState",
  "adminExecuteAction",
  "manualIngestResources",
  "seedVerifiedProviders",
];

for (const [file, callable] of protectedCallables) {
  test(`${callable} requires Firebase App Check`, () => {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    const declaration = new RegExp(
      `${callable}\\s*=\\s*onCall\\(\\s*\\{[^}]*enforceAppCheck\\s*:\\s*true`,
      "s",
    );
    assert.match(source, declaration);
  });
}

for (const file of protectedModules) {
  test(`${file} requires Firebase App Check on every callable`, () => {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    const declarations = [...source.matchAll(/(?:exports\.(\w+)|const\s+(\w+))\s*=\s*onCall\(\s*\{([^}]*)\}/gs)];
    assert.ok(declarations.length > 0, `${file} should declare at least one callable`);
    for (const [, exportedName, localName, options] of declarations) {
      assert.match(options, /enforceAppCheck\s*:\s*true/, `${exportedName || localName} must enforce App Check`);
    }
  });
}

test("legacy v1 administrative callables enforce App Check and Alpha Owner authorization", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../index.js"), "utf8");
  for (const callable of legacyOwnerOnlyCallables) {
    const declaration = new RegExp(
      `exports\\.${callable}\\s*=\\s*functions\\.runWith\\(\\s*\\{[^}]*enforceAppCheck\\s*:\\s*true[^}]*\\}\\s*\\)\\.https\\.onCall\\(`,
      "s",
    );
    assert.match(source, declaration, `${callable} must enforce App Check`);
  }
  assert.equal((source.match(/requireAlphaOwner\(context\);/g) || []).length, legacyOwnerOnlyCallables.length);
  assert.doesNotMatch(source, /requireAdmin\(context\)/);
});

const protectedHttpFiles = [
  "multimodal.js",
  "globalResourceSearch.js",
  "recoveryMeetings.js",
  "linkPreview.js",
];

for (const file of protectedHttpFiles) {
  test(`${file} verifies App Check on protected HTTP requests`, () => {
    const source = fs.readFileSync(path.join(root, file), "utf8");
    assert.match(source, /verifyHttpAppCheck\s*\(/);
  });
}

test("the production Functions package entrypoint is audited, not its sibling", () => {
  const packageJson = require("../package.json");
  assert.equal(packageJson.main, "src/index.js");
  const source = fs.readFileSync(path.resolve(__dirname, "..", packageJson.main), "utf8");
  for (const route of ["multimodalChat", "multimodalTts", "multimodalStt", "globalResourceSearch", "globalResourceSearchV1", "searchRecoveryMeetings", "linkPreview", "aiSession", "aiMedia"]) {
    assert.match(source, new RegExp(`exports\\.${route}\\s*=`), `${route} must be inventoried from the deployed entrypoint`);
  }
  const legacySearch = source.slice(source.indexOf("exports.globalResourceSearchV1 ="));
  assert.match(legacySearch, /verifyHttpAppCheck\s*\(/);
  assert.match(legacySearch, /allowLegacySearchRequest\s*\(/);
  const aiSource = fs.readFileSync(path.resolve(__dirname, "../aiBrain.js"), "utf8");
  assert.equal((aiSource.match(/verifyHttpAppCheck\s*\(req, res\)/g) || []).length, 2,
    "both aiSession and aiMedia handlers must verify App Check");
});

test("secondary v1 HTTP handlers retain their local App Check checks", () => {
  const source = fs.readFileSync(path.resolve(__dirname, "../index.js"), "utf8");
  assert.match(source, /verifyHttpAppCheck\s*\(/);
  const aiSource = fs.readFileSync(path.resolve(__dirname, "../aiBrain.js"), "utf8");
  assert.match(aiSource, /verifyHttpAppCheck\s*\(/);
});
