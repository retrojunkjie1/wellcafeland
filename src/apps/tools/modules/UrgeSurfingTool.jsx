// Choice-led, practical support for moments when an urge or craving feels strong.
// The selected action is kept in component state only; completion logs no reflection or ratings.

import React, { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Hand, HeartHandshake, MapPin, Pause, Play, RotateCcw, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const PAUSE_LENGTH_SECONDS = 180;

const SUPPORT_MOVES = [
  {
    id: "create-distance",
    title: "Put a little space between me and it",
    context: "Change rooms, step outside, or move the trigger out of reach",
    cue: "If it is safe, change what is within reach: step into another room, move near other people, or ask someone to hold onto the item for now.",
    Icon: MapPin,
  },
  {
    id: "reach-someone",
    title: "Bring another person in",
    context: "A trusted person, peer, sponsor, or support group",
    cue: "You can keep it simple: “Could you stay with me or talk for a few minutes? I could use company.” Choose someone who feels safe to contact.",
    Icon: HeartHandshake,
  },
  {
    id: "hands-busy",
    title: "Give my hands something else to do",
    context: "A small, familiar task that takes little planning",
    cue: "Choose something ordinary you can start now: make a drink, take a shower, put on a familiar song, or sort a few things nearby. It does not have to fix the feeling.",
    Icon: Hand,
  },
  {
    id: "basic-need",
    title: "Take care of one basic need",
    context: "Food, water, rest, or a prescribed medication",
    cue: "If you have not eaten or had water, start there. If a medication is part of your care, use it as prescribed. One small need is enough for now.",
    Icon: HeartHandshake,
  },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const UrgeSurfingTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedMove, setSelectedMove] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(PAUSE_LENGTH_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasStartedPause, setHasStartedPause] = useState(false);
  const [startTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isTimerRunning) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        return Math.max(0, seconds - 1);
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  useEffect(() => {
    if (secondsLeft === 0) setIsTimerRunning(false);
  }, [secondsLeft]);

  const finishPractice = useCallback(() => {
    const completedAt = Date.now();
    const durationSeconds = Math.floor((completedAt - startTime) / 1000);
    const result = createToolResult(
      "urge_surfing",
      "Urge Support",
      "Completed an optional practical support pause.",
      { practiceType: "choice-led-urge-support" },
      durationSeconds,
    );

    // Record completion only; never record the user's chosen move or personal details.
    logToolUsage("urge_surfing", {
      startedAt: startTime,
      completedAt,
      durationMs: completedAt - startTime,
      context: { completed: true },
    }).catch((error) => console.warn("Tool telemetry failed:", error));

    setIsTimerRunning(false);
    safeComplete(onComplete, result);
  }, [onComplete, startTime]);

  const handleCancel = useCallback(() => {
    setIsTimerRunning(false);
    safeCancel(onCancel);
  }, [onCancel]);

  const startPause = () => {
    setSecondsLeft(PAUSE_LENGTH_SECONDS);
    setHasStartedPause(true);
    setIsTimerRunning(true);
  };

  return (
    <div className="space-y-5">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Urge Support</h2>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close practice"
            className="min-h-11 min-w-11 rounded-full p-2 text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <X aria-hidden="true" className="mx-auto h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-sm text-white/80">When an urge feels strong, choose one useful next move.</p>
        <p className="text-xs leading-relaxed text-white/55">No ratings or explanations needed. Keep what helps; change direction or stop whenever you want.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Ways to support yourself through an urge">
        {SUPPORT_MOVES.map(({ id, title, context, cue, Icon }) => {
          const isSelected = selectedMove === id;
          const titleId = `urge-support-${id}-title`;
          const cueId = `urge-support-${id}-cue`;

          return (
            <div
              key={id}
              className={`overflow-hidden rounded-2xl border transition ${
                isSelected
                  ? "border-amber-200/50 bg-amber-100/[0.06]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <button
                type="button"
                aria-expanded={isSelected}
                aria-controls={isSelected ? cueId : undefined}
                onClick={() => {
                  setSelectedMove(id);
                  setIsTimerRunning(false);
                  setHasStartedPause(false);
                  setSecondsLeft(PAUSE_LENGTH_SECONDS);
                }}
                className="flex min-h-24 w-full items-start gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-amber-200" aria-hidden="true">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span id={titleId} className="block text-sm font-medium text-white">{title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-white/60">{context}</span>
                </span>
              </button>

              {isSelected && (
                <section
                  id={cueId}
                  role="region"
                  aria-labelledby={titleId}
                  aria-live="polite"
                  aria-atomic="true"
                  className="border-t border-amber-200/15 px-4 pb-4 pt-3 sm:px-5"
                >
                  <p className="text-sm leading-relaxed text-white">{cue}</p>

                  {hasStartedPause ? (
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4">
                      <p className="text-xs leading-relaxed text-white/60">A short pause can make room for your next choice. The timer does not predict how the urge will change; finish whenever you want.</p>
                      <p className="mt-3 text-center text-4xl font-light tabular-nums text-white" role="timer" aria-label={`${formatTime(secondsLeft)} remaining`}>
                        {formatTime(secondsLeft)}
                      </p>
                      {secondsLeft === 0 && <p className="mt-2 text-center text-sm text-emerald-100">Your pause is finished. You can stop here or take another step.</p>}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {secondsLeft > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsTimerRunning((running) => !running)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                          >
                            {isTimerRunning ? <><Pause aria-hidden="true" className="h-4 w-4" /> Pause</> : <><Play aria-hidden="true" className="h-4 w-4" /> Resume</>}
                          </button>
                        )}
                        {secondsLeft === 0 && (
                          <button
                            type="button"
                            onClick={startPause}
                            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                          >
                            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Start another pause
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={finishPractice}
                          className="min-h-11 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          Done for now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={startPause}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Play aria-hidden="true" className="h-4 w-4" /> Take a 3-minute pause
                      </button>
                      <button
                        type="button"
                        onClick={finishPractice}
                        className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                      >
                        Done for now
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          );
        })}
      </div>

      <a
        href="/assistance"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-white/65 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
      >
        Find real-world support <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </a>

      {onCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="block min-h-11 rounded-lg px-3 text-sm text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          Leave practice
        </button>
      )}
    </div>
  );
};

export default UrgeSurfingTool;
