// src/components/interaction/modules/ToolModule.jsx
// Injected tool modules (breathing, grounding, etc.) in chat

import React from "react";
import { resolveToolComponent } from "@/apps/tools/toolComponentRegistry";
import ToolAvailabilityFallback from "@/components/tools/ToolAvailabilityFallback";

const ToolModule = ({ module }) => {
  const { toolType, toolId, config = {} } = module?.payload || {};
  const ToolComponent = resolveToolComponent(toolType, toolId);

  if (!ToolComponent) {
    return <ToolAvailabilityFallback toolType={toolType || toolId} />;
  }

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <ToolComponent
          tool={{ id: toolId || toolType, type: toolType || toolId, ...config }}
          topic={config.topic || toolId || toolType}
          isEmbedded={true}
        />
      </div>
    </div>
  );
};

export default ToolModule;
