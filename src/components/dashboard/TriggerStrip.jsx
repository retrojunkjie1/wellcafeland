// src/components/dashboard/TriggerStrip.jsx
// Phase 33: Trigger chips display

import React, { useMemo } from "react";

export default function TriggerStrip({ messages = [] }) {
  // Extract all unique triggers from messages
  const triggers = useMemo(() => {
    const triggerSet = new Set();
    messages.forEach((msg) => {
      if (msg.triggers && Array.isArray(msg.triggers)) {
        msg.triggers.forEach((trigger) => {
          if (typeof trigger === "string") {
            triggerSet.add(trigger);
          } else if (trigger?.label) {
            triggerSet.add(trigger.label);
          }
        });
      }
    });
    return Array.from(triggerSet).slice(0, 8); // Limit to 8 most recent
  }, [messages]);

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Triggers</p>
      {triggers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {triggers.map((trigger, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80"
            >
              {trigger}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/60">No triggers detected yet.</p>
      )}
    </div>
  );
}
