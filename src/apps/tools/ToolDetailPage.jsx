// src/apps/tools/ToolDetailPage.jsx

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackPageView } from "../../services/telemetry";
import { getToolById } from "./toolsRegistry";
import BreathingTool from "./modules/BreathingTool";
import GroundingTool from "./modules/GroundingTool";
import JournalingTool from "./modules/JournalingTool";
import UrgeSurfingTool from "./modules/UrgeSurfingTool";
import BodyScanTool from "./modules/BodyScanTool";
import SelfSurgeonTool from "./modules/SelfSurgeonTool";
import EducationModule from "./modules/EducationModule";

const TOOL_COMPONENTS = {
  breathing: BreathingTool,
  grounding: GroundingTool,
  journaling: JournalingTool,
  "urge-surfing": UrgeSurfingTool,
  "body-scan": BodyScanTool,
  "self-surgeon": SelfSurgeonTool,
  education: EducationModule,
};

const ToolDetailPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = getToolById(toolId);

  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} - WellnessCafe`;
      trackPageView(`tool_${toolId}`);
    }
  }, [tool, toolId]);

  if (!tool) {
    return (
      <div className="flex h-full items-center justify-center text-white/80">
        This ritual hasn’t been written yet.
      </div>
    );
  }

  const ToolComponent = TOOL_COMPONENTS[toolId];

  if (!ToolComponent) {
    return (
      <div className="flex h-full items-center justify-center text-white/80">
        This module is still being composed.
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm lg:items-start">
      <div className="hidden max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-slate-950/95 p-8 text-white shadow-gold-ring lg:block">
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="mb-6 text-xs text-white/50 hover:text-white"
        >
          ← Back to tools
        </button>
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{tool.icon}</span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                {tool.category}
              </p>
              <h1 className="text-2xl font-light text-white">{tool.name}</h1>
            </div>
          </div>
          <p className="text-sm text-white/70">{tool.description}</p>
        </header>
        <div className="mt-6">
          <ToolComponent
            onComplete={(result) => {
              console.log("Tool completed:", result);
              // Could navigate back or show completion message
            }}
            onCancel={() => {
              navigate("/tools");
            }}
            initialContext={{}}
            isEmbedded={false}
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 w-full lg:hidden">
        <div
          className="absolute inset-0"
          onClick={() => navigate("/tools")}
          aria-hidden
        />
        <div className="relative z-10 max-h-[90vh] rounded-t-3xl bg-slate-950/95 px-4 py-6 text-white shadow-gold-ring">
          <div className="mx-auto h-full max-w-2xl overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => navigate("/tools")}
              className="text-xs text-white/50 hover:text-white"
            >
              Close
            </button>
            <header className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tool.icon}</span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {tool.category}
                  </p>
                  <h1 className="text-xl font-light">{tool.name}</h1>
                </div>
              </div>
              <p className="text-sm text-white/70">{tool.description}</p>
            </header>
            <ToolComponent
              onComplete={(result) => {
                console.log("Tool completed:", result);
              }}
              onCancel={() => {
                navigate("/tools");
              }}
              initialContext={{}}
              isEmbedded={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetailPage;

