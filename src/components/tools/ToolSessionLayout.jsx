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
        className={`mx-auto mb-6 max-w-2xl rounded-3xl border-2 backdrop-blur-xl shadow-2xl p-6 sm:p-8 overflow-hidden ${bgPanel}`}
      >
        {/* Main content area - overflow-hidden to prevent scrollbars */}
        <div className="mb-5 overflow-hidden">
          <div className="flex items-center justify-center overflow-hidden min-h-[60vh]">{children}</div>
        </div>

        {/* Session CTA — End Session neutral by default, red on hover */}
        <button
          type="button"
          onClick={isActive ? onEnd : onStart}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm sm:text-base font-medium transition hover:scale-[1.02] ${
            isActive
              ? darkMode
                ? "bg-white/5 border border-white/20 text-white/90 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300"
                : "bg-white/5 border border-slate-300/30 text-slate-700 hover:bg-red-100 hover:text-red-700"
              : darkMode
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40"
              : "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/40"
          }`}
        >
          {isActive ? (
            <>
              <Pause size={18} />
              <span>End Session</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>
                Begin Session
                {tool.durationMinutes ? ` (${tool.durationMinutes} min)` : ""}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

