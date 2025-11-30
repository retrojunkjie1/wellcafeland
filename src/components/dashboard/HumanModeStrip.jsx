// src/components/dashboard/HumanModeStrip.jsx
// Display current conversational mode

import React from "react";

const MODE_CONFIG = {
  humor: {
    label: "Humor",
    message: "You're in a relaxed conversational flow.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  casual: {
    label: "Casual",
    message: "You're in a relaxed conversational flow.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  emotional_heavy: {
    label: "Emotional",
    message: "You're sharing something important—I'm here with you.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  recovery_core: {
    label: "Recovery",
    message: "You're sharing something important—I'm here with you.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
  curiosity: {
    label: "Curiosity",
    message: "You're exploring and asking questions.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  risk_sensitive: {
    label: "Risk Sensitive",
    message: "You're sharing something important—I'm here with you.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  neutral: {
    label: "Neutral",
    message: "You're in a balanced conversational state.",
    color: "text-white/60",
    bg: "bg-white/5",
    border: "border-white/10",
  },
};

export default function HumanModeStrip({ humanMode }) {
  const mode = humanMode || "neutral";
  const config = MODE_CONFIG[mode] || MODE_CONFIG.neutral;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color} border ${config.border} bg-white/5`}>
          {config.label}
        </div>
        <div className="flex-1">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Conversational Mode</p>
          <p className="text-sm text-white/70">{config.message}</p>
        </div>
      </div>
    </div>
  );
}

