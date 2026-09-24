// src/apps/tools/ToolDetailPage.jsx
// Phase 37: Tool Sessions Activation Layer
// Phase 44: Topic Memory Integration
// Upgraded detail page to use session layout + views

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContentViewer } from "@/components/content/ContentViewer";
import { getContentRegistryEntry } from "@/content/contentRegistry";
import { loadContentById } from "@/services/contentService";
import { ToolsRegistry } from "@/engines/tools/ToolsRegistry";
import { getToolById } from "@/tools/toolResolver";
import { getDailyPracticeToolById } from "@/tools/toolsBridge";
import { getToolById as getClientFacingTool } from "./toolsRegistry";
import { getSeedToolBySlug, loadToolBySlug } from "@/services/toolLoader";
import { ToolSessionLayout } from "@/components/tools/ToolSessionLayout";
import ToolModuleSession from "@/components/tools/ToolModuleSession";
import { AudioProvider } from "@/experience/audio/AudioProvider";
import { ToolProtocolView } from "@/components/tools/ToolProtocolView";
import { BreathingSessionView } from "@/components/tools/BreathingSessionView";
import { GroundingSessionView } from "@/components/tools/GroundingSessionView";
import { PanicResetSessionView } from "@/components/tools/PanicResetSessionView";
import { useTopicMemory } from "@/hooks/useTopicMemory";
import { getRecoveryBasicsContent, RECOVERY_BASICS_TOPICS } from "@/engines/education/recoveryBasicsEngine";
import InteractiveJourneyView from "@/components/learning/InteractiveJourneyView";
import { getTopic } from "@/engines/learningPaths/learningPathsEngine";
import { logDebug } from "@/lib/debug";
import NotReadyCard from "@/components/system/NotReadyCard";
import GroundingTool from "./modules/GroundingTool";
import JournalingTool from "./modules/JournalingTool";
import BodyScanTool from "./modules/BodyScanTool";
import SelfSurgeonTool from "./modules/SelfSurgeonTool";
import EducationModule from "./modules/EducationModule";
import UrgeSurfingTool from "./modules/UrgeSurfingTool";
import MeditationTool from "./modules/MeditationTool";
import AcuwellnessTool from "./modules/AcuwellnessTool";
import AffirmationsTool from "./modules/AffirmationsTool";
import SpecializedPathwayTool from "./modules/SpecializedPathwayTool";

const MODULE_TOOLS = {
  grounding: GroundingTool,
  "body-scan": BodyScanTool,
  journaling: JournalingTool,
  "self-surgeon": SelfSurgeonTool,
  education: EducationModule,
  "urge-surfing": UrgeSurfingTool,
  cravings: UrgeSurfingTool,
  "emotion-regulator": SpecializedPathwayTool,
  "shame-release": SpecializedPathwayTool,
  meditation: MeditationTool,
  "sleep-reset": SpecializedPathwayTool,
  acuwellness: AcuwellnessTool,
  affirmations: AffirmationsTool,
  "panic-reset": PanicResetSessionView,
};

const MODULE_TOOL_TYPES = {
  grounding: "grounding",
  "body-scan": "body-scan",
  journaling: "journaling",
  "self-surgeon": "self-surgeon",
  education: "education",
  "urge-surfing": "urge-surfing",
  meditation: "meditation",
};

const ToolDetailPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();

  const decodedId = useMemo(() => {
    try {
      return decodeURIComponent(toolId ?? "");
    } catch {
      return toolId ?? "";
    }
  }, [toolId]);

  const [toolMeta, setToolMeta] = useState(null);
  const [protocolTool, setProtocolTool] = useState(null);
  const [protocolToolLoaded, setProtocolToolLoaded] = useState(false);
  const [content, setContent] = useState(null);
  const [recoveryBasicsContent, setRecoveryBasicsContent] = useState(null);
  const [learningTopicId, setLearningTopicId] = useState(null); // Phase 45: Learning paths
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState([4, 0, 6, 0]);

  // Load protocol tool (Firestore + seed) for Daily Practice slugs
  useEffect(() => {
    if (!decodedId) {
      setProtocolToolLoaded(true);
      return;
    }
    const localSeedTool = getSeedToolBySlug(decodedId);
    const localPracticeTool = getDailyPracticeToolById(decodedId);
    const localTool = localSeedTool || localPracticeTool;
    setProtocolTool(localTool);
    setProtocolToolLoaded(true);
    setModuleCompleted(false);
    if (!localSeedTool) return;

    let cancelled = false;
    loadToolBySlug(decodedId).then((loaded) => {
      if (cancelled) return;
      if (loaded && Array.isArray(loaded.steps) && loaded.steps.length > 0) {
        setProtocolTool(loaded);
      }
    });
    return () => { cancelled = true; };
  }, [decodedId]);

  // load tool metadata from registry or toolResolver (Phase 59B)
  // Breathing tool MUST always render (offline-safe, no dependencies)
  const loadedToolMeta = useMemo(() => {
    // First try toolResolver (includes Healer Toolkit tools)
    const resolvedTool = getToolById(decodedId);
    if (resolvedTool) {
      // Map DailyPracticeTool format to toolMeta format if needed
      return {
        id: resolvedTool.id,
        name: resolvedTool.title,
        description: resolvedTool.summary,
        category: resolvedTool.category,
        sessionType: resolvedTool.id === "breathing" ? "breathing" : null, // Ensure breathing has sessionType
      };
    }
    // Fallback to ToolsRegistry for legacy tools
    const registryTool = ToolsRegistry?.find((t) => t.id === decodedId) || null;
    if (registryTool) {
      // Map tool IDs to sessionType; preserve registry sessionType (e.g. panic-reset -> panic)
      const sessionTypeMap = {
        breathing: "breathing",
        grounding: "grounding",
        "panic-reset": "panic",
      };
      return {
        ...registryTool,
        sessionType: sessionTypeMap[registryTool.id] ?? registryTool.sessionType ?? (registryTool.id === "breathing" ? "breathing" : null),
      };
    }
    // Fallback: If tool ID is "panic-reset" but not found, create minimal meta so it never renders blank
    if (decodedId === "panic-reset") {
      return {
        id: "panic-reset",
        name: "Panic Reset",
        description: "Emergency calm protocol for panic spikes",
        category: "Emergency",
        sessionType: "panic",
      };
    }
    // Fallback: If tool ID is "breathing" but not found, create minimal meta to ensure it renders
    if (decodedId === "breathing") {
      return {
        id: "breathing",
        name: "Breathing Exercises",
        description: "4-7-8, Box, and Coherent breathing to calm your nervous system.",
        category: "body-breath",
        sessionType: "breathing", // Critical: must have sessionType to render
      };
    }
    const clientTool = getClientFacingTool(decodedId);
    if (clientTool) {
      return {
        ...clientTool,
        sessionType: MODULE_TOOL_TYPES[decodedId] || null,
      };
    }
    return null;
  }, [decodedId]);

  useEffect(() => {
    setToolMeta(loadedToolMeta);
    if (loadedToolMeta) {
      logDebug("Tool", {
        toolId: loadedToolMeta.id,
        sessionType: loadedToolMeta.sessionType,
        decodedId,
      });
    }
  }, [loadedToolMeta, decodedId]);

  // Phase 45: Check if this is a learning path topic
  useEffect(() => {
    // Map content registry IDs to learning topic IDs
    const topicMapping = {
      // Phase 45: Learning Paths topics
      "recovery.shame-and-recovery": "shame-and-recovery",
      "recovery.cravings-and-urges": "cravings-and-urges",
      "recovery.nervous-system-regulation": "nervous-system-regulation",
      "recovery.trauma-and-recovery": "trauma-and-recovery",
      "recovery.sleep-and-recovery": "sleep-and-recovery",
      "recovery.boundaries-in-recovery": "boundaries-in-recovery",
      "recovery.grief-and-loss": "grief-and-loss",
      "recovery.self-compassion": "self-compassion",
      // Legacy mappings (for backward compatibility)
      "recovery.cravings.intro": "cravings-and-urges",
      "education.shame.basics": "shame-and-recovery",
    };

    const mappedTopicId = topicMapping[decodedId];
    
    // Phase 45: Check if this maps to a learning path topic
    if (mappedTopicId && getTopic(mappedTopicId)) {
      setLearningTopicId(mappedTopicId);
      setRecoveryBasicsContent(null); // Clear old recovery basics
      setContent(null); // Don't load markdown
      return;
    }
    
    // Phase 44: Fallback to old recovery basics engine for backward compatibility
    if (mappedTopicId && RECOVERY_BASICS_TOPICS.includes(mappedTopicId)) {
      const basicsContent = getRecoveryBasicsContent(mappedTopicId);
      setRecoveryBasicsContent(basicsContent);
      setLearningTopicId(null);
      setContent(null);
      return;
    }
    
    // Reset learning paths if not a match
    setLearningTopicId(null);
    setRecoveryBasicsContent(null);

    // Otherwise, load markdown content as before
    let cancelled = false;
    const entry = getContentRegistryEntry(decodedId);
    if (!entry) return;

    const loadAsync = async () => {
      const loaded = await loadContentById(decodedId);
      if (!cancelled) {
        setContent(loaded);
      }
    };

    loadAsync();

    return () => {
      cancelled = true;
    };
  }, [decodedId]);

  // Phase 44: Track topic memory for content (not interactive tools)
  const contentEntry = useMemo(() => {
    return getContentRegistryEntry(decodedId);
  }, [decodedId]);

  useTopicMemory(
    contentEntry ? decodedId : null,
    contentEntry?.section || null
  );

  const isSessionTool = !!toolMeta?.sessionType;

  const handleStartSession = () => {
    setIsSessionActive(true);
    // Phase 37: hook SoundscapeEngine here later
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    // Phase 37: stop soundscape if integrated
  };

  const renderSessionView = () => {
    // Phase 4: Breathing tool MUST always render (offline-safe, no dependencies)
    // Ensure breathing tools always get sessionType
    let sessionType = toolMeta?.sessionType;
    if (!sessionType) {
      // Map by category first
      if (toolMeta?.category === "breathing") {
        sessionType = "breathing";
      } else if (decodedId === "breathing" || decodedId?.includes("breathing")) {
        sessionType = "breathing";
      }
    }
    // Guard: Always render breathing tool even if metadata is incomplete
    if (!sessionType && (decodedId === "breathing" || decodedId?.includes("breathing"))) {
      // Force breathing type if ID matches
      return (
        <BreathingSessionView
          isActive={isSessionActive}
          onCycleComplete={() => setCycles((prev) => prev + 1)}
          pattern={[4, 0, 6, 0]}
          voiceEnabled={false}
        />
      );
    }
    if (!sessionType) return null;

    switch (sessionType) {
      case "breathing":
        return (
          <div className="space-y-5">
            <fieldset disabled={isSessionActive} className="space-y-3">
              <legend className="text-sm text-white/70">Choose a comfortable pace</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { label: "Gentle 4–6", pattern: [4, 0, 6, 0] },
                  { label: "Box · includes holds", pattern: [4, 4, 4, 4] },
                  { label: "4–7–8 · includes a long hold", pattern: [4, 7, 8, 0] },
                ].map((option) => (
                  <button key={option.label} type="button" aria-pressed={breathingPattern.join() === option.pattern.join()} onClick={() => setBreathingPattern(option.pattern)} className="min-h-11 rounded-xl border border-white/15 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5 aria-pressed:border-amber-200/50 aria-pressed:text-amber-100 disabled:opacity-50">
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="text-xs leading-relaxed text-white/50">Follow your natural breath if counting or holding does not feel comfortable. Stop if you feel unwell.</p>
          <BreathingSessionView
            isActive={isSessionActive}
            pattern={breathingPattern}
          />
          </div>
        );
      case "grounding":
        return <GroundingSessionView activeIndex={0} />;
      case "panic":
        return <PanicResetSessionView />;
      default:
        return null;
    }
  };

  // Wait for protocol load when we have a slug (avoids flash of wrong content)
  if (decodedId && !protocolToolLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  // Protocol tools (seed/Firestore): step-by-step Daily Practice
  if (protocolTool && Array.isArray(protocolTool.steps) && protocolTool.steps.length > 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <ToolProtocolView tool={protocolTool} onClose={() => navigate("/tools")} />
      </div>
    );
  }

  const DirectToolModule = MODULE_TOOLS[decodedId];
  if (DirectToolModule && toolMeta) {
    const onCloseModule = () => navigate("/tools");
    return (
      <ToolModuleSession
        title={toolMeta.name || toolMeta.title}
        description={toolMeta.description || toolMeta.summary}
        onClose={onCloseModule}
        completed={moduleCompleted}
      >
        <DirectToolModule
          tool={toolMeta}
          topic={decodedId === "education" ? null : undefined}
          onComplete={() => setModuleCompleted(true)}
          onCancel={onCloseModule}
          isEmbedded
        />
      </ToolModuleSession>
    );
  }

  // Phase 46: Interactive Journey (luxury multi-layer learning OS)
  if (!isSessionTool && learningTopicId) {
    return (
      <InteractiveJourneyView topicId={learningTopicId} />
    );
  }

  // Phase 44: Recovery Basics content (deep, trauma-informed) - fallback for old system
  if (!isSessionTool && recoveryBasicsContent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-8">
        {/* C1: Back button handled by OSPageChrome - no duplicate */}
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-light tracking-tight text-white">
            {recoveryBasicsContent.title}
          </h1>
        </div>

        {/* Understanding Section */}
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Understanding</h2>
          <div className="prose prose-invert max-w-none">
            <div className="text-sm sm:text-base text-white/85 leading-relaxed whitespace-pre-line">
              {recoveryBasicsContent.understanding}
            </div>
          </div>
        </div>

        {/* Reflection Section */}
        <div className="rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.08] to-amber-500/[0.04] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
            <h2 className="text-lg font-semibold text-amber-200">Reflection</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-sm sm:text-base text-amber-100/90 leading-relaxed whitespace-pre-line italic">
              {recoveryBasicsContent.reflection}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no session metadata is found, but content exists → check if it's breathing content
  // For breathing content, show interactive orb + voice guide option
  if (!isSessionTool && content) {
    const isBreathingContent = decodedId === "breathing" || 
                                 decodedId === "tool.breathing.basic1" ||
                                 decodedId?.includes("breathing") ||
                                 content.title?.toLowerCase().includes("breathing") ||
                                 content.tags?.includes("breathing");
    
    if (isBreathingContent) {
      // Show interactive breathing view with orb and voice guide
      return (
        <div className="relative min-h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-24 pt-6">
          <ToolSessionLayout
            tool={{
              id: "breathing",
              name: content.title || "Breathing Reset",
              description: content.body?.split("\n")[0] || "Calm your nervous system",
              sessionType: "breathing",
            }}
            darkMode={darkMode}
            isActive={isSessionActive}
            onStart={handleStartSession}
            onEnd={handleEndSession}
            onClose={() => navigate("/tools")}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((v) => !v)}
            onToggleTheme={() => setDarkMode((v) => !v)}
          >
            <BreathingSessionView
              isActive={isSessionActive}
              onCycleComplete={() => setCycles((prev) => prev + 1)}
              pattern={[4, 0, 6, 0]} // 4-6 breathing: inhale 4, exhale 6, no holds
              voiceEnabled={soundEnabled} // Use soundEnabled state for voice guide
            />
          </ToolSessionLayout>
        </div>
      );
    }
    
    // Non-breathing content: standard markdown view
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* C1: Back button handled by OSPageChrome - no duplicate */}
        <ContentViewer title={content.title} body={content.body} />
      </div>
    );
  }

  // Tool not found: calm page with slug and CTA
  const nothingToShow = protocolToolLoaded && !protocolTool && !toolMeta && !content && !recoveryBasicsContent && !learningTopicId;
  if (nothingToShow) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-3xl bg-slate-900/80 px-6 py-5 text-center text-sm text-slate-300 max-w-md">
          <p className="mb-2">Tool not found.</p>
          {decodedId && (
            <p className="text-xs text-slate-500 mb-4 font-mono">Requested: {decodedId}</p>
          )}
          <button
            type="button"
            onClick={() => navigate("/tools")}
            className="text-amber-300 underline-offset-2 hover:underline"
          >
            Return to Tools
          </button>
        </div>
      </div>
    );
  }

  // Session-based tool view (Phase 56: AudioProvider for breathing/audio-guided tools)
  if (toolMeta?.sessionType) {
    return (
      <AudioProvider>
        <div className="relative min-h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-24 pt-6">
          {/* subtle background particles */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-amber-300/30"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  animation: `float-slow ${10 + (i % 6)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          <ToolSessionLayout
            tool={toolMeta}
            darkMode={darkMode}
            isActive={isSessionActive}
            onStart={handleStartSession}
            onEnd={handleEndSession}
            onClose={() => navigate("/tools")}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((v) => !v)}
            onToggleTheme={() => setDarkMode((v) => !v)}
          >
            {renderSessionView()}
          </ToolSessionLayout>
        </div>
      </AudioProvider>
    );
  }

  // Fallback content view if only markdown defined — or never-blank NotReadyCard if nothing to show
  if (!content?.title && !content?.body) {
    if (import.meta.env.DEV) {
      console.debug("[PanicReset] render", { ready: false, loading: protocolToolLoaded, error: "no content" });
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <NotReadyCard
          title="Panic Reset"
          body="This calm-down tool is loading. You can try again or open Chat for support."
          actions={[
            { label: "Try again", onClick: () => navigate(decodedId ? `/tools/${encodeURIComponent(decodedId)}` : "/tools", { replace: true }) },
            { label: "Use text instead", to: "/chat" },
          ]}
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* C1: Back button handled by OSPageChrome - no duplicate */}
      <ContentViewer title={content?.title} body={content?.body} />
    </div>
  );
};

export default ToolDetailPage;
