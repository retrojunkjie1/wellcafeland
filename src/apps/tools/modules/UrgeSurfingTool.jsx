// src/apps/tools/modules/UrgeSurfingTool.jsx
// Urge surfing with intensity tracking

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const COACH_INSTRUCTIONS = {
  rising: "The urge is rising. Notice it without judgment. You don't need to act on it.",
  peak: "You're at the peak. This is the hardest moment. Stay with it. The wave will pass.",
  falling: "The wave is receding. Notice how the intensity is decreasing. You're doing it.",
  passed: "The wave has passed. You rode it out. Notice how you feel now.",
};

const UrgeSurfingTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [mode, setMode] = useState(null); // "3min" or "10min"
  const [step, setStep] = useState(1); // 1: name, 2: rate before, 3: timer, 4: rate after, 5: reflection
  const [urgeName, setUrgeName] = useState("");
  const [intensityBefore, setIntensityBefore] = useState(5);
  const [intensityAfter, setIntensityAfter] = useState(5);
  const [reflection, setReflection] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [startTime] = useState(() => Date.now());
  const timerRef = useRef(null);

  const duration = mode === "3min" ? 180 : 600; // 3 min or 10 min in seconds
  const progress = duration > 0 ? (timerSeconds / duration) * 100 : 0;

  const getWaveStage = () => {
    const progressPercent = progress / 100;
    if (progressPercent < 0.3) return "rising";
    if (progressPercent < 0.7) return "peak";
    if (progressPercent < 0.95) return "falling";
    return "passed";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    const improvement = intensityBefore - intensityAfter;

    const result = createToolResult(
      "urge_surfing",
      "Urge Surfing",
      `Rode the wave for ${mode}. Intensity ${improvement > 0 ? `decreased from ${intensityBefore} to ${intensityAfter}` : `changed from ${intensityBefore} to ${intensityAfter}`}`,
      {
        mode,
        urgeName,
        intensityBefore,
        intensityAfter,
        improvement,
        reflection: reflection.trim() || null,
        durationMinutes: Math.floor(durationSeconds / 60),
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage("urge_surfing", {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        mode,
        intensityBefore,
        intensityAfter,
        improvement,
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [mode, urgeName, intensityBefore, intensityAfter, reflection, startTime, onComplete]);

  const handleCancel = useCallback(() => {
    if (isTimerActive) {
      setIsTimerActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    safeCancel(onCancel);
  }, [isTimerActive, onCancel]);

  const handleNext = useCallback(() => {
    if (step === 1 && !urgeName.trim()) return;
    if (step === 2) {
      setStep(3);
      setIsTimerActive(true);
    } else if (step === 3) {
      setIsTimerActive(false);
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else {
      handleComplete();
    }
  }, [step, urgeName, handleComplete]);

  const handleTimerComplete = useCallback(() => {
    setIsTimerActive(false);
    setStep(4);
  }, []);

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsTimerActive(false);
            setTimeout(() => {
              handleTimerComplete();
            }, 500);
            return duration;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive, duration, handleTimerComplete]);

  const waveStage = step === 3 ? getWaveStage() : null;

  // Step 0: Mode Selection
  if (!mode) {
    return (
      <div className="space-y-6">
        {!isEmbedded && onCancel && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">Urge Surfing</h3>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5 w-full">
          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Choose Duration</h3>
          <p className="text-sm sm:text-base text-white/60 mb-4 break-words">
            Select how long you want to ride the wave.
          </p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setMode("3min")}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-white transition hover:bg-white/10 min-h-[48px]"
            >
              3 Minutes
            </button>
            <button
              type="button"
              onClick={() => setMode("10min")}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium text-white transition hover:bg-white/10 min-h-[48px]"
            >
              10 Minutes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Urge Surfing</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 1: Name the Urge */}
      {step === 1 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4 animate-fade-in w-full">
          <h3 className="text-base sm:text-lg font-medium text-white mb-2 break-words">
            Step 1: Name the Urge
          </h3>
          <p className="text-sm sm:text-base text-white/60 mb-4 break-words">
            What are you feeling the urge to do? Be specific and honest.
          </p>
          <input
            type="text"
            value={urgeName}
            onChange={(e) => setUrgeName(e.target.value)}
            placeholder="e.g., use substances, binge eat, self-harm..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleNext}
            disabled={!urgeName.trim()}
            className="w-full rounded-lg bg-white/10 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2: Rate Intensity Before */}
      {step === 2 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-2">
            Step 2: Rate the Intensity
          </h3>
          <p className="text-base text-white/60 mb-4">
            How intense is this urge right now? (0 = no urge, 10 = overwhelming)
          </p>
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="10"
              value={intensityBefore}
              onChange={(e) => setIntensityBefore(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-4xl font-light text-white">{intensityBefore}</span>
              <p className="text-sm text-white/50 mt-1">
                {intensityBefore <= 3
                  ? "Mild"
                  : intensityBefore <= 6
                  ? "Moderate"
                  : intensityBefore <= 8
                  ? "Strong"
                  : "Overwhelming"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-lg bg-white/10 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px]"
          >
            Start Riding the Wave →
          </button>
        </div>
      )}

      {/* Step 3: Timer with Timeline */}
      {step === 3 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center space-y-6 animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-2">Ride the Wave</h3>
          <p className="text-base text-white/60 mb-4">
            The urge is like a wave. It will rise, peak, and fall. You don't need to act on it. Just observe it.
          </p>
          
          {/* Timeline Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-white/30 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/50">
              <span>0:00</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-6xl font-light text-white mb-4">
            {formatTime(timerSeconds)}
          </div>

          {/* Coach Instructions */}
          {waveStage && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 animate-fade-in">
              <p className="text-base text-white/80">
                {COACH_INSTRUCTIONS[waveStage]}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg bg-white/10 px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px]"
          >
            I'm Ready to Check In
          </button>
        </div>
      )}

      {/* Step 4: Rate Intensity After */}
      {step === 4 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-5 space-y-4 animate-fade-in">
          <h3 className="text-lg font-medium text-white mb-2">
            Step 3: Rate the Intensity Now
          </h3>
          <p className="text-base text-white/60 mb-4">
            How intense is the urge now? (0 = no urge, 10 = overwhelming)
          </p>
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="10"
              value={intensityAfter}
              onChange={(e) => setIntensityAfter(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-4xl font-light text-white">{intensityAfter}</span>
              <p className="text-sm text-white/50 mt-1">
                {intensityAfter < intensityBefore
                  ? "✓ The wave is receding"
                  : intensityAfter === intensityBefore
                  ? "The wave is holding"
                  : "The wave may still be rising"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full rounded-lg bg-white/10 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px]"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 5: Reflection */}
      {step === 5 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4 animate-fade-in w-full">
          <h3 className="text-base sm:text-lg font-medium text-white mb-2">Reflection</h3>
          <p className="text-sm sm:text-base text-white/60 mb-4 break-words">
            How did it feel to ride the wave? What did you notice?
          </p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your reflection here..."
            rows={6}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none break-words"
          />
          <button
            type="button"
            onClick={handleComplete}
            className="w-full rounded-lg bg-white/10 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px]"
          >
            Complete Session
          </button>
        </div>
      )}
    </div>
  );
};

export default UrgeSurfingTool;
