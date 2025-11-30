// src/components/analysis/EmotionalChip.jsx
// Phase 27 — Emotional HUD Integration
// Micro-component for displaying emotion label

import React from "react";

/**
 * EmotionalChip - Displays emotion label as a small chip
 * @param {Object} props
 * @param {Object} [props.emotion]
 * @param {string} [props.emotion.label]
 * @param {number} [props.emotion.intensity]
 */
export default function EmotionalChip({ emotion }) {
  if (!emotion || typeof emotion !== "object" || !emotion.label) {
    return null;
  }

  const label = emotion.label || "neutral";
  const intensity = typeof emotion.intensity === "number" ? emotion.intensity : 0;

  // Color based on intensity
  const intensityColor =
    intensity >= 0.7
      ? "bg-red-500/20 text-red-300 border-red-400/40"
      : intensity >= 0.4
        ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
        : "bg-blue-500/20 text-blue-300 border-blue-400/40";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium ${intensityColor}`}
      title={`Emotion: ${label} (intensity: ${(intensity * 100).toFixed(0)}%)`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}

