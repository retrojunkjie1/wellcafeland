// Phase 46 — Living Guide Experience
// Luxury, cinematic, intelligent guidance interface

import React, { useState, useEffect, useMemo } from "react";
import { Circle, Heart, Shield, Brain, Activity, Waves, Sparkles } from "lucide-react";
import DailyRitualCard from "@/components/living/DailyRitualCard";
import ModuleCarousel from "@/components/living/ModuleCarousel";
import WhisperSuggestion from "@/components/living/WhisperSuggestion";
import RitualSessionPanel from "@/components/living/RitualSessionPanel";
import { getDailyReflection } from "@/engines/reflection/dailyReflectionEngine";
import { getAdaptiveRecommendations } from "@/engines/adaptive/emotionAdaptiveEngine";
import { useMemoryStore } from "@/store/memoryStore";
import { getLastSession } from "@/services/sessionHistory";

const modules = [
  {
    key: "foundations",
    title: "Healing Foundations",
    subtitle: "Core recovery insights",
    icon: Heart,
    sessionKey: "module-foundations",
  },
  {
    key: "trauma",
    title: "Trauma Recovery",
    subtitle: "Stability & safety",
    icon: Shield,
    sessionKey: "module-trauma",
  },
  {
    key: "emotional",
    title: "Emotional Mastery",
    subtitle: "Work with your emotions",
    icon: Brain,
    sessionKey: "module-emotional-mastery",
  },
  {
    key: "nervous",
    title: "Nervous System Reset",
    subtitle: "Regulate, breathe, restore",
    icon: Activity,
    sessionKey: "module-nervous-system",
  },
  {
    key: "cravings",
    title: "Craving Interventions",
    subtitle: "Ride the wave safely",
    icon: Waves,
    sessionKey: "module-cravings",
  },
  {
    key: "spiritual",
    title: "Spiritual Stability",
    subtitle: "Compassion & grounding",
    icon: Sparkles,
    sessionKey: "module-spiritual",
  },
];

export default function LivingGuidePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [systemMessage, setSystemMessage] = useState("");
  const [ritualOpen, setRitualOpen] = useState(false);
  const lastToolSession = useMemoryStore((state) => state.lastToolSession);
  const lastSession = getLastSession();

  // Get daily ritual with sequence key
  const ritual = useMemo(() => {
    const dailyReflection = getDailyReflection();
    const themeMap = {
      grounding: "ritual-grounding-seq",
      "self-compassion": "ritual-grounding-seq",
      grief: "ritual-grounding-seq",
      boundaries: "ritual-grounding-seq",
      rest: "ritual-grounding-seq",
      hope: "ritual-grounding-seq",
      gratitude: "ritual-grounding-seq",
      presence: "ritual-grounding-seq",
    };
    return {
      title: dailyReflection.title,
      description: dailyReflection.prompt,
      sessionKey: "ritual-grounding", // Legacy fallback
      sequenceKey: themeMap[dailyReflection.theme] || "ritual-grounding-seq",
    };
  }, []);

  // Get whisper suggestion
  const suggestion = useMemo(() => {
    const userState = {
      recentTools: lastToolSession?.toolId ? [lastToolSession.toolId] : [],
      currentRiskLevel: "low",
      sessionMetrics: {
        completionRate: lastSession ? 100 : 0,
        driftScore: 0,
      },
    };

    const recommendations = getAdaptiveRecommendations(userState);
    const emotionalState = recommendations.emotionalState || "neutral";

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

    return whispers[emotionalState] || whispers.neutral;
  }, [lastToolSession, lastSession]);

  // Generate system message based on state
  useEffect(() => {
    const generateSystemMessage = () => {
      const userState = {
        recentTools: lastToolSession?.toolId ? [lastToolSession.toolId] : [],
        currentRiskLevel: "low",
        sessionMetrics: {
          completionRate: lastSession ? 100 : 0,
          driftScore: 0,
        },
      };

      const recommendations = getAdaptiveRecommendations(userState);
      const emotionalState = recommendations.emotionalState || "neutral";

      const messages = {
        distressed: "Your system is stabilizing. A gentle reset is recommended.",
        anxious: "Your system is stabilizing. A gentle reset is recommended.",
        shame: "Your energy is low — a 3-minute centering might support you.",
        grief: "Your stress signals dropped — maintain your rhythm with a slow-breathing flow.",
        neutral: "Your OS learns you gently. One breath, one choice, one return at a time.",
      };

      setSystemMessage(messages[emotionalState] || messages.neutral);
    };

    generateSystemMessage();
    // Update message periodically
    const interval = setInterval(generateSystemMessage, 30000);
    return () => clearInterval(interval);
  }, [lastToolSession, lastSession]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Live Session Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Circle
                className={`h-3 w-3 ${
                  isOnline ? "text-amber-400" : "text-slate-500"
                }`}
                fill="currentColor"
              />
              {isOnline && (
                <div className="absolute inset-0 animate-ping">
                  <Circle
                    className="h-3 w-3 text-amber-400 opacity-75"
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-light tracking-wide text-amber-50">
                Living Guide Online
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">Anonymous</p>
            </div>
          </div>

          {systemMessage && (
            <div className="hidden sm:block text-right max-w-xs">
              <p className="text-sm text-slate-300 italic">{systemMessage}</p>
            </div>
          )}
        </header>

        {/* Daily Ritual Card */}
        <DailyRitualCard ritual={ritual} onBegin={() => setRitualOpen(true)} />

        {/* Module Horizon */}
        <ModuleCarousel modules={modules} />

        {/* Whisper Recommendation */}
        <WhisperSuggestion suggestion={suggestion} />

        {/* Cinematic Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            The Living Guide adapts to your state and learns how to support you.
          </p>
        </footer>
      </div>

      {/* Ritual Session Panel */}
      <RitualSessionPanel
        isOpen={ritualOpen}
        onClose={() => setRitualOpen(false)}
      />
    </div>
  );
}

