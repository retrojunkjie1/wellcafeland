// src/components/dashboard/RiskStrip.jsx
// Phase 33: Horizontal segmented risk bar with color gradients

import React from "react";

export default function RiskStrip({ risk }) {
  if (!risk) {
    return (
      <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Risk Level</p>
        <p className="text-sm text-white/60">No risk assessment available</p>
      </div>
    );
  }

  const riskLevel = risk.level || risk.riskLevel || "low";
  const reasons = risk.reasons || risk.indicators || [];

  // Color gradients based on risk level
  const gradientClasses = {
    low: "from-emerald-400/60 to-emerald-300/40",
    moderate: "from-amber-400/60 to-amber-300/40",
    high: "from-red-500/70 to-red-400/60",
  }[riskLevel] || "from-emerald-400/60 to-emerald-300/40";

  const textColor = {
    low: "text-emerald-300",
    moderate: "text-amber-300",
    high: "text-red-300",
  }[riskLevel] || "text-emerald-300";

  const label = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);

  // Calculate bar width (0-100%)
  const barWidth = {
    low: 25,
    moderate: 60,
    high: 90,
  }[riskLevel] || 25;

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-4 sm:p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/50 uppercase tracking-wider">Risk Level</p>
          <p className={`text-sm font-semibold ${textColor} capitalize`}>
            {label}
          </p>
        </div>

        {/* Horizontal bar */}
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradientClasses} transition-all duration-500`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* Risk reasons pills */}
        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {reasons.slice(0, 4).map((reason, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/70"
              >
                {typeof reason === "string" ? reason : reason.label || reason}
              </span>
            ))}
            {reasons.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/50">
                +{reasons.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
