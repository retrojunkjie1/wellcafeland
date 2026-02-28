// src/os/PageHeader.jsx
// Phase 52: Minimal page header with back + title + optional actions

import React from "react";
import { useSmartBack } from "@/lib/useSmartBack";

const PageHeader = ({ title, subtitle, actions }) => {
  const { goBack, canGoBack } = useSmartBack();

  return (
    <header className="border-b border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-white/60 hover:bg-white/8 hover:text-white/80 transition"
            >
              ← Back
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-white/90 truncate">{title}</h1>
            {subtitle && <p className="text-[11px] text-white/50 truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
