// src/components/tools/BreathingSessionView.jsx
// Cinematic orb-based breathing session
// Phase 37: Tool Sessions Activation Layer

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useSmartNav } from "@/navigation/useSmartNav";

export const BreathingSessionView = ({
  isActive,
  onCycleComplete,
  pattern = [4, 4, 4, 4], // inhale, hold, exhale, hold
}) => {
  const { back } = useSmartNav();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (!isActive) {
      setPhase("idle");
      return;
    }

    const phases = ["inhale", "hold1", "exhale", "hold2"];
    setPhase(phases[0]);
    setPhaseIndex(0);

    let cancelled = false;

    const runCycle = (currentIndex) => {
      if (cancelled) return;

      const ms = (pattern[currentIndex] ?? 4) * 1000;
      setPhase(phases[currentIndex]);

      const timeoutId = setTimeout(() => {
        if (cancelled) return;

        const nextIndex = (currentIndex + 1) % phases.length;
        setPhaseIndex(nextIndex);

        if (nextIndex === 0 && onCycleComplete) {
          onCycleComplete();
        }
        runCycle(nextIndex);
      }, ms);

      return () => clearTimeout(timeoutId);
    };

    const cleanup = runCycle(0);

    return () => {
      cancelled = true;
      if (typeof cleanup === "function") cleanup();
    };
  }, [isActive, pattern, onCycleComplete]);

  const getScale = () => {
    if (!isActive) return 1;
    if (phase === "inhale") return 1.35;
    if (phase === "exhale") return 0.8;
    return 1.05;
  };

  const phaseLabel =
    phase === "inhale"
      ? "Inhale softly through your nose"
      : phase === "exhale"
      ? "Exhale slowly through your mouth"
      : phase === "hold1"
      ? "Hold gently – nothing to do"
      : phase === "hold2"
      ? "Rest for a moment"
      : "Press Begin to start";

  return (
    <>
      {/* Floating back button - quiet and respectful */}
      <button
        type="button"
        onClick={back}
        className="fixed top-[calc(12px+env(safe-area-inset-top))] left-3 z-50 inline-flex items-center justify-center rounded-full p-2 text-xs transition hover:opacity-100 glass-panel backdrop-blur-xl bg-white/5 border border-white/10 text-amber-200/60 hover:text-amber-200"
        aria-label="Go back"
        style={{ top: 'calc(12px + env(safe-area-inset-top))' }}
      >
        <ArrowLeft size={14} />
      </button>

      {/* Orb zone - vertically centered and dominant */}
      <div className="flex flex-col items-center justify-center gap-4 overflow-visible min-h-[60vh]">
        <div
          className="relative flex aspect-square w-52 sm:w-64 items-center justify-center overflow-visible"
          style={{
            transform: `scale(${getScale()})`,
            transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
        {/* Outer glow - no background, just glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl" />

        {/* Main orb - transparent background with border and glow only */}
        <div className="relative flex h-full w-full items-center justify-center rounded-full border-4 border-amber-400/80 shadow-2xl shadow-amber-500/50" style={{ background: 'transparent', overflow: 'visible' }}>
          {/* Inner glow ring */}
          <div className="pointer-events-none absolute inset-2 rounded-full border-2 border-amber-300/40" />

          {/* Text content */}
          <div className="relative z-10 flex flex-col items-center gap-1 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-200/90">
              4 – 7 – 8
            </span>
            <span className="text-sm font-light text-amber-200/90">
              {phase === "idle" ? "Ready" : phase.toUpperCase()}
            </span>
          </div>

          {/* Pulse ring when active - smooth animation */}
          {isActive && (
            <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-amber-200/60 animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          )}
        </div>
      </div>

        <p className="max-w-xs text-center text-[0.75rem] leading-relaxed text-amber-50/80">
          {phaseLabel}
        </p>
      </div>
    </>
  );
};

