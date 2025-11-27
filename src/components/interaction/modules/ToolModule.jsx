// src/components/interaction/modules/ToolModule.jsx
// Injected tool modules (breathing, grounding, etc.) in chat

import React from "react";
import BreathingTool from "@/apps/tools/modules/BreathingTool";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import JournalingTool from "@/apps/tools/modules/JournalingTool";
import UrgeSurfingTool from "@/apps/tools/modules/UrgeSurfingTool";
import BodyScanTool from "@/apps/tools/modules/BodyScanTool";

const TOOL_COMPONENTS = {
  breathing: BreathingTool,
  grounding: GroundingTool,
  journaling: JournalingTool,
  "urge-surfing": UrgeSurfingTool,
  "body-scan": BodyScanTool,
};

const ToolModule = ({ module }) => {
  const { toolType, toolId, config } = module.payload;
  const ToolComponent = TOOL_COMPONENTS[toolType];

  if (!ToolComponent) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        Tool "{toolType}" is not yet available.
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <ToolComponent
          tool={{ id: toolId, type: toolType, ...config }}
          isEmbedded={true}
        />
      </div>
    </div>
  );
};

export default ToolModule;

