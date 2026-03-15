// src/components/system/PageHeader.jsx
// Phase 53C: Reusable header — title, subtitle, leftSlot, rightSlot
// Stable flex layout, no overlap, responsive right-rail

import React from "react";

function HeaderRight({ children }) {
  if (!children) return null;
  return (
    <div className="wc-header-right flex items-center gap-3 flex-wrap shrink min-w-0">
      {children}
    </div>
  );
}

export default function PageHeader({ title, subtitle, leftSlot, rightSlot }) {
  return (
    <header className="wc-page-header sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-3">
      <div className="flex items-center gap-4 min-h-0 w-full">
        {/* Left cluster — truncates, never pushes right off */}
        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
          {leftSlot}
          <div className="min-w-0 flex-1">
            {title && <h1 className="text-xl sm:text-2xl font-medium text-white/90 truncate">{title}</h1>}
            {subtitle && <p className="text-slate-300/80 truncate mt-0.5 text-sm">{subtitle}</p>}
          </div>
        </div>
        {rightSlot && <HeaderRight>{rightSlot}</HeaderRight>}
      </div>
    </header>
  );
}
