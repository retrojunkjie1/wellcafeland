// src/components/dashboard/TriggerStrip.jsx
// Display last 20 trigger domains as chips

import React, { useMemo } from "react";

export default function TriggerStrip({ messages }) {
  const triggers = useMemo(() => {
    if (!Array.isArray(messages)) return [];
    
    const allTriggers = [];
    messages.forEach((msg) => {
      if (msg.triggers && Array.isArray(msg.triggers)) {
        allTriggers.push(...msg.triggers);
      }
    });
    
    // Get unique triggers, keep last 20
    const uniqueTriggers = Array.from(new Set(allTriggers));
    return uniqueTriggers.slice(-20);
  }, [messages]);

  if (triggers.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Trigger Domains</p>
            <p className="text-sm text-white/60">No triggers detected yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/40 uppercase tracking-wider">Trigger Domains</p>
          <span className="text-xs text-white/50">{triggers.length} detected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {triggers.map((trigger, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-full bg-amber-500/10 text-xs text-amber-300 border border-amber-500/20 capitalize"
            >
              {trigger}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

