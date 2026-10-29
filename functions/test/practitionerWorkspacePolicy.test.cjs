const test = require("node:test");
const assert = require("node:assert/strict");
const { CURRENT_PROVIDER_TYPES, getProviderCapabilities } = require("../src/practitionerWorkspacePolicy");

test("case managers can coordinate a client-shared practical-help request only", () => {
  assert.ok(CURRENT_PROVIDER_TYPES.includes("case-manager"));
  const capabilities = getProviderCapabilities("case-manager");
  assert.ok(capabilities.has("provider.connections.read"));
  assert.ok(capabilities.has("provider.appointments.read"));
  assert.ok(capabilities.has("client.care_handoffs.read"));
  assert.ok(capabilities.has("client.care_handoffs.update"));
  for (const capability of [
    "client.shared.recovery_progress.read",
    "client.shared.wellness_patterns.read",
    "client.shared.written_reflections.read",
    "client.shared.assessments.read",
    "client.shared.practice_progress.read",
    "client.visit_preparation.read",
    "client.support_tool.send",
    "client.messages.exchange",
  ]) assert.equal(capabilities.has(capability), false, `${capability} must stay outside case-manager scope`);
});

test("resource navigators use the same narrow care-coordination capability set", () => {
  assert.deepEqual(getProviderCapabilities("resource-navigator"), getProviderCapabilities("case-manager"));
});

test("primary care can review patient-shared visit preparation but not clinical records", () => {
  const capabilities = getProviderCapabilities("primary-care");
  assert.ok(capabilities.has("client.visit_preparation.read"));
  assert.ok(capabilities.has("client.visit_preparation.acknowledge"));
  assert.ok(capabilities.has("provider.appointments.read"));
  for (const capability of [
    "client.shared.recovery_progress.read",
    "client.shared.wellness_patterns.read",
    "client.shared.written_reflections.read",
    "client.shared.assessments.read",
    "client.care_handoffs.read",
    "client.support_tool.send",
    "client.messages.exchange",
  ]) assert.equal(capabilities.has(capability), false, `${capability} must stay outside primary-care scope`);
});

test("unknown practitioner service types remain fail-closed", () => {
  assert.equal(getProviderCapabilities("probation-officer").size, 0);
});
