// src/components/dashboard/GentleSuggestionsStrip.jsx
// Gentle suggestions based on emotional context
// Phase 43: Full Intelligent UI Activation Layer

import React from "react";
import { Sparkles, Wind, BookOpen, HeartHandshake } from "lucide-react";
import { useDailyReflection } from "@/hooks/useDailyReflection";
import { useTraumaPatterns } from "@/hooks/useTraumaPatterns";
import { useNavigate } from "react-router-dom";

export function GentleSuggestionsStrip() {
  const dailyReflection = useDailyReflection();
  const trauma = useTraumaPatterns({ recentEvents: [], streakGaps: [] });
  const navigate = useNavigate();

  // Default tone (can be enhanced with emotion detection later)
  const toneLabel = "You seem to be in a fairly balanced place.";

  const suggestions = [
    {
      id: "tool",
      icon: <Wind className="w-4 h-4" />,
      label: "Take a 4-7-8 breath",
      description:
        "A few gentle cycles can help your nervous system downshift.",
      onClick: () => navigate("/tools/breathing"),
    },
    {
      id: "topic",
      icon: <BookOpen className="w-4 h-4" />,
      label: "Visit a topic",
      description:
        trauma?.length > 0 && trauma[0]?.id === "ongoing-grief-focus"
          ? "You might find the Grief and Loss topic supportive right now."
          : "Pick any topic that feels close to what you're carrying.",
      onClick: () => navigate("/recovery"),
    },
    {
      id: "reflection",
      icon: <HeartHandshake className="w-4 h-4" />,
      label: "Short reflection",
      description:
        dailyReflection?.prompt ||
        "Take 60 seconds to put one feeling into words. It doesn't have to be neat.",
      onClick: () => navigate("/tools/journaling"),
    },
  ];

  return (
    <section className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <h3 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
          Gentle Suggestions
        </h3>
      </div>

      <p className="text-xs text-slate-400 mb-3">{toneLabel}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {suggestions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="group text-left rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/70 hover:bg-slate-900 px-3 py-3 transition-all shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center gap-2 mb-1 text-amber-200 text-xs font-medium">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/10 border border-amber-400/40">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {item.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

