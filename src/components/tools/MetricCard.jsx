// src/components/tools/MetricCard.jsx
// Session metrics display card
// Phase 36B: OS Integration

import React from "react";

const MetricCard = ({ label, value, unit, icon: Icon, theme = "calm" }) => {
  const themeColors = {
    calm: "text-amber-400",
    focus: "text-indigo-400",
    release: "text-red-400",
    peace: "text-cyan-400",
  };

  const color = themeColors[theme] || themeColors.calm;

  return (
    <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-4 border border-white/[0.08]">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className={`h-4 w-4 ${color}`} />}
        <p className="text-white/60 text-xs uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-light ${color}`}>
          {value}
        </span>
        {unit && (
          <span className="text-white/40 text-sm">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

