// src/components/tools/ToolSessionLayout.jsx
// Shared cinematic session container
// Phase 37: Tool Sessions Activation Layer
// C1: Immersive session layout - no header overlay, floating back handled by BreathingSessionView

import React from "react";
import { Play, Square } from "lucide-react";

export const ToolSessionLayout = ({
  tool,
  darkMode = true,
  isActive,
  onStart,
  onEnd,
  onClose,
  children,
  metrics,
  soundEnabled,
  onToggleSound,
  onToggleTheme,
}) => {
  const bgPanel = darkMode
    ? "bg-slate-900/90 border-amber-500/30"
    : "bg-white/90 border-teal-500/30";
  const textMain = darkMode ? "text-amber-100" : "text-slate-800";
  const textSub = darkMode ? "text-slate-400" : "text-slate-600";

  return (
    <div className="relative z-30 mx-auto w-full max-w-2xl px-3 pb-28 pt-2 sm:px-4">
      <div
        className={`mb-6 rounded-3xl border-2 backdrop-blur-xl shadow-2xl p-4 sm:p-8 ${bgPanel}`}
      >
        {tool?.name && (
          <header className="mb-3 text-center">
            <h1 className={`text-lg font-medium ${textMain}`}>{tool.name}</h1>
            {tool.description && <p className={`mx-auto mt-1 max-w-md text-xs leading-relaxed ${textSub}`}>{tool.description}</p>}
          </header>
        )}

        {/* Main content area - full width for breathing sessions */}
        <div className="mb-4">
          <div className="flex min-h-0 items-center justify-center overflow-visible">{children}</div>
        </div>

        {/* Session CTA */}
        <button
          type="button"
          onClick={isActive ? onEnd : onStart}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm sm:text-base font-medium transition hover:scale-[1.02] ${
            isActive
              ? darkMode
                ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : "bg-red-100 text-red-700 hover:bg-red-200"
              : darkMode
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40"
              : "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/40"
          }`}
        >
          {isActive ? (
            <>
              <Square size={16} aria-hidden="true" />
              <span>{tool?.sessionType === "breathing" ? "Stop" : "End Session"}</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>
                {tool?.sessionType === "breathing" ? "Start Breathing" : "Begin Session"}
                {tool?.sessionType !== "breathing" && tool?.durationMinutes ? ` (${tool.durationMinutes} min)` : ""}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
