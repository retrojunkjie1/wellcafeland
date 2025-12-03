// src/components/tools/GroundingSessionView.jsx
// 5–4–3–2–1 sensory grounding tiles
// Phase 37: Tool Sessions Activation Layer

import React from "react";

const steps = [
  { label: "5 things you can see", key: "see" },
  { label: "4 things you can touch", key: "touch" },
  { label: "3 things you can hear", key: "hear" },
  { label: "2 things you can smell", key: "smell" },
  { label: "1 thing you can taste", key: "taste" },
];

export const GroundingSessionView = ({ activeIndex = 0 }) => {
  return (
    <div className="grid w-full max-w-md gap-3">
      {steps.map((s, idx) => {
        const isActive = idx === activeIndex;
        return (
          <div
            key={s.key}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-xs sm:text-sm transition ${
              isActive
                ? "bg-emerald-500/15 border border-emerald-400/50 text-emerald-50"
                : "bg-slate-900/60 border border-slate-700 text-slate-200"
            }`}
          >
            <span className="font-light">{s.label}</span>
            <span
              className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full text-[0.7rem] ${
                isActive ? "bg-emerald-400/80 text-slate-900" : "bg-slate-800 text-slate-300"
              }`}
            >
              {5 - idx}
            </span>
          </div>
        );
      })}
    </div>
  );
};

