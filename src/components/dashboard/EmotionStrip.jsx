// src/components/dashboard/EmotionStrip.jsx
// Display last message emotion with intensity bar

import React from "react";

export default function EmotionStrip({ lastEmotion }) {
  if (!lastEmotion) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Emotion</p>
            <p className="text-sm text-white/60">No emotion detected yet</p>
          </div>
        </div>
      </div>
    );
  }

  const label = lastEmotion.label || "neutral";
  const intensity = typeof lastEmotion.intensity === "number" ? lastEmotion.intensity : 0;
  const valence = lastEmotion.valence || "neutral";

  // Color based on valence
  const valenceColor = {
    positive: "text-emerald-400",
    negative: "text-amber-400",
    neutral: "text-white/60",
  }[valence] || "text-white/60";

  const barColor = {
    positive: "bg-emerald-400/30",
    negative: "bg-amber-400/30",
    neutral: "bg-white/10",
  }[valence] || "bg-white/10";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Emotion</p>
            <p className={`text-lg font-semibold ${valenceColor} capitalize`}>
              {label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Valence</p>
            <p className={`text-sm font-medium ${valenceColor} capitalize`}>
              {valence}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>Intensity</span>
            <span>{Math.round(intensity * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-300`}
              style={{ width: `${intensity * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

