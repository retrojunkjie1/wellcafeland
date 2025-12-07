// ===========================================================
// CINEMATIC RITUAL SEQUENCE PLAYER
// Handles multi-step flows, transitions, breathing UI,
// and tool bridge integration (via sessionDispatcher).
// ===========================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { launchSession } from "@/engines/sessions/sessionDispatcher";

export default function RitualSequencePlayer({ ritual, onExit }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [toolLaunched, setToolLaunched] = useState(false);

  if (!ritual || !ritual.steps || ritual.steps.length === 0) {
    return null;
  }

  const step = ritual.steps[index];
  const isLastStep = index === ritual.steps.length - 1;

  const goNext = () => {
    if (index < ritual.steps.length - 1) {
      setIndex(index + 1);
      setToolLaunched(false);
    } else {
      onExit?.();
    }
  };

  // Auto-launch tool when step type is "tool"
  useEffect(() => {
    if (step?.type === "tool" && !toolLaunched) {
      setToolLaunched(true);
      launchSession(step.key, navigate);
      // Auto-advance after a short delay
      const timer = setTimeout(() => {
        goNext();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, toolLaunched, navigate]);

  const renderStep = () => {
    if (!step) return null;

    switch (step.type) {
      case "instruction":
        return (
          <div className="text-center px-6 py-8">
            <p className="text-lg sm:text-xl leading-relaxed text-slate-100 max-w-2xl mx-auto">
              {step.text}
            </p>
          </div>
        );

      case "breathing":
        return (
          <div className="text-center px-6 py-8">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">
              Breathing Pattern
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-amber-100 mb-2">
              {step.pattern}
            </div>
            <div className="text-sm text-slate-400">
              Duration: {step.duration}s
            </div>
          </div>
        );

      case "tool":
        return (
          <div className="text-center px-6 py-8">
            <div className="text-sm text-slate-300">
              Opening tool...
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 z-50">
      <div className="relative w-full max-w-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onExit}
          className="absolute top-0 right-0 p-2 rounded-full bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-amber-100 hover:border-amber-400/60 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-amber-50 mb-2">
            {ritual.title}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Step {index + 1} of {ritual.steps.length}</span>
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-sm p-8 sm:p-12 mb-8 min-h-[200px] flex items-center justify-center">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          {!isLastStep && (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-100 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,197,94,0.3)] transition-all"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {isLastStep && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-amber-500/10 px-6 py-3 text-sm font-medium text-amber-100 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,197,94,0.3)] transition-all"
            >
              Complete Ritual
            </button>
          )}

          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Exit Ritual
          </button>
        </div>
      </div>
    </div>
  );
}

