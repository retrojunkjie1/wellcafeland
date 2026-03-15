// src/components/tools/ToolSessionLayout.jsx
// Shared cinematic session container
// Phase 37: Tool Sessions Activation Layer
// C1: Immersive session layout - no header overlay, floating back handled by BreathingSessionView

import React from "react";
import { X, Volume2, VolumeX, Moon, Sun, Pause, Play } from "lucide-react";

// C1: Use same constant as OSLayout for consistency
const BOTTOM_NAV_HEIGHT = 88;

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
    <div className="fixed inset-x-0 bottom-0 z-30 animate-[slide-up_0.45s_ease-out]" style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }}>
      <div
        className={`mx-auto mb-6 max-w-2xl rounded-3xl border-2 backdrop-blur-xl shadow-2xl p-6 sm:p-8 ${bgPanel}`}
      >
        {/* Main content area - full width for breathing sessions */}
        <div className="mb-5">
          <div className="flex items-center justify-center overflow-visible min-h-[60vh]">{children}</div>
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
              <Pause size={18} />
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

