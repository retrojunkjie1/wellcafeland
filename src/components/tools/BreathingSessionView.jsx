// src/components/tools/BreathingSessionView.jsx
// Cinematic orb-based breathing session
// Phase 37: Tool Sessions Activation Layer

import React, { useEffect, useState } from "react";

export const BreathingSessionView = ({
  isActive,
  onCycleComplete,
  pattern = [4, 4, 4, 4], // inhale, hold, exhale, hold
}) => {
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
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="relative flex aspect-square w-52 sm:w-64 items-center justify-center"
        style={{
          transform: `scale(${getScale()})`,
          transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl" />

        {/* Main orb */}
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 shadow-2xl shadow-amber-500/40">
          {/* Inner shimmer */}
          <div className="pointer-events-none absolute inset-5 rounded-full bg-gradient-to-br from-white/25 to-transparent blur-sm" />

          <div className="relative z-10 flex flex-col items-center gap-1 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-50/80">
              4 – 7 – 8
            </span>
            <span className="text-sm font-light text-amber-50/80">
              {phase === "idle" ? "Ready" : phase.toUpperCase()}
            </span>
          </div>

          {/* Pulse ring when active */}
          {isActive && (
            <div className="pointer-events-none absolute inset-0 rounded-full border border-amber-100/40 animate-ping" />
          )}
        </div>
      </div>

      <p className="max-w-xs text-center text-[0.75rem] leading-relaxed text-amber-50/80">
        {phaseLabel}
      </p>
    </div>
  );
};

