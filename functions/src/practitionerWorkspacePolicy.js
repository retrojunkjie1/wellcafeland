// Server-owned service taxonomy and capability contract for current
// practitioner workspaces. A provider title or client UI state is never an
// authorization grant; callables must enforce the capability they need.
const CURRENT_PROVIDER_TYPES = Object.freeze([
  "therapist", "counselor", "recovery-coach", "peer-support", "yoga",
  "massage", "bodywork", "acupuncture", "spiritual-counselor", "community-supporter",
  "case-manager", "resource-navigator", "primary-care",
]);

const CAPABILITY_NAMES = Object.freeze([
  "provider.availability.manage",
  "provider.connections.read",
  "provider.connections.manage",
  "provider.appointments.read",
  "provider.appointments.manage",
  "client.shared_overview.read",
  "client.shared.recovery_progress.read",
  "client.shared.wellness_patterns.read",
  "client.shared.written_reflections.read",
  "client.shared.assessments.read",
  "client.shared.practice_progress.read",
  "client.visit_preparation.read",
  "client.visit_preparation.acknowledge",
  "client.care_handoffs.read",
  "client.care_handoffs.update",
  "client.support_tool.send",
  "client.messages.exchange",
]);

const SHARED_DATA_CAPABILITIES = Object.freeze({
  recoveryProgress: "client.shared.recovery_progress.read",
  wellnessPatterns: "client.shared.wellness_patterns.read",
  writtenReflections: "client.shared.written_reflections.read",
  assessments: "client.shared.assessments.read",
  practiceProgress: "client.shared.practice_progress.read",
  visitPreparation: "client.visit_preparation.read",
  careCoordination: "client.care_handoffs.read",
});

const CARE_COORDINATION_PROVIDER_TYPES = new Set(["recovery-coach", "peer-support", "community-supporter", "case-manager", "resource-navigator"]);
const CARE_COORDINATION_CAPABILITIES = new Set(["client.care_handoffs.read", "client.care_handoffs.update"]);
const BASELINE_CAPABILITIES = new Set(CAPABILITY_NAMES.filter((capability) => !CARE_COORDINATION_CAPABILITIES.has(capability)));
// Case managers and resource navigators get the scheduling and connection
// workflow plus consent-gated care handoffs. They do not inherit access to
// check-ins, reflections, assessments, visit preparations, or practice notes.
const CASE_COORDINATION_CAPABILITIES = new Set([
  "provider.availability.manage",
  "provider.connections.read",
  "provider.connections.manage",
  "provider.appointments.read",
  "provider.appointments.manage",
  "client.shared_overview.read",
  "client.care_handoffs.read",
  "client.care_handoffs.update",
]);
const PRIMARY_CARE_CAPABILITIES = new Set([
  "provider.availability.manage",
  "provider.connections.read",
  "provider.connections.manage",
  "provider.appointments.read",
  "provider.appointments.manage",
  "client.shared_overview.read",
  "client.visit_preparation.read",
  "client.visit_preparation.acknowledge",
]);
const CURRENT_TYPE_CAPABILITIES = new Map(
  CURRENT_PROVIDER_TYPES.map((type) => [type,
    type === "primary-care"
      ? new Set(PRIMARY_CARE_CAPABILITIES)
      : type === "case-manager" || type === "resource-navigator"
      ? new Set(CASE_COORDINATION_CAPABILITIES)
      : CARE_COORDINATION_PROVIDER_TYPES.has(type)
        ? new Set([...BASELINE_CAPABILITIES, ...CARE_COORDINATION_CAPABILITIES])
        : new Set(BASELINE_CAPABILITIES)])
);

function getProviderCapabilities(providerType) {
  // Accounts approved before providerType was added retain only their
  // existing practitioner workflows. Unknown, newly added labels fail closed.
  if (!providerType) return new Set(BASELINE_CAPABILITIES);
  return CURRENT_TYPE_CAPABILITIES.get(providerType) || new Set();
}

module.exports = {
  CURRENT_PROVIDER_TYPES,
  CAPABILITY_NAMES,
  SHARED_DATA_CAPABILITIES,
  CARE_COORDINATION_PROVIDER_TYPES,
  getProviderCapabilities,
};
