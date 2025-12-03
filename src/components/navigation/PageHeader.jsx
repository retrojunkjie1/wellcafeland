// src/components/navigation/PageHeader.jsx
// Minimal page header component for OS 2.0

import React from "react";
import { useNavigate } from "react-router-dom";

const PageHeader = ({ title, subtitle, showBack = false, backTo }) => {
  const navigate = useNavigate();

  return (
    <header className="mb-6 space-y-2">
      {showBack && backTo && (
        <button
          type="button"
          onClick={() => navigate(backTo)}
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

