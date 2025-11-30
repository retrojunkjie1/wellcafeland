// src/components/dashboard/RiskStrip.jsx
// Display risk level with reasons

import React from "react";

export default function RiskStrip({ risk }) {
  if (!risk || !risk.riskLevel) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Risk Level</p>
            <p className="text-sm text-white/60">No risk signals detected</p>
          </div>
        </div>
      </div>
    );
  }

  const riskLevel = risk.riskLevel || "low";
  const reasons = Array.isArray(risk.reasons) ? risk.reasons : [];

  // Color gradients based on risk level
  const riskConfig = {
    high: {
      gradient: "from-red-500/20 to-red-600/10",
      border: "border-red-500/30",
      text: "text-red-400",
      badge: "bg-red-500/20 text-red-300 border-red-500/30",
    },
    moderate: {
      gradient: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    low: {
      gradient: "from-teal-500/20 to-teal-600/10",
      border: "border-teal-500/30",
      text: "text-teal-400",
      badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    },
  };

  const config = riskConfig[riskLevel] || riskConfig.low;

  return (
    <div className={`rounded-xl border ${config.border} bg-gradient-to-br ${config.gradient} p-4 backdrop-blur-sm`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Risk Level</p>
            <p className={`text-lg font-semibold ${config.text} capitalize`}>
              {riskLevel}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
            {riskLevel.toUpperCase()}
          </span>
        </div>
        {reasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">Reasons</p>
            <div className="flex flex-wrap gap-2">
              {reasons.slice(0, 3).map((reason, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/70 border border-white/10"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

