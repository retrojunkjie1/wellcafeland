// src/apps/tools/modules/AcuwellnessTool.jsx

import React, { useState } from "react";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";
import { createToolResult, safeComplete } from "@/utils/toolContract";

const AcuwellnessTool = ({ tool, onComplete }) => {
  const [startTime] = useState(() => new Date().getTime());
  const [hasRead, setHasRead] = useState(false);

  const handleComplete = () => {
    const now = new Date().getTime();
    const durationMs = now - startTime;
    logToolUsage(tool.id, {
      startedAt: startTime,
      completedAt: now,
      durationMs,
    }).catch((error) => console.warn("Acupressure telemetry failed:", error));

    trackAction("tool_acuwellness_complete", { toolId: tool.id });
    safeComplete(onComplete, createToolResult(
      tool.id,
      tool.name || "Acupressure-inspired self-care",
      "Reviewed optional self-care information.",
      {},
      Math.floor(durationMs / 1000)
    ));
  };

  return (
    <div className="space-y-6">
      {/* What is Acuwellness */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">What is Acuwellness?</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Acupressure is a traditional self-care practice. Research on specific
          benefits varies, and this information is not medical care or a
          substitute for advice from a qualified clinician.
        </p>
      </div>

      {/* How It Helps */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">What to keep in mind</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Personal comfort:</strong> Some people find gentle touch
              soothing; experiences differ.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Choice:</strong> You can skip any suggestion or stop at
              any time.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Pressure:</strong> Keep any touch light and comfortable.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              <strong>Stop if uncomfortable:</strong> Do not press on injured,
              painful, swollen, numb, or irritated areas.
            </span>
          </li>
        </ul>
      </div>

      {/* What to Expect */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">What to Expect</h3>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          If you choose to try gentle touch:
        </p>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              Use light pressure only, and stop if you notice pain or
              discomfort.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              There is no sensation you need to feel for this to count.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              Let your breath stay natural; there is no need to change it.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>
              You can skip this practice entirely if touch does not feel right.
            </span>
          </li>
        </ul>
      </div>

      {/* Optional examples */}
      <div className="lux-card p-6 space-y-4">
        <h3 className="text-sm font-semibold mb-2">Optional areas to explore</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-foreground mb-1">Hands</p>
            <p className="text-muted-foreground">If comfortable, rest or gently rub your hands. No pressure point is required.</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Forearms or shoulders</p>
            <p className="text-muted-foreground">Only touch areas that feel comfortable to you; no outcome is promised.</p>
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
          {hasRead ? "Reviewed" : "Finish reading"}
        </button>
      </div>
    </div>
  );
};

export default AcuwellnessTool;
