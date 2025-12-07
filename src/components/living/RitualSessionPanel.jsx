// src/components/living/RitualSessionPanel.jsx

import React from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Activity,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { useRitualSession } from "@/hooks/useRitualSession";

const statusLabels = {
  arriving: "Arriving",
  stabilizing: "Stabilizing",
  reclaiming: "Reclaiming Ground",
};

const statusColors = {
  arriving: "text-amber-300 bg-amber-500/10 border-amber-400/40",
  stabilizing: "text-teal-200 bg-teal-500/10 border-teal-400/40",
  reclaiming: "text-emerald-200 bg-emerald-500/10 border-emerald-400/40",
};

export default function RitualSessionPanel({ isOpen, onClose }) {
  const {
    ritual,
    currentStepIndex,
    isActive,
    telemetry,
    beginNewRitual,
    goToNextStep,
    goToPrevStep,
    endSession,
  } = useRitualSession();

  if (!isOpen) return null;

  const currentStep =
    ritual && ritual.steps ? ritual.steps[currentStepIndex] : null;

  const statusKey = telemetry.statusLabel || "arriving";
  const statusStyle = statusColors[statusKey] || statusColors.arriving;

  const handleClose = () => {
    endSession();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Panel */}
      <div className="w-full max-w-3xl sm:rounded-3xl rounded-t-3xl bg-slate-950/90 border border-amber-500/20 shadow-[0_0_120px_rgba(245,158,11,0.35)] overflow-hidden relative">
        {/* Subtle gradient halo */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-emerald-500/10" />

        {/* Header */}
        <div className="relative z-10 px-6 pt-4 pb-2 flex items-start justify-between gap-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Ritual Session
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-light text-amber-100">
              {ritual?.name || "Intelligent Grounding Ritual"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-amber-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-5 pt-3 space-y-5">
          {/* Telemetry Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-3">
              {/* Grounding Score */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 border border-white/10">
                <HeartPulse className="w-4 h-4 text-amber-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    Grounding Score
                  </span>
                  <span className="text-sm text-amber-100">
                    {telemetry.groundingScore} / 100
                  </span>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/80 border border-white/10">
                <Activity className="w-4 h-4 text-emerald-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">
                    Progress
                  </span>
                  <span className="text-sm text-emerald-100">
                    {telemetry.progressPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl text-xs border ${statusStyle}`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="uppercase tracking-[0.18em]">
                {statusLabels[statusKey] || "Arriving"}
              </span>
            </div>
          </div>

          {/* Main Step Card */}
          <div className="relative rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden">
            {/* Orb / Visual */}
            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-emerald-500 opacity-30 blur-2xl" />
            <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 opacity-80 shadow-[0_0_45px_rgba(251,191,36,0.9)]" />

            <div className="relative p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
                    Step {ritual && ritual.steps ? currentStepIndex + 1 : 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-light text-amber-50">
                    {currentStep?.title || "Begin When You're Ready"}
                  </h3>
                </div>
              </div>
              
              {/* Numbering aligned with golden orb */}
              {ritual?.steps && (
                <span 
                  className="absolute right-9 top-8 flex items-center justify-center text-sm text-amber-200/90 font-semibold tracking-tight pointer-events-none"
                  style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.6), 0 0 6px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.3))'
                  }}
                >
                  {currentStepIndex + 1} / {ritual.steps.length}
                </span>
              )}

              <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200/90">
                {currentStep?.text ||
                  "When you tap Begin, we'll guide you step by step. No pressure, no rush. Just presence."}
              </p>

              {/* Recommendation */}
              <div className="mt-2 rounded-xl bg-slate-950/70 border border-amber-500/20 px-4 py-3">
                <p className="text-[11px] text-amber-100/90 leading-relaxed">
                  {telemetry.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={!ritual || currentStepIndex === 0}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 text-xs text-slate-200 hover:bg-slate-900/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={
                  !ritual ||
                  !ritual.steps ||
                  currentStepIndex >= ritual.steps.length - 1
                }
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-400/40 text-xs text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={isActive ? handleClose : beginNewRitual}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-500/15 text-red-200 border border-red-400/50 hover:bg-red-500/25"
                    : "bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-lg shadow-amber-500/40 hover:shadow-amber-400/60"
                }`}
              >
                {isActive ? "End Ritual" : "Begin Ritual"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

