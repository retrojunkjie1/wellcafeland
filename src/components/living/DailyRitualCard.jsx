// Phase 47 — Daily Ritual Card Component
// Luxury, cinematic glowing card for daily alignment ritual

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { getDailyReflection } from "@/engines/reflection/dailyReflectionEngine";
import { beginSequence } from "@/engines/sequences/sequenceEngine";

export default function DailyRitualCard({ ritual, onBegin }) {
  const navigate = useNavigate();
  const dailyReflection = ritual || getDailyReflection();

  const displayTitle = ritual?.title || dailyReflection.title;
  const displayDescription = ritual?.description || dailyReflection.prompt || dailyReflection.description;

  // Get sequence key from ritual, or use default
  const sequenceKey = ritual?.sequenceKey || "ritual-grounding-seq";

  const handleBegin = () => {
    // If onBegin prop is provided, use it (for RitualSessionPanel)
    // Otherwise, fall back to sequence navigation
    if (onBegin) {
      onBegin();
    } else {
      beginSequence(sequenceKey, navigate);
    }
  };

  return (
    <div className="relative rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-900/80 p-4 sm:p-5 shadow-[0_24px_80px_rgba(245,197,94,0.15)] backdrop-blur-sm">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-50 blur-xl" />
      
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-amber-400/20 p-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-light tracking-wide text-amber-50">
            Today&apos;s Alignment Ritual
          </h2>
        </div>

        <div className="space-y-2">
          <p className="text-base font-medium text-amber-100/90">
            {displayTitle}
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-200/80 max-w-2xl line-clamp-2">
            {displayDescription}
          </p>
        </div>

        <button
          type="button"
          onClick={handleBegin}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,197,94,0.3)] transition-all"
        >
          Begin Ritual
        </button>
      </div>
    </div>
  );
}

