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
import { ToolSessionLayout } from "@/components/tools/ToolSessionLayout";
import { BreathingSessionView } from "@/components/tools/BreathingSessionView";
import { GroundingSessionView } from "@/components/tools/GroundingSessionView";
import { PanicResetSessionView } from "@/components/tools/PanicResetSessionView";
import { useTopicMemory } from "@/hooks/useTopicMemory";
import { getRecoveryBasicsContent, RECOVERY_BASICS_TOPICS } from "@/engines/education/recoveryBasicsEngine";
import InteractiveJourneyView from "@/components/learning/InteractiveJourneyView";
import { getTopic } from "@/engines/learningPaths/learningPathsEngine";

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
  const [content, setContent] = useState(null);
  const [recoveryBasicsContent, setRecoveryBasicsContent] = useState(null);
  const [learningTopicId, setLearningTopicId] = useState(null); // Phase 45: Learning paths
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [coherence, setCoherence] = useState(0);

  // session timer
  useEffect(() => {
    if (!isSessionActive) return;
    const id = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
      // Light coherence growth
      setCoherence((prev) => Math.min(100, prev + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isSessionActive]);

  // load tool metadata from registry or toolResolver (Phase 59B)
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
        sessionType: null, // Healer tools don't have sessionType yet
      };
    }
    // Fallback to ToolsRegistry for legacy tools
    return ToolsRegistry?.find((t) => t.id === decodedId) || null;
  }, [decodedId]);

  useEffect(() => {
    setToolMeta(loadedToolMeta);
  }, [loadedToolMeta]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionSeconds(0);
    setCycles(0);
    setCoherence(0);
    // Phase 37: hook SoundscapeEngine here later
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    // Phase 37: stop soundscape if integrated
  };

  const metrics = [
    { label: "Time", value: formatTime(sessionSeconds) },
    { label: "Cycles", value: cycles },
    {
      label: "Coherence",
      value: isSessionActive ? `${coherence}%` : "—",
    },
    {
      label: "Calm Score",
      value: isSessionActive ? `${Math.min(100, Math.round(sessionSeconds * 1.5))}%` : "—",
    },
  ];

  const renderSessionView = () => {
    if (!toolMeta?.sessionType) return null;

    switch (toolMeta.sessionType) {
      case "breathing":
        return (
          <BreathingSessionView
            isActive={isSessionActive}
            onCycleComplete={() => setCycles((prev) => prev + 1)}
          />
        );
      case "grounding":
        return <GroundingSessionView activeIndex={0} />;
      case "panic":
        return <PanicResetSessionView />;
      default:
        return null;
    }
  };

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
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-xs font-medium text-amber-300 hover:text-amber-200 transition"
        >
          ← Back
        </button>

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

  // If no session metadata is found, but content exists → fallback to markdown view
  if (!isSessionTool && content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 text-xs font-medium text-amber-300 hover:text-amber-200"
        >
          ← Back
        </button>
        <ContentViewer title={content.title} body={content.body} />
      </div>
    );
  }

  // If neither session nor content found
  if (!toolMeta && !content && !recoveryBasicsContent && !learningTopicId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-3xl bg-slate-900/80 px-6 py-5 text-center text-sm text-slate-300">
          This tool could not be found.{" "}
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

  // Session-based tool view
  if (toolMeta?.sessionType) {
    return (
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

        {/* back button */}
        <div className="relative z-10 mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-medium text-amber-200/80 hover:text-amber-100"
          >
            ← Back
          </button>
        </div>

        <ToolSessionLayout
          tool={toolMeta}
          darkMode={darkMode}
          isActive={isSessionActive}
          onStart={handleStartSession}
          onEnd={handleEndSession}
          onClose={() => navigate("/tools")}
          metrics={metrics}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((v) => !v)}
          onToggleTheme={() => setDarkMode((v) => !v)}
        >
          {renderSessionView()}
        </ToolSessionLayout>
      </div>
    );
  }

  // Fallback content view if only markdown defined
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-xs font-medium text-amber-300 hover:text-amber-200"
      >
        ← Back
      </button>
      <ContentViewer title={content?.title} body={content?.body} />
    </div>
  );
};

export default ToolDetailPage;
