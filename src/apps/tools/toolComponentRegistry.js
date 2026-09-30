import BreathingTool from "@/apps/tools/modules/BreathingTool";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import JournalingTool from "@/apps/tools/modules/JournalingTool";
import UrgeSurfingTool from "@/apps/tools/modules/UrgeSurfingTool";
import BodyScanTool from "@/apps/tools/modules/BodyScanTool";
import SelfSurgeonTool from "@/apps/tools/modules/SelfSurgeonTool";
import EducationModule from "@/apps/tools/modules/EducationModule";
import MeditationTool from "@/apps/tools/modules/MeditationTool";
import AcuwellnessTool from "@/apps/tools/modules/AcuwellnessTool";
import AffirmationsTool from "@/apps/tools/modules/AffirmationsTool";
import SpecializedPathwayTool from "@/apps/tools/modules/SpecializedPathwayTool";
import LowEnergyPlanTool from "@/apps/tools/modules/LowEnergyPlanTool";
import { createToolComponentRegistry } from "./toolComponentManifest";

const COMPONENT_IMPLEMENTATIONS = {
  BreathingTool,
  GroundingTool,
  JournalingTool,
  UrgeSurfingTool,
  BodyScanTool,
  SelfSurgeonTool,
  EducationModule,
  MeditationTool,
  AcuwellnessTool,
  AffirmationsTool,
  SpecializedPathwayTool,
  LowEnergyPlanTool,
};

const TOOL_COMPONENTS = createToolComponentRegistry(COMPONENT_IMPLEMENTATIONS);

const normalizeToolKey = (value) => String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");

export function resolveToolComponent(...identifiers) {
  for (const identifier of identifiers) {
    const component = TOOL_COMPONENTS[normalizeToolKey(identifier)];
    if (component) return component;
  }
  return null;
}

export default TOOL_COMPONENTS;
