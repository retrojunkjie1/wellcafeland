// src/components/analysis/TriggerChip.jsx
// Phase 27 — Emotional HUD Integration
// Micro-component for displaying trigger domains

import React from "react";

/**
 * TriggerChip - Displays a single trigger domain as a small chip
 * @param {Object} props
 * @param {string} props.trigger
 */
export function TriggerChip({ trigger }) {
  if (!trigger || typeof trigger !== "string") {
    return null;
  }

  return (
    <span
      className="inline-flex items-center rounded-full border border-purple-400/30 bg-purple-500/10 px-2 py-0.5 text-[10px] sm:text-xs text-purple-200"
      title={`Trigger: ${trigger}`}
    >
      {trigger.replace(/_/g, " ")}
    </span>
  );
}

/**
 * TriggerChips - Displays multiple trigger domains
 * @param {Object} props
 * @param {string[]} [props.triggers]
 */
export default function TriggerChips({ triggers }) {
  if (!Array.isArray(triggers) || triggers.length === 0) {
    return null;
  }

  // Show max 3 triggers, then "+N more"
  const displayTriggers = triggers.slice(0, 3);
  const remaining = triggers.length - displayTriggers.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayTriggers.map((trigger, idx) => (
        <TriggerChip key={`${trigger}-${idx}`} trigger={trigger} />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] sm:text-xs text-white/40">+{remaining} more</span>
      )}
    </div>
  );
}

