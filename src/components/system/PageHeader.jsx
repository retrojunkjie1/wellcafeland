// src/components/system/PageHeader.jsx
// Phase 53C: Reusable header — title, subtitle, leftSlot, rightSlot, divider

import React from "react";

export default function PageHeader({ title, subtitle, leftSlot, rightSlot }) {
  return (
    <header className="border-b border-white/10 bg-black/20 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {leftSlot}
          <div className="min-w-0">
            {title && <h1 className="text-3xl sm:text-4xl font-medium text-white/90 truncate">{title}</h1>}
            {subtitle && <p className="text-slate-300/80 truncate mt-1">{subtitle}</p>}
          </div>
        </div>
        {rightSlot && <div className="shrink-0 flex items-center gap-2">{rightSlot}</div>}
      </div>
    </header>
  );
}
