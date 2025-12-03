// src/components/dashboard/EmotionStrip.jsx
// Phase 33: Circular donut gauge style emotion display

import React from "react";

export default function EmotionStrip({ lastEmotion }) {
  if (!lastEmotion) {
    return (
      <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5 flex items-center gap-4 sm:gap-6">
        <div className="flex-1">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Last emotional signal</p>
          <p className="text-sm text-white/60">No emotion detected yet</p>
        </div>
      </div>
    );
  }

  const label = lastEmotion.label || "neutral";
  const intensity = typeof lastEmotion.intensity === "number" ? Math.max(0, Math.min(1, lastEmotion.intensity)) : 0;
  const valence = lastEmotion.valence || "neutral";

  // Color based on valence
  const strokeColor = {
    positive: "#10b981", // emerald-500
    negative: "#f59e0b", // amber-500
    neutral: "#6b7280", // gray-500
  }[valence] || "#6b7280";

  const textColor = {
    positive: "text-emerald-300",
    negative: "text-amber-300",
    neutral: "text-white/70",
  }[valence] || "text-white/70";

  const valenceLabel = {
    positive: "supportive",
    negative: "distressed",
    neutral: "neutral",
  }[valence] || "neutral";

  // SVG circle parameters
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (intensity * circumference);

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5 flex items-center gap-4 sm:gap-6">
      {/* Left: Circular gauge */}
      <div className="flex-shrink-0 relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle (intensity) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className={`text-xs font-semibold ${textColor} capitalize`} style={{ lineHeight: 1.2 }}>
              {label}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Last emotional signal</p>
        <p className={`text-base font-semibold ${textColor} capitalize mb-1`}>
          {label}
        </p>
        <p className="text-xs text-white/60 mb-2">
          {Math.round(intensity * 100)}% intensity
        </p>
        <p className="text-[10px] text-white/50 capitalize">
          {valenceLabel}
        </p>
      </div>
    </div>
  );
}
