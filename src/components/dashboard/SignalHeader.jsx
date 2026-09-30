// src/components/dashboard/SignalHeader.jsx
// Phase 33: Luxury header for intelligence signals dashboard

import React from "react";

export default function SignalHeader() {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4 backdrop-blur-md shadow-wc-soft">
      <h1 className="text-lg md:text-xl font-semibold text-white tracking-tight">My progress</h1>
      <p className="mt-1 text-xs leading-relaxed text-white/55">Your saved check-ins are private. Sharing with a practitioner is always your choice.</p>
    </div>
  );
}
