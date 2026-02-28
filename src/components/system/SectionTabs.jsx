// src/components/system/SectionTabs.jsx
// Phase 53C: Reusable tabs — proper active state, pill styling

import React from "react";

export default function SectionTabs({ tabs, activeId, onChange, className = "" }) {
  return (
    <div className={`flex flex-wrap rounded-full bg-white/5 p-1 text-xs font-medium backdrop-blur-sm gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = (typeof tab === "object" ? tab.id : tab) === activeId;
        const id = typeof tab === "object" ? tab.id : tab;
        const label = typeof tab === "object" ? tab.label : tab;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-full px-4 py-2 transition whitespace-nowrap ${
              isActive ? "bg-amber-400/20 text-amber-200 border border-amber-400/30" : "bg-transparent text-slate-300 hover:text-white/80 border border-transparent"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
