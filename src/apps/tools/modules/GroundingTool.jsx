// Choice-led orientation using the environment; no counting or written answers.

import React, { useCallback, useState } from "react";
import { DoorOpen, Eye, Hand, Headphones, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const ORIENTATION_CHOICES = [
  {
    id: "steady-view",
    title: "Rest your eyes on one steady thing",
    context: "A shape, color, or object nearby",
    cue: "Rest your eyes on one still object or color. Nothing to count or name.",
    Icon: Eye,
  },
  {
    id: "familiar-sound",
    title: "Listen for a familiar sound",
    context: "Or choose a little quiet",
    cue: "Listen for one familiar sound—or choose quiet.",
    Icon: Headphones,
  },
  {
    id: "texture",
    title: "Use a familiar texture",
    context: "A sleeve, blanket, or small object",
    cue: "Hold a familiar object if it helps. No need to describe it.",
    Icon: Hand,
  },
  {
    id: "orientation",
    title: "Choose where to look next",
    context: "Stay here, turn, or move somewhere else",
    cue: "Look toward a doorway, window, or another place you’d rather be. You choose whether to move.",
    Icon: DoorOpen,
  },
];

const GroundingTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [startTime] = useState(() => Date.now());

  const finishPractice = useCallback(() => {
    const completedAt = Date.now();
    const durationSeconds = Math.floor((completedAt - startTime) / 1000);
    const result = createToolResult(
      "grounding_54321",
      "Choose an Anchor",
      "Completed an optional orientation pause.",
      { practiceType: "choice-led-orientation" },
      durationSeconds,
    );

    // Log completion only; never send free text or the selected sensory anchor.
    logToolUsage("grounding_54321", {
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
          <h2 className="text-xl font-medium text-white">Choose an Anchor</h2>
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
        <p className="text-sm text-white/70">Choose one way to orient to the space around you.</p>
        <p className="text-xs text-white/50">No counting, naming, or written answers. You can skip this or leave at any time.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2" aria-label="Ways to orient to your surroundings">
        {ORIENTATION_CHOICES.map(({ id, title, context, cue, Icon }) => {
          const isSelected = selectedChoice === id;
          const titleId = `anchor-${id}-title`;
          const cueId = `anchor-${id}-cue`;

          return (
            <div
              key={id}
              className={`overflow-hidden rounded-2xl border transition ${
                isSelected
                  ? "border-cyan-200/50 bg-cyan-100/[0.06]"
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
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-cyan-200" aria-hidden="true">
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
                  className="border-t border-cyan-200/15 px-4 pb-4 pt-3 sm:px-5"
                >
                  <p className="text-sm leading-relaxed text-white">{cue}</p>
                  <button
                    type="button"
                    onClick={finishPractice}
                    className="mt-3 min-h-11 rounded-full bg-cyan-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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

export default GroundingTool;
