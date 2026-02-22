// src/components/navigation/PageHeader.jsx
// Minimal page header component for OS 2.0
// Phase 2D: useSmartBack for consistent back behavior

import React from "react";
import { useSmartBack } from "@/lib/useSmartBack";

const PageHeader = ({ title, subtitle, showBack = false, backTo }) => {
  const onBack = useSmartBack(backTo || "/home");

  return (
    <header className="mb-6 space-y-2">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white/60 hover:text-white mb-2"
        >
          ← Back
        </button>
      )}
      {title && (
        <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-sm text-white/60">{subtitle}</p>
      )}
    </header>
  );
};

export default PageHeader;

