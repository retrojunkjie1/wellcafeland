// src/components/system/PageHeader.jsx
// Phase 53C: Consistent header spacing, typography, divider — OS styling

import React from "react";

export default function PageHeader({ title, subtitle, leftSlot, rightSlot }) {
  return (
    <header className="border-b border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {leftSlot}
          <div className="min-w-0">
            {title && <h1 className="text-sm font-medium text-white/90 truncate">{title}</h1>}
            {subtitle && <p className="text-[11px] text-white/50 truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightSlot && <div className="shrink-0 flex items-center gap-2">{rightSlot}</div>}
      </div>
    </header>
  );
}
