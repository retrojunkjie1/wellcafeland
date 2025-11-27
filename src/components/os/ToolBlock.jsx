// src/components/os/ToolBlock.jsx
// Tool block that appears in chat with proper completion handling

import React, { useState } from "react";
import { useOSStore } from "@/stores/useOSStore";
import { guideEngine } from "@/services/multimodalClient";
import BreathingTool from "@/apps/tools/modules/BreathingTool";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import JournalingTool from "@/apps/tools/modules/JournalingTool";
import UrgeSurfingTool from "@/apps/tools/modules/UrgeSurfingTool";
import BodyScanTool from "@/apps/tools/modules/BodyScanTool";
import SelfSurgeonTool from "@/apps/tools/modules/SelfSurgeonTool";
import EducationModule from "@/apps/tools/modules/EducationModule";

const TOOL_COMPONENTS = {
  breathing: BreathingTool,
  grounding: GroundingTool,
  journaling: JournalingTool,
  "urge-surfing": UrgeSurfingTool,
  "body-scan": BodyScanTool,
  "self-surgeon": SelfSurgeonTool,
  education: EducationModule,
};

const TOOL_NAMES = {
  breathing: "Breathing Exercise",
  grounding: "Grounding (5-4-3-2-1)",
  journaling: "Journaling",
  "urge-surfing": "Urge Surfing",
  "body-scan": "Body Scan",
  "self-surgeon": "Self-Inquiry",
  education: "Education",
};

const ToolBlock = ({ tool }) => {
  const { type, config, id } = tool;
  const ToolComponent = TOOL_COMPONENTS[type];
  const { addMessage, messages } = useOSStore();
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState(null);

  if (!ToolComponent) {
    return null;
  }

  // Handle tool completion
  const handleComplete = async (toolResult) => {
    if (isCompleted) return; // Prevent double-completion
    
    setIsCompleted(true);
    setResult(toolResult);

    // Add tool result message to chat
    if (toolResult && toolResult.summary) {
      addMessage("assistant", {
        type: "tool_result",
        content: toolResult.summary,
        toolId: toolResult.toolId,
        toolName: toolResult.title,
        data: toolResult.data,
      });
    }

    // Call Guide with tool context for follow-up
    try {
      const toolContext = `The user just completed ${toolResult.title || TOOL_NAMES[type] || "a tool"}. ` +
        `Summary: ${toolResult.summary || "Tool completed"}. ` +
        `Duration: ${toolResult.durationSeconds ? Math.floor(toolResult.durationSeconds / 60) + " minutes" : "unknown"}. ` +
        `Provide a brief, compassionate follow-up response.`;

      const guideResponse = await guideEngine(toolContext, {
        mode: "default",
      });

      if (guideResponse.ok && guideResponse.content) {
        addMessage("assistant", guideResponse.content);
      }
    } catch (err) {
      console.error("Failed to get guide follow-up:", err);
      // Non-blocking - tool completion still succeeded
    }
  };

  // Handle tool cancellation
  const handleCancel = () => {
    addMessage("assistant", "No problem. We can come back to that any time. What feels most important right now?");
  };

  // If completed, show compact summary card
  if (isCompleted && result) {
    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs font-medium text-white">SG</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="mb-1">
            <span className="text-xs font-medium text-white/60">Wellness Guide</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <h4 className="text-base font-medium text-white">{result.title}</h4>
              <p className="text-sm text-white/70">{result.summary}</p>
              {result.durationSeconds && (
                <p className="text-xs text-white/50">
                  {Math.floor(result.durationSeconds / 60)} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active tool interface
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-xs font-medium text-white">SG</span>
        </div>
      </div>
      <div className="flex-1">
        <div className="mb-1">
          <span className="text-xs font-medium text-white/60">Wellness Guide</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4 w-full">
          <ToolComponent
            onComplete={handleComplete}
            onCancel={handleCancel}
            initialContext={config}
            isEmbedded={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolBlock;
