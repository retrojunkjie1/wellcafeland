// src/components/dashboard/HumanModeStrip.jsx
// Phase 33: Human mode pill with context

import React from "react";

export default function HumanModeStrip({ humanMode }) {
  if (!humanMode) {
    return (
      <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Conversation mode</p>
        <p className="text-sm text-white/60">Standard mode</p>
      </div>
    );
  }

  const mode = typeof humanMode === "string" ? humanMode : humanMode.mode || humanMode;
  
  // Mode styling
  const modeConfig = {
    humor: {
      bg: "bg-purple-500/20",
      border: "border-purple-400/60",
      text: "text-purple-200",
      label: "Humor",
      context: "Light-hearted, playful responses to ease tension.",
    },
    recovery_core: {
      bg: "bg-red-500/20",
      border: "border-red-400/60",
      text: "text-red-200",
      label: "Recovery Core",
      context: "Focused on recovery principles and support.",
    },
    risk_sensitive: {
      bg: "bg-amber-500/20",
      border: "border-amber-400/60",
      text: "text-amber-200",
      label: "Risk Sensitive",
      context: "Extra care and attention to safety signals.",
    },
    casual: {
      bg: "bg-teal-500/20",
      border: "border-teal-400/60",
      text: "text-teal-200",
      label: "Casual",
      context: "Relaxed, conversational tone.",
    },
    entertainment: {
      bg: "bg-sky-500/20",
      border: "border-sky-400/60",
      text: "text-sky-200",
      label: "Entertainment",
      context: "Engaging and enjoyable interactions.",
    },
  }[mode] || {
    bg: "bg-white/5",
    border: "border-white/20",
    text: "text-white/70",
    label: mode.charAt(0).toUpperCase() + mode.slice(1).replace(/_/g, " "),
    context: "Standard conversation mode.",
  };

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Conversation mode</p>
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${modeConfig.bg} border ${modeConfig.border} ${modeConfig.text} mb-2`}>
        <span className="text-xs font-semibold">{modeConfig.label}</span>
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed">
        {modeConfig.context}
      </p>
    </div>
  );
}
