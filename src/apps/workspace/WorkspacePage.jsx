// src/apps/workspace/WorkspacePage.jsx
// Workspace mode - full-screen tool/content view

import React, { useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOSStore, MODES } from "@/stores/useOSStore";
import BreathingTool from "@/apps/tools/modules/BreathingTool";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import JournalingTool from "@/apps/tools/modules/JournalingTool";
import UrgeSurfingTool from "@/apps/tools/modules/UrgeSurfingTool";
import BodyScanTool from "@/apps/tools/modules/BodyScanTool";
import SelfSurgeonTool from "@/apps/tools/modules/SelfSurgeonTool";
import EducationModule from "@/apps/tools/modules/EducationModule";
import SupportSearchModule from "@/components/interaction/modules/SupportSearchModule";
import RealHelpWorkspace from "./RealHelpWorkspace";

const TOOL_COMPONENTS = {
  breathing: BreathingTool,
  grounding: GroundingTool,
  journaling: JournalingTool,
  "urge-surfing": UrgeSurfingTool,
  "body-scan": BodyScanTool,
  "self-surgeon": SelfSurgeonTool,
  education: EducationModule,
};

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaces, setMode, closeWorkspace } = useOSStore();

  useEffect(() => {
    setMode(MODES.WORKSPACE);
  }, [setMode]);

  const workspace = workspaces.find((w) => w.id === id);

  if (!workspace) {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-white/60 hover:text-white transition"
        >
          ← Back
        </button>
        <h1 className="text-lg font-medium text-white">Workspace</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-2">Workspace not found</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-wcGold hover:text-amber-300"
          >
            Return to home
          </button>
        </div>
      </div>
    </div>
  );
  }

  const renderWorkspaceContent = () => {
    // Phase 12: Real Help workspace
    if (workspace.type === "real_help" || id === "real-help") {
      return <RealHelpWorkspace />;
    }

    // Phase 14: Voice session workspace
    if (workspace.type === "voice-session") {
      const VoiceSessionWorkspaceComponent = React.lazy(() => import("@/apps/workspace/VoiceSessionWorkspace"));
      return (
        <Suspense fallback={<div className="text-white/50">Loading...</div>}>
          <VoiceSessionWorkspaceComponent initialAudioBlob={workspace.data?.audioBlob} />
        </Suspense>
      );
    }

    // Phase 13: Social workspaces
    if (workspace.type === "circleThread") {
      const { circleId, threadId } = workspace.data || {};
      if (circleId && threadId) {
        const CircleThreadPage = React.lazy(() => import("@/apps/circles/CircleThreadPage"));
        return (
          <Suspense fallback={<div className="text-white/50">Loading...</div>}>
            <CircleThreadPage />
          </Suspense>
        );
      }
    }

    if (workspace.type === "directMessage") {
      const { threadId } = workspace.data || {};
      if (threadId) {
        const DirectMessagePage = React.lazy(() => import("@/apps/social/DirectMessagePage"));
        return (
          <Suspense fallback={<div className="text-white/50">Loading...</div>}>
            <DirectMessagePage />
          </Suspense>
        );
      }
    }

    if (workspace.type === "socialPost") {
      const SocialFeedPage = React.lazy(() => import("@/apps/social/SocialFeedPage"));
      return (
        <Suspense fallback={<div className="text-white/50">Loading...</div>}>
          <SocialFeedPage />
        </Suspense>
      );
    }

    if (workspace.type === "tool") {
      const { toolType, config } = workspace.data;
      const ToolComponent = TOOL_COMPONENTS[toolType];
      if (!ToolComponent) {
        return (
          <div className="text-center text-white/70">
            Tool "{toolType}" is not available.
          </div>
        );
      }
      return (
        <ToolComponent
          tool={{ id: toolType, type: toolType, ...config }}
          isEmbedded={false}
          onComplete={() => {
            // Workspace tool completion - could show a message or navigate
            console.log(`Tool ${toolType} completed in workspace`);
          }}
        />
      );
    }

    if (workspace.type === "support") {
      return (
        <SupportSearchModule
          module={{
            id: workspace.id,
            payload: workspace.data,
          }}
        />
      );
    }

    if (workspace.type === "provider") {
      return (
        <div className="text-center text-white/70">
          Provider search coming soon.
        </div>
      );
    }

    if (workspace.type === "education") {
      const { topic } = workspace.data || {};
      return <EducationModule topic={topic} />;
    }

    return null;
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 animate-fade-in w-full max-w-screen-xl mx-auto overflow-hidden">
      {/* Header - Simple ChatGPT style */}
      <div className="border-b border-white/10 bg-slate-950 px-4 sm:px-6 py-3 sm:py-4 md:py-5 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Phase 18: Back button */}
            <button
              type="button"
              onClick={() => {
                closeWorkspace();
                navigate("/");
              }}
              className="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Back"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-medium text-white truncate">
                {workspace.title}
              </h1>
              {workspace.type && (
                <p className="text-xs text-white/50 mt-1 hidden sm:block">
                  {workspace.type === "tool" && "Practice at your own pace"}
                  {workspace.type === "support" && "Find the help you need"}
                  {workspace.type === "provider" && "Connect with care providers"}
                  {workspace.type === "education" && "Learn and grow"}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              closeWorkspace();
              navigate("/");
            }}
            className="flex-shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/10 transition whitespace-nowrap min-h-[48px] sm:min-h-0"
          >
            Back to Chat
          </button>
        </div>
      </div>

      {/* Content - Generous spacing, luxury feel */}
      <div className="flex-1 overflow-y-auto max-h-screen w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="animate-scale-fade-in">{renderWorkspaceContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;

