// src/apps/tools/BreathingToolPage.jsx
// Phase 52: Calm Reset MVP — 4s inhale, 4s hold, 6s exhale

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/os/PageHeader";

const PATTERN = [4, 4, 6, 0]; // inhale, hold, exhale, hold2
const DURATIONS = [1, 3, 5]; // minutes

const BreathingToolPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false);
  const phaseRef = useRef(null);
  const activeRef = useRef(false);

  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setSessionSeconds((s) => {
        const next = s + 1;
        if (next >= totalSeconds) {
          setIsActive(false);
          setCompleted(true);
          setPhase("idle");
          return next;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, totalSeconds]);

  const runPhase = useCallback(() => {
    if (!activeRef.current) return;
    const phases = ["inhale", "hold1", "exhale"];
    const times = [PATTERN[0], PATTERN[1], PATTERN[2]];
    let idx = 0;

    const step = () => {
      if (!activeRef.current) return;
      setPhase(phases[idx]);
      const ms = times[idx] * 1000;
      phaseRef.current = setTimeout(step, ms);
      idx = (idx + 1) % 3;
    };
    step();
  }, []);

  useEffect(() => {
    if (!isActive) {
      if (phaseRef.current) {
        clearTimeout(phaseRef.current);
        phaseRef.current = null;
      }
      return;
    }
    runPhase();
    return () => {
      if (phaseRef.current) clearTimeout(phaseRef.current);
    };
  }, [isActive, runPhase]);

  const handleStart = () => {
    setCompleted(false);
    setSessionSeconds(0);
    setIsActive(true);
  };

  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setIsActive(false);
    setCompleted(false);
    setSessionSeconds(0);
    setPhase("idle");
  };

  return (
    <div className="flex flex-col min-h-[60vh] bg-slate-950 text-white">
      <PageHeader title="Calm Reset" subtitle="4 · 4 · 6 breathing" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {completed ? (
          <div className="text-center space-y-6">
            <p className="text-lg text-white/90">Session complete.</p>
            <p className="text-sm text-white/60">You took a moment to reset. Well done.</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 hover:bg-white/10 transition"
            >
              Return Home
            </button>
          </div>
        ) : (
          <>
            {!isActive && (
              <div className="mb-8 w-full max-w-xs space-y-4">
                <p className="text-sm text-white/60 text-center">Session length</p>
                <div className="flex justify-center gap-2">
                  {DURATIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMinutes(m)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        durationMinutes === m
                          ? "bg-amber-400/20 text-amber-200 border border-amber-400/40"
                          : "border border-white/10 text-white/60 hover:text-white/80"
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center border-2 border-amber-400/30 transition-all duration-700"
              style={{
                transform: phase === "inhale" ? "scale(1.15)" : phase === "exhale" ? "scale(0.9)" : "scale(1)",
                opacity: phase === "idle" ? 0.7 : 1,
                background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
              }}
            >
              <span className="text-sm uppercase tracking-widest text-white/80">
                {phase === "idle" ? "Ready" : phase}
              </span>
            </div>

            {isActive && (
              <p className="mt-6 text-white/60 text-sm">
                {Math.floor(sessionSeconds / 60)}:{String(sessionSeconds % 60).padStart(2, "0")} / {durationMinutes}:00
              </p>
            )}

            <div className="mt-8 flex gap-3">
              {!isActive ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-6 py-3 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition"
                >
                  Start
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 hover:bg-white/10 transition"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 hover:bg-white/10 transition"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BreathingToolPage;
