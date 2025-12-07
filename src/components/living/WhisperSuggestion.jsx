// Phase 46 — Whisper Recommendation Component
// Tiny, intelligent single suggestion based on emotion + session data

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdaptiveRecommendations } from "@/engines/adaptive/emotionAdaptiveEngine";
import { getLastSession } from "@/services/sessionHistory";
import { useMemoryStore } from "@/store/memoryStore";
import { launchSession } from "@/engines/sessions/sessionDispatcher";

export default function WhisperSuggestion({ suggestion }) {
  const navigate = useNavigate();
  const lastToolSession = useMemoryStore((state) => state.lastToolSession);
  const lastSession = getLastSession();

  const whisper = useMemo(() => {
    // If suggestion is provided as prop, use it
    if (suggestion) {
      return suggestion;
    }

    // Otherwise, generate from state
    const userState = {
      recentTools: lastToolSession?.toolId ? [lastToolSession.toolId] : [],
      currentRiskLevel: "low", // Could be enhanced with actual risk detection
      sessionMetrics: {
        completionRate: lastSession ? 100 : 0,
        driftScore: 0,
      },
    };

    const recommendations = getAdaptiveRecommendations(userState);

    // Generate whisper message based on emotional state and recommendations
    const whispers = {
      distressed: {
        text: "A grounding reset may help steady your breathing.",
        sessionKey: "suggestion-grounding",
      },
      anxious: {
        text: "Your system is stabilizing. A gentle reset is recommended.",
        sessionKey: "suggestion-calming",
      },
      shame: {
        text: "Your energy is low — a 3-minute centering might support you.",
        sessionKey: "suggestion-grounding",
      },
      grief: {
        text: "Your stress signals dropped — maintain your rhythm with a slow-breathing flow.",
        sessionKey: "suggestion-calming",
      },
      neutral: {
        text: "A moment of presence could support your day.",
        sessionKey: "suggestion-grounding",
      },
    };

    const emotionalState = recommendations.emotionalState || "neutral";
    const whisperData = whispers[emotionalState] || whispers.neutral;

    return {
      text: whisperData.text,
      sessionKey: whisperData.sessionKey,
      tools: recommendations.tools || [],
      emotionalState,
    };
  }, [lastToolSession, lastSession, suggestion]);

  if (!whisper?.text) return null;

  const handleClick = () => {
    if (whisper.sessionKey) {
      launchSession(whisper.sessionKey, navigate);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
        For You
      </h3>
      <div
        onClick={handleClick}
        className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 backdrop-blur-sm cursor-pointer hover:bg-slate-900/60 hover:border-amber-400/40 transition-all"
      >
        <p className="text-base leading-relaxed text-slate-200/90">
          {whisper.text}
        </p>
      </div>
    </section>
  );
}

