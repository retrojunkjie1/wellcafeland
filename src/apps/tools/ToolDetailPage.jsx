// src/apps/tools/ToolDetailPage.jsx
// Phase 37: Tool Sessions Activation Layer
// Phase 44: Topic Memory Integration
// Upgraded detail page to use session layout + views

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import { createToolReturnState, resolveToolReturnTarget, returnFromTool } from "@/navigation/toolReturn";
import { callAgent } from "@/ai/agents/agentClient";
import { recordPrivatePracticeCompletion } from "@/services/privatePracticeProgress";
import NotReadyCard from "@/components/system/NotReadyCard";
import GroundingTool from "./modules/GroundingTool";
import ProgressiveMuscleRelaxationTool from "./modules/ProgressiveMuscleRelaxationTool";
import JournalingTool from "./modules/JournalingTool";
import BodyScanTool from "./modules/BodyScanTool";
import SelfSurgeonTool from "./modules/SelfSurgeonTool";
import EducationModule from "./modules/EducationModule";
import UrgeSurfingTool from "./modules/UrgeSurfingTool";
import MeditationTool from "./modules/MeditationTool";
import AcuwellnessTool from "./modules/AcuwellnessTool";
import AffirmationsTool from "./modules/AffirmationsTool";
import SpecializedPathwayTool from "./modules/SpecializedPathwayTool";
import LowEnergyPlanTool from "./modules/LowEnergyPlanTool";
import VisitPrepTool from "./modules/VisitPrepTool";
import CareHandoffTool from "./modules/CareHandoffTool";
import { requestBreathkeeperCue as getBreathkeeperCue } from "./modules/breathkeeperGuidance";

const MODULE_TOOLS = {
  grounding: GroundingTool,
  "grounding-54321": GroundingTool,
  pmr: ProgressiveMuscleRelaxationTool,
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
  "low-energy-plan": LowEnergyPlanTool,
  "visit-prep": VisitPrepTool,
  "care-coordination": CareHandoffTool,
  acuwellness: AcuwellnessTool,
  affirmations: AffirmationsTool,
  "panic-reset": PanicResetSessionView,
};

const MODULE_TOOL_TYPES = {
  grounding: "grounding",
  "grounding-54321": "grounding",
  "body-scan": "body-scan",
  journaling: "journaling",
  "self-surgeon": "self-surgeon",
  education: "education",
  "urge-surfing": "urge-surfing",
  meditation: "meditation",
};

// These modules render their own useful end state (a takeaway, a saved plan,
// or a practice-specific completion screen). Keep that state mounted instead
// of replacing it with ToolModuleSession's generic completion panel.
const MODULE_OWNED_COMPLETION = new Set([
  "grounding",
  "grounding-54321",
  "pmr",
  "meditation",
  "low-energy-plan",
  "emotion-regulator",
  "shame-release",
  "sleep-reset",
]);

const COMPLETION_COPY = {
  "body-scan": {
    title: "Steady Ground pause complete",
    description: "You tried one small grounding option. There is no rating or body observation to report.",
  },
  "urge-surfing": {
    title: "Urge Support pause complete",
    description: "You made space for a possible next step. There is no rating or explanation needed.",
  },
  cravings: {
    title: "Urge Support pause complete",
    description: "You made space for a possible next step. There is no rating or explanation needed.",
  },
  journaling: {
    title: "Your entry is saved",
    description: "Your writing was saved in your journal. The text itself is not included in usage analytics.",
  },
  education: {
    title: "Learning time complete",
    description: "You finished a self-paced learning topic. Keep one useful idea, or leave it here.",
  },
  acuwellness: {
    title: "You’ve finished reviewing",
    description: "This was optional self-care information. No touch, pressure point, or particular result is required.",
  },
};

