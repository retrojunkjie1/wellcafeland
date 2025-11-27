// src/apps/tools/modules/BreathingTool.jsx
// Breathing tool with multiple modes: 4-7-8, Box, Coherent

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

const BREATHING_MODES = {
  "478": {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Calming technique: inhale 4, hold 7, exhale 8",
    steps: [
      { phase: "inhale", seconds: 4, text: "Breathe in slowly and deeply through your nose" },
      { phase: "hold", seconds: 7, text: "Hold your breath gently" },
      { phase: "exhale", seconds: 8, text: "Exhale slowly and completely through your mouth" },
    ],
  },
  "box": {
    id: "box",
    name: "Box Breathing",
    description: "Equal 4-count breathing: in, hold, out, hold",
    steps: [
      { phase: "inhale", seconds: 4, text: "Breathe in slowly" },
      { phase: "hold", seconds: 4, text: "Hold gently" },
      { phase: "exhale", seconds: 4, text: "Exhale slowly" },
      { phase: "hold", seconds: 4, text: "Hold at the bottom" },
    ],
  },
  "coherent": {
    id: "coherent",
    name: "Coherent Breathing",
    description: "5-6 breaths per minute for nervous system regulation",
    steps: [
      { phase: "inhale", seconds: 5, text: "Breathe in slowly and deeply" },
      { phase: "exhale", seconds: 5, text: "Exhale slowly and completely" },
    ],
  },
};

const DURATIONS = [1, 3, 5, 10]; // minutes

const BreathingTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(3);
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const intervalRef = useRef(null);
  const elapsedIntervalRef = useRef(null);

  // Calculate cycles based on duration
  const calculateCycles = (mode, durationMinutes) => {
    const modeData = BREATHING_MODES[mode];
    if (!modeData) return 6;
    
    const cycleSeconds = modeData.steps.reduce((sum, step) => sum + step.seconds, 0);
    const totalSeconds = durationMinutes * 60;
    return Math.max(1, Math.floor(totalSeconds / cycleSeconds));
  };

  // Handle completion
  const handleComplete = useCallback(() => {
    if (!selectedMode || !startTime) return;
    
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    const modeData = BREATHING_MODES[selectedMode];
    
    const result = createToolResult(
      `breathing_${selectedMode}`,
      modeData.name,
      `Completed ${currentCycle} cycles of ${modeData.name} over ${Math.floor(durationSeconds / 60)} minutes`,
      {
        mode: selectedMode,
        modeName: modeData.name,
        cycles: currentCycle,
        totalBreaths: totalBreaths,
        durationMinutes: Math.floor(durationSeconds / 60),
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage(`breathing_${selectedMode}`, {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        mode: selectedMode,
        cycles: currentCycle,
        totalBreaths,
        durationMinutes: Math.floor(durationSeconds / 60),
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [selectedMode, startTime, currentCycle, totalBreaths, onComplete]);

  // Handle cancellation
  const handleCancel = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    safeCancel(onCancel);
  }, [isActive, onCancel]);

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive || !selectedMode) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const modeData = BREATHING_MODES[selectedMode];
    const cycles = calculateCycles(selectedMode, selectedDuration);
    const step = modeData.steps[currentStep];
    if (!step) return;

    // Set initial countdown asynchronously to avoid cascading renders
    setTimeout(() => {
      setCountdown(step.seconds);
    }, 0);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextStep = (currentStep + 1) % modeData.steps.length;
          
          // Completed a full cycle
          if (nextStep === 0) {
            const newCycle = currentCycle + 1;
            setCurrentCycle(newCycle);
            setTotalBreaths(prev => prev + 1);
            
            // Check if we've completed all cycles
            if (newCycle >= cycles) {
              setIsActive(false);
              handleComplete();
              return 0;
            }
          }
          
          setCurrentStep(nextStep);
          const nextStepData = modeData.steps[nextStep];
          return nextStepData.seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, selectedMode, currentStep, currentCycle, selectedDuration, handleComplete]);

  const handleStart = () => {
    if (!selectedMode) return;
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentStep(0);
    setTotalBreaths(0);
    const now = Date.now();
    setStartTime(now);
    setElapsedMinutes(0);
    const modeData = BREATHING_MODES[selectedMode];
    setCountdown(modeData.steps[0].seconds);
  };

  const handleStop = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleReset = () => {
    handleStop();
    setCurrentCycle(0);
    setCurrentStep(0);
    setCountdown(0);
    setTotalBreaths(0);
    setStartTime(null);
    setElapsedMinutes(0);
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  };

  // Mode selection screen
  if (!selectedMode) {
    return (
      <div className="space-y-6">
        {!isEmbedded && onCancel && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">Breathing Exercise</h3>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-base text-white/70">Choose a breathing technique:</p>
          
          <div className="space-y-3">
            {Object.values(BREATHING_MODES).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedMode(mode.id)}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition"
              >
                <h4 className="text-base font-medium text-white mb-1">{mode.name}</h4>
                <p className="text-sm text-white/60">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Duration selection (if mode selected but not started)
  if (!isActive && !startTime) {
    const modeData = BREATHING_MODES[selectedMode];
    
    return (
      <div className="space-y-6">
        {!isEmbedded && onCancel && (
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-white">{modeData.name}</h3>
            <button
              type="button"
              onClick={() => {
                setSelectedMode(null);
                handleReset();
              }}
              className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-base text-white/70">How long would you like to practice?</p>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            {DURATIONS.map((duration) => {
              const cyclesForDuration = calculateCycles(selectedMode, duration);
              return (
                <button
                  key={duration}
                  type="button"
                  onClick={() => {
                    setSelectedDuration(duration);
                    handleStart();
                  }}
                  className={`rounded-lg border p-3 sm:p-4 text-center transition min-h-[48px] ${
                    selectedDuration === duration
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/8"
                  }`}
                >
                  <div className="text-base sm:text-lg font-medium text-white">{duration} min</div>
                  <div className="text-xs text-white/50 mt-1">{cyclesForDuration} cycles</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active breathing session
  const modeData = BREATHING_MODES[selectedMode];
  const currentStepData = modeData.steps[currentStep];

  return (
    <div className="space-y-6">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium text-white">{modeData.name}</h3>
            <p className="text-sm text-white/50">
              Cycle {currentCycle} • {elapsedMinutes} min
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Breathing Visualization */}
      <div className="flex flex-col items-center justify-center space-y-6 py-4 sm:py-8 w-full">
        <div className="relative w-full max-w-full flex justify-center">
          <div
            className={`relative h-40 w-40 sm:h-48 sm:w-48 rounded-full border-2 flex items-center justify-center transition-all ${
              isActive
                ? "border-white/30 bg-white/5 animate-pulse"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="text-center">
              <div className="text-6xl font-light text-white mb-2">
                {isActive ? countdown : "—"}
              </div>
              <div className="text-base font-medium text-white/80 uppercase tracking-wide">
                {isActive ? currentStepData.phase : "Ready"}
              </div>
              {isActive && currentStepData.text && (
                <div className="text-sm text-white/60 mt-2 max-w-[200px]">
                  {currentStepData.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          {!isActive ? (
            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg bg-white/10 px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px]"
            >
              Start
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStop}
                className="rounded-lg border border-white/10 bg-white/5 px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/10 min-h-[48px]"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-3 sm:p-2.5 bg-white/5 text-white/70 border border-white/10 transition hover:bg-white/10 hover:text-white min-h-[48px] min-w-[48px] flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Progress Indicators */}
        {isActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              {modeData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep
                      ? "w-8 bg-white/40"
                      : idx < currentStep
                      ? "w-4 bg-white/20"
                      : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>
            <div className="text-center text-sm text-white/50">
              {totalBreaths} breath{totalBreaths !== 1 ? "s" : ""} completed
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingTool;
