// src/apps/tools/modules/MeditationTool.jsx

import React, { useState, useEffect, useRef } from "react";
import { callAgent } from "../../../agents/aiAgents";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";

const DURATIONS = [3, 5, 10, 15, 20];

const MeditationTool = ({ tool }) => {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // seconds
  const [meditationTheme, setMeditationTheme] = useState(null);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && startTime) {
      handleComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, startTime]);

  const handleGenerateTheme = async () => {
    setIsGeneratingTheme(true);
    trackAction("tool_meditation_ai_theme_request", {
      toolId: tool.id,
      duration: selectedDuration,
    });

    try {
      const response = await callAgent("oracle", {
        mode: "meditation_theme",
        duration: selectedDuration,
      });

      if (response && response.reply) {
        setMeditationTheme(response.reply);
      } else {
        setMeditationTheme(
          "Focus on your breath. When your mind wanders, gently return to the breath."
        );
      }
    } catch (err) {
      console.error("Failed to generate theme:", err);
      setMeditationTheme(
        "Focus on your breath. When your mind wanders, gently return to the breath."
      );
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleStart = () => {
    setStartTime(new Date().getTime());
    setIsActive(true);
    setTimeRemaining(selectedDuration * 60);
    trackAction("tool_meditation_start", {
      toolId: tool.id,
      duration: selectedDuration,
    });
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleResume = () => {
    setIsActive(true);
  };

  const handleComplete = async () => {
    setIsActive(false);
    if (startTime) {
      const now = new Date().getTime();
      const durationMs = now - startTime;
      await logToolUsage(tool.id, {
        startedAt: startTime,
        completedAt: now,
        durationMs,
        duration: selectedDuration,
        context: {
          theme: meditationTheme,
        },
      });
      setStartTime(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div className="lux-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose Duration
        </h3>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((duration) => (
            <button
              key={duration}
              type="button"
              onClick={() => {
                if (!isActive) {
                  setSelectedDuration(duration);
                  setTimeRemaining(duration * 60);
                }
              }}
              disabled={isActive}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedDuration === duration
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${isActive ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {duration} min
            </button>
          ))}
        </div>
      </div>

      {/* Theme Generator */}
      <div className="lux-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Meditation Theme (Optional)
          </h3>
          <button
            type="button"
            onClick={handleGenerateTheme}
            disabled={isGeneratingTheme || isActive}
            className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60 transition-colors"
          >
            {isGeneratingTheme ? "Generating..." : "Ask Oracle for theme"}
          </button>
        </div>
        {meditationTheme && (
          <p className="text-sm text-foreground italic">{meditationTheme}</p>
        )}
      </div>

      {/* Timer Display */}
      <div className="lux-card p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-40 h-40 rounded-full border-2 border-amber-400/30 flex items-center justify-center">
            <span className="text-5xl font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        {timeRemaining === 0 && (
          <p className="text-sm text-emerald-400 font-medium mb-4">
            ✓ Meditation Complete
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isActive && timeRemaining > 0 && (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
          >
            Start
          </button>
        )}
        {isActive && (
          <button
            type="button"
            onClick={handlePause}
            className="inline-flex items-center justify-center rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-400 px-6 py-2 text-sm font-medium hover:bg-amber-400/20 transition-colors"
          >
            Pause
          </button>
        )}
        {!isActive && timeRemaining > 0 && timeRemaining < selectedDuration * 60 && (
          <button
            type="button"
            onClick={handleResume}
            className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
          >
            Resume
          </button>
        )}
        {timeRemaining === 0 && (
          <button
            type="button"
            onClick={() => {
              setTimeRemaining(selectedDuration * 60);
              setStartTime(null);
            }}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Start New Session
          </button>
        )}
      </div>
    </div>
  );
};

export default MeditationTool;

