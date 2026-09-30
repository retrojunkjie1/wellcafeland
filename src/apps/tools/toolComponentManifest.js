// Keep this lightweight manifest separate so catalog completeness can be
// verified without initializing app services such as Firebase.
export const TOOL_COMPONENT_MANIFEST = Object.freeze({
  breathing: "BreathingTool",
  grounding: "GroundingTool",
  journaling: "JournalingTool",
  "urge-surfing": "UrgeSurfingTool",
  cravings: "UrgeSurfingTool",
  "body-scan": "BodyScanTool",
  "self-surgeon": "SelfSurgeonTool",
  education: "EducationModule",
  meditation: "MeditationTool",
  acuwellness: "AcuwellnessTool",
  affirmations: "AffirmationsTool",
  "emotion-regulator": "SpecializedPathwayTool",
  "shame-release": "SpecializedPathwayTool",
  "sleep-reset": "SpecializedPathwayTool",
  "low-energy-plan": "LowEnergyPlanTool",
});

export function createToolComponentRegistry(implementations, manifest = TOOL_COMPONENT_MANIFEST) {
  return Object.fromEntries(Object.entries(manifest).map(([toolId, implementationName]) => {
    const component = implementations[implementationName];
    if (!component) {
      throw new Error(`Practice "${toolId}" points to missing screen implementation "${implementationName}".`);
    }
    return [toolId, component];
  }));
}
