// src/components/analysis/TrajectoryTag.jsx
// Phase 27 — Emotional HUD Integration
// Micro-component for displaying trajectory forecast

import React from "react";

/**
 * TrajectoryTag - Displays trajectory forecast as a tag
 * @param {Object} props
 * @param {Object} [props.trajectory]
 * @param {Object} [props.trajectory.forecast]
 * @param {string} [props.trajectory.forecast.forecast]
 */
export default function TrajectoryTag({ trajectory }) {
  if (!trajectory || typeof trajectory !== "object" || !trajectory.forecast) {
    return null;
  }

  const forecast = trajectory.forecast.forecast || "unknown";
  const confidence = typeof trajectory.forecast.confidence === "number" ? trajectory.forecast.confidence : 0;

  const styles = {
    improving: "bg-green-500/20 text-green-300 border-green-400/40",
    declining: "bg-red-500/20 text-red-300 border-red-400/40",
    volatile: "bg-amber-500/20 text-amber-300 border-amber-400/40",
    unknown: "bg-white/10 text-white/60 border-white/20",
  };

  const style = styles[forecast] || styles.unknown;
  const label = forecast.charAt(0).toUpperCase() + forecast.slice(1);

  if (confidence < 0.3) {
    return null; // Don't show if confidence is too low
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium ${style}`}
      title={`Trajectory: ${forecast} (confidence: ${(confidence * 100).toFixed(0)}%)`}
    >
      {label}
    </span>
  );
}

