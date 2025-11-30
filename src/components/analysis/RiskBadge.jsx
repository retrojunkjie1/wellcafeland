// src/components/analysis/RiskBadge.jsx
// Phase 27 — Emotional HUD Integration
// Micro-component for displaying risk level

import React from "react";

/**
 * RiskBadge - Displays risk level as a badge
 * @param {Object} props
 * @param {Object} [props.risk]
 * @param {string} [props.risk.riskLevel]
 */
export default function RiskBadge({ risk }) {
  if (!risk || typeof risk !== "object" || !risk.riskLevel) {
    return null;
  }

  const level = risk.riskLevel || "low";

  const styles = {
    high: "bg-red-500/20 text-red-300 border-red-400/50",
    moderate: "bg-amber-500/20 text-amber-300 border-amber-400/50",
    low: "bg-green-500/20 text-green-300 border-green-400/50",
  };

  const style = styles[level] || styles.low;
  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium ${style}`}
      title={`Risk level: ${level}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

