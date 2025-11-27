// src/apps/tools/modules/AcuwellnessTool.jsx

import React, { useState } from "react";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";

const AcuwellnessTool = ({ tool }) => {
  const [startTime] = useState(() => new Date().getTime());
  const [hasRead, setHasRead] = useState(false);

  const handleComplete = async () => {
    if (!hasRead) return;

    const now = new Date().getTime();
    const durationMs = now - startTime;
    await logToolUsage(tool.id, {
      startedAt: startTime,
      completedAt: now,
      durationMs,
    });

    trackAction("tool_acuwellness_complete", { toolId: tool.id });
  };

  return (
    <div className="space-y-6">
      {/* What is Acuwellness */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">What is Acuwellness?</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Acuwellness is a self-care practice based on acupressure principles.
          It involves applying gentle pressure to specific points on your body
          to promote relaxation, reduce stress, and support your body's natural
          healing processes.
        </p>
      </div>

      {/* How It Helps */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">How It Helps</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Stress Reduction:</strong> Activates the parasympathetic
              nervous system, promoting calm.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Pain Relief:</strong> Can help alleviate headaches,
              muscle tension, and chronic pain.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Sleep Support:</strong> Promotes relaxation and can
              improve sleep quality.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Emotional Balance:</strong> Helps regulate emotions and
              reduce anxiety.
            </span>
          </li>
        </ul>
      </div>

      {/* What to Expect */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">What to Expect</h3>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          When practicing acuwellness:
        </p>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              Apply gentle, steady pressure (not painful) for 30-60 seconds per
              point.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              You may feel a slight ache, tingling, or warmth—this is normal.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              Breathe deeply while applying pressure to enhance the effect.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              Start with 2-3 points and gradually explore more as you become
              comfortable.
            </span>
          </li>
        </ul>
      </div>

      {/* Common Points */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">Common Pressure Points</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-foreground mb-1">
              Third Eye Point (Yin Tang)
            </p>
            <p className="text-muted-foreground">
              Between your eyebrows. Helps with stress, headaches, and sleep.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">
              Union Valley (LI4)
            </p>
            <p className="text-muted-foreground">
              In the webbing between thumb and index finger. Helps with pain and
              stress.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">
              Inner Gate (PC6)
            </p>
            <p className="text-muted-foreground">
              Three finger-widths above the wrist on the inner arm. Helps with
              nausea and anxiety.
            </p>
          </div>
        </div>
      </div>

      {/* Completion */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            setHasRead(true);
            handleComplete();
          }}
          className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
        >
          I've Read This
        </button>
      </div>
    </div>
  );
};

export default AcuwellnessTool;

