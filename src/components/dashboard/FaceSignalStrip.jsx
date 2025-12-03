// src/components/dashboard/FaceSignalStrip.jsx
// Phase 33: Face emotion signal display

import React from "react";

export default function FaceSignalStrip({ faceEmotion }) {
  if (!faceEmotion) {
    return (
      <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Face Expression</p>
        <p className="text-sm text-white/60">Expression detection inactive</p>
      </div>
    );
  }

  const label = faceEmotion.label || "neutral";
  const intensity = typeof faceEmotion.intensity === "number" ? Math.max(0, Math.min(1, faceEmotion.intensity)) : 0;

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50 uppercase tracking-wider">Face Expression</p>
          <p className="text-sm font-semibold text-white/80 capitalize">
            {label}
          </p>
        </div>

        {/* Horizontal micro-meter */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400/60 to-amber-300/40 rounded-full transition-all duration-500"
              style={{ width: `${intensity * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span>0%</span>
            <span>{Math.round(intensity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
