// A choice-led grounding pause. The legacy body-scan route remains supported,
// but this experience does not assess, rate, or collect body sensations.

import React, { useCallback, useState } from "react";
import { Armchair, DoorOpen, Hand, Move, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const STEADYING_CHOICES = [
  {
    id: "support",
    title: "Let something support you",
    context: "A chair, bed, wall, or the floor",
    cue: "Let the chair, bed, wall, or floor support you for a moment. Nothing to change.",
    Icon: Armchair,
  },
  {
    id: "movement",
    title: "Choose one easy movement",
    context: "A small shift, stretch, or stillness",
    cue: "Open your hands, shift position, or gently press your feet down. Staying still is okay.",
    Icon: Move,
  },
  {
    id: "familiar-object",
    title: "Keep a familiar object close",
    context: "Something ordinary within reach",
    cue: "Hold something familiar or set it nearby. No need to describe it.",
    Icon: Hand,
  },
  {
    id: "change-space",
    title: "Make one change to your space",
    context: "Light, sound, air, or where you are",
    cue: "If you can, adjust one thing: light, sound, air, or where you are.",
    Icon: DoorOpen,
  },
];

const BodyScanTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [startTime] = useState(() => Date.now());

  const finishPractice = useCallback(() => {
    const completedAt = Date.now();
    const result = createToolResult(
      "body_scan",
      "Steady Ground",
      "Completed an optional grounding pause.",
      { practiceType: "choice-led-grounding" },
      Math.floor((completedAt - startTime) / 1000),
    );

    // Track completion only; do not send body observations or the selected choice.
    logToolUsage("body_scan", {
      startedAt: startTime,
      completedAt,
      durationMs: completedAt - startTime,
      context: { completed: true },
    }).catch((err) => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [onComplete, startTime]);

  const handleCancel = useCallback(() => safeCancel(onCancel), [onCancel]);

  return (
    <div className="space-y-5">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-white">Steady Ground</h2>
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
        <p className="text-sm text-white/70">Choose one small thing that could help right now.</p>
        <p className="text-xs text-white/50">No ratings or written answers. Skip anything that does not fit.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Ways to find steady ground">
        {STEADYING_CHOICES.map(({ id, title, context, cue, Icon }) => {
          const isSelected = selectedChoice === id;
          const titleId = `steady-ground-${id}-title`;
          const cueId = `steady-ground-${id}-cue`;

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
                onClick={() => setSelectedChoice(id)}
                className="flex min-h-24 w-full items-start gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-300"
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
                  <button
                    type="button"
                    onClick={finishPractice}
                    className="mt-3 min-h-11 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Done for now
                  </button>
                </section>
              )}
            </div>
          );
        })}
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="min-h-11 rounded-lg px-3 text-sm text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
        >
          Leave practice
        </button>
      )}
    </div>
  );
};

export default BodyScanTool;