const ToolDetailPage = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTarget = useMemo(() => resolveToolReturnTarget(location.state), [location.state]);
  const closeTool = () => returnFromTool(navigate, returnTarget);

  const decodedId = useMemo(() => {
    try {
      return decodeURIComponent(toolId ?? "");
    } catch {
      return toolId ?? "";
    }
  }, [toolId]);
  const isGroundingTool = decodedId === "grounding" || decodedId === "grounding-54321";

  const [toolMeta, setToolMeta] = useState(null);
  const [protocolTool, setProtocolTool] = useState(null);
  const [protocolToolLoaded, setProtocolToolLoaded] = useState(false);
  const [breathingAudioContext, setBreathingAudioContext] = useState(null);
  const breathingAudioContextRef = useRef(null);
  const [content, setContent] = useState(null);
  const [recoveryBasicsContent, setRecoveryBasicsContent] = useState(null);
  const [learningTopicId, setLearningTopicId] = useState(null); // Phase 45: Learning paths
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.dataset.theme || "dark" : "dark",
  );
  const darkMode = resolvedTheme !== "light";
  const soundEnabled = true;
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [completedToolId, setCompletedToolId] = useState(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const moduleCompleted = completedToolId === decodedId;
  const [cycles, setCycles] = useState(0);
  const [breathingPattern, setBreathingPattern] = useState([4, 0, 6, 0]);
  const [breathkeeperCue, setBreathkeeperCue] = useState("");
  const [breathkeeperLoading, setBreathkeeperLoading] = useState(false);
  const [breathkeeperError, setBreathkeeperError] = useState("");
  const [includeBreathkeeperCue, setIncludeBreathkeeperCue] = useState(false);
  const canUseBreathkeeper = breathingPattern.join() === "4,0,6,0";

  const requestBreathkeeperCue = async () => {
    if (!canUseBreathkeeper || breathkeeperLoading) return;
    setBreathkeeperLoading(true);
    setBreathkeeperError("");
    setBreathkeeperCue("");
    setIncludeBreathkeeperCue(false);
    try {
      setBreathkeeperCue(await getBreathkeeperCue(callAgent));
    } catch (error) {
      setBreathkeeperError(error?.message || "A fresh cue could not be prepared. The breathing guide is still ready.");
    } finally {
      setBreathkeeperLoading(false);
    }
  };

  useEffect(() => {
    const syncTheme = (event) => {
      setResolvedTheme(event.detail?.theme || document.documentElement.dataset.theme || "dark");
    };
    window.addEventListener("wc_theme_change", syncTheme);
    return () => window.removeEventListener("wc_theme_change", syncTheme);
  }, []);

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
    setCompletedToolId(null);
    setPracticeCompleted(false);
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
    if (toolMeta?.sessionType === "breathing" || decodedId === "breathing" || decodedId?.includes("breathing")) {
      const AudioContextType = window.AudioContext || window.webkitAudioContext;
      if (AudioContextType) {
        let context = breathingAudioContextRef.current;
        if (!context || context.state === "closed") {
          context = new AudioContextType();
          breathingAudioContextRef.current = context;
        }
        void context.resume().catch(() => {});
        setBreathingAudioContext(context);
      }
    }
    setIsSessionActive(true);
    // Phase 37: hook SoundscapeEngine here later
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    const context = breathingAudioContextRef.current;
    breathingAudioContextRef.current = null;
    setBreathingAudioContext(null);
    if (context && context.state !== "closed") void context.close().catch(() => {});
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
          darkMode={darkMode}
          onCycleComplete={() => setCycles((prev) => prev + 1)}
          pattern={[4, 0, 6, 0]}
          voiceEnabled
          audioContext={breathingAudioContext}
        />
      );
    }
    if (!sessionType) return null;

    switch (sessionType) {
      case "breathing":
        {
          const rhythmOptions = [
            {
              label: "Gentle 4–6",
              short: "In 4 · out 6 · no holds",
              pattern: [4, 0, 6, 0],
              explanation: "An easy 4-second inhale, then a 6-second exhale. The longer out-breath sets a slower pace and gives your attention a simple anchor. Keep it comfortable; there is no feeling you need to reach."
            },
            {
              label: "Box breathing",
              short: "In 4 · pause 4 · out 4 · pause 4",
              pattern: [4, 4, 4, 4],
              explanation: "Four equal steps: inhale, pause, exhale, pause. A predictable sequence can give your attention a simple track to follow. Both pauses are optional; skip either one and breathe comfortably."
            },
            {
              label: "4–7–8 breathing",
              short: "In 4 · pause 7 · out 8",
              pattern: [4, 7, 8, 0],
              explanation: "A 4-count inhale, an optional 7-count pause, then an 8-count exhale. The longer pattern may feel demanding, so treat it as an option—not a test. Skip the pause or return to natural breathing whenever you want."
            },
          ];
          const selectedRhythm = rhythmOptions.find((option) => breathingPattern.join() === option.pattern.join()) || rhythmOptions[0];
          const rhythmSteps = [
            { label: "Breathe in", seconds: breathingPattern[0] || 4 },
            ...(breathingPattern[1] > 0 ? [{ label: "Pause", seconds: breathingPattern[1] }] : []),
            { label: "Breathe out", seconds: breathingPattern[2] || breathingPattern[0] || 4 },
            ...(breathingPattern[3] > 0 ? [{ label: "Pause", seconds: breathingPattern[3] }] : []),
          ];
        return (
          <div className="space-y-5">
            {!isSessionActive && (
              <section aria-labelledby="breathing-orientation-title" className={`rounded-2xl border p-5 sm:p-6 ${darkMode ? "border-emerald-100/15 bg-gradient-to-br from-emerald-950/35 via-slate-900/70 to-slate-950/70" : "border-emerald-900/15 bg-gradient-to-br from-emerald-50 via-white to-amber-50"}`}>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${darkMode ? "text-emerald-100/75" : "text-emerald-900/70"}`}>Before you begin</p>
                <h2 id="breathing-orientation-title" className={`mt-2 text-xl font-semibold sm:text-2xl ${darkMode ? "text-white" : "text-slate-900"}`}>A guided breathing practice</h2>
                <p className={`mt-2 max-w-3xl text-sm leading-relaxed sm:text-base ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Follow the moving guide and optional voice through one breath at a time. Pick a pace that feels manageable. You can return to natural breathing, skip a hold, or end the practice whenever you want.
                </p>
              </section>
            )}
            <fieldset disabled={isSessionActive} className="space-y-3">
              <legend className={`text-sm font-medium ${darkMode ? "text-white/75" : "text-slate-700"}`}>Choose a breathing rhythm</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {rhythmOptions.map((option) => (
                  <button key={option.label} type="button" aria-pressed={breathingPattern.join() === option.pattern.join()} onClick={() => { setBreathingPattern(option.pattern); setBreathkeeperCue(""); setIncludeBreathkeeperCue(false); setBreathkeeperError(""); }} className={`min-h-16 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-50 ${darkMode ? "border-white/15 text-white/80 hover:bg-white/5 aria-pressed:border-amber-200/60 aria-pressed:bg-amber-100/[0.06] aria-pressed:text-amber-100" : "border-slate-300 text-slate-700 hover:bg-slate-100 aria-pressed:border-amber-700/60 aria-pressed:bg-amber-50 aria-pressed:text-amber-950"}`}>
                    <span className="block font-medium">{option.label}</span>
                    <span className={`mt-1 block text-xs ${darkMode ? "text-white/55" : "text-slate-500"}`}>{option.short}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            {!isSessionActive && (
              <section aria-live="polite" aria-atomic="true" className={`overflow-hidden rounded-2xl border ${darkMode ? "border-white/10 bg-slate-950/55" : "border-slate-200 bg-white/75"}`}>
                <div className="px-4 pt-4 sm:px-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>What this rhythm means</h3>
                    <span className={`text-xs tabular-nums ${darkMode ? "text-amber-100/75" : "text-amber-900/70"}`}>{breathingPattern.reduce((sum, seconds) => sum + seconds, 0)} seconds per cycle</span>
                  </div>
                  <p className={`mt-2 text-sm leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{selectedRhythm.explanation}</p>
                </div>
                <div className="flex gap-2 overflow-x-auto px-4 py-4 sm:px-5" aria-label={`${selectedRhythm.label} rhythm sequence`}>
                  {rhythmSteps.map((step, index) => (
                    <div key={`${step.label}-${index}`} className={`min-w-[5.5rem] flex-1 rounded-xl border px-3 py-3 ${darkMode ? "border-white/10 bg-white/[0.035]" : "border-slate-200 bg-slate-50"}`}>
                      <span className={`block text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${darkMode ? "text-emerald-100/65" : "text-emerald-900/60"}`}>{step.label}</span>
                      <span className={`mt-1 block text-lg font-semibold tabular-nums ${darkMode ? "text-amber-100" : "text-slate-900"}`}>{step.seconds}<span className="ml-1 text-xs font-normal opacity-65">sec</span></span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <p className={`text-xs leading-relaxed ${darkMode ? "text-white/55" : "text-slate-600"}`}>Pauses are optional. If counting or breath focus feels uncomfortable, choose natural breathing or stop the practice.</p>
            {!isSessionActive && canUseBreathkeeper && (
              <section aria-labelledby="breathkeeper-cue-title" className={`rounded-2xl border p-4 sm:p-5 ${darkMode ? "border-emerald-100/15 bg-emerald-950/20" : "border-emerald-900/15 bg-emerald-50/70"}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 id="breathkeeper-cue-title" className={`text-sm font-semibold ${darkMode ? "text-emerald-100" : "text-emerald-950"}`}>Optional fresh guidance</h3>
                    <p className={`mt-1 text-xs leading-relaxed ${darkMode ? "text-white/65" : "text-slate-600"}`}>Breathkeeper can offer one short cue for the 4–6 practice. It cannot change the timer.</p>
                  </div>
                  <button type="button" onClick={requestBreathkeeperCue} disabled={breathkeeperLoading} className={`min-h-10 rounded-full border px-4 text-sm font-medium disabled:opacity-60 ${darkMode ? "border-emerald-100/20 bg-white/[0.04] text-emerald-50 hover:bg-white/[0.08]" : "border-emerald-800/25 bg-white text-emerald-950 hover:bg-emerald-100"}`}>
                    {breathkeeperLoading ? "Preparing cue…" : breathkeeperCue ? "Try another cue" : "Ask Breathkeeper"}
                  </button>
                </div>
                {breathkeeperCue && (
                  <div className={`mt-3 rounded-xl border p-3 ${darkMode ? "border-white/10 bg-slate-950/40" : "border-emerald-900/10 bg-white"}`}>
                    <p className={`text-sm leading-relaxed ${darkMode ? "text-white/85" : "text-slate-800"}`}>{breathkeeperCue}</p>
                    <label className={`mt-3 flex min-h-10 items-center gap-2 text-xs ${darkMode ? "text-white/70" : "text-slate-700"}`}>
                      <input type="checkbox" checked={includeBreathkeeperCue} onChange={(event) => setIncludeBreathkeeperCue(event.target.checked)} className="h-4 w-4 accent-emerald-600" />
                      Include this cue in the spoken introduction
                    </label>
                    <p className={`mt-1 text-[11px] leading-relaxed ${darkMode ? "text-white/50" : "text-slate-500"}`}>Only the selected 4–6 rhythm is sent. No journal entry or personal reflection is included.</p>
                  </div>
                )}
                {breathkeeperError && <p role="status" className={`mt-3 text-sm ${darkMode ? "text-amber-100" : "text-amber-900"}`}>{breathkeeperError}</p>}
              </section>
            )}
          <BreathingSessionView
            isActive={isSessionActive}
            darkMode={darkMode}
            pattern={breathingPattern}
            openingCue={includeBreathkeeperCue && canUseBreathkeeper ? breathkeeperCue : ""}
            voiceEnabled
            audioContext={breathingAudioContext}
          />
          </div>
        );
        }
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
  if (!isGroundingTool && protocolTool && Array.isArray(protocolTool.steps) && protocolTool.steps.length > 0) {
    return (
      <div className="wc-tool-detail min-h-screen bg-slate-950 text-white">
        <ToolProtocolView tool={protocolTool} onClose={closeTool} />
      </div>
    );
  }

  const DirectToolModule = MODULE_TOOLS[decodedId];
  if (DirectToolModule && toolMeta) {
    const onCloseModule = closeTool;
    return (
      <ToolModuleSession
        title={toolMeta.name || toolMeta.title}
        description={isGroundingTool ? null : (toolMeta.description || toolMeta.summary)}
        onClose={onCloseModule}
        onFindSupport={() => navigate("/assistance", { state: { from: "practice", ...createToolReturnState(location) } })}
        onCheckIn={() => navigate("/check-in", { state: { from: "practice", ...createToolReturnState(location) } })}
        onViewProgress={() => navigate("/milestones", { state: { from: "practice", ...createToolReturnState(location) } })}
        showProgressAction={practiceCompleted}
        completed={moduleCompleted}
        completedTitle={COMPLETION_COPY[decodedId]?.title}
        completedDescription={COMPLETION_COPY[decodedId]?.description}
      >
        <DirectToolModule
          tool={toolMeta}
          topic={decodedId === "education" ? null : undefined}
          onComplete={() => {
            setPracticeCompleted(true);
            // Panic Reset uses a legacy view that does not return a tool_result.
            // All standardized modules are counted by safeComplete instead.
            if (decodedId === "panic-reset") void recordPrivatePracticeCompletion().catch(() => {});
            if (!MODULE_OWNED_COMPLETION.has(decodedId)) setCompletedToolId(decodedId);
          }}
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
        <div className="wc-tool-detail relative min-h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-24 pt-6">
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
            onClose={closeTool}
          >
            <BreathingSessionView
              isActive={isSessionActive}
              darkMode={darkMode}
              onCycleComplete={() => setCycles((prev) => prev + 1)}
              pattern={[4, 0, 6, 0]} // 4-6 breathing: inhale 4, exhale 6, no holds
              voiceEnabled={soundEnabled} // Use soundEnabled state for voice guide
              audioContext={breathingAudioContext}
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
            onClick={closeTool}
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
        <div className="wc-tool-detail relative min-h-[70vh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-24 pt-6">
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
            onClose={closeTool}
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
