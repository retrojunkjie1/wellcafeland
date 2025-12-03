// src/components/tools/ToolSessionLayout.jsx
// Shared cinematic session container
// Phase 37: Tool Sessions Activation Layer

import React from "react";
import { X, Volume2, VolumeX, Moon, Sun, Pause, Play } from "lucide-react";

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
    <div className="fixed inset-x-0 bottom-0 z-40 animate-[slide-up_0.45s_ease-out]">
      <div
        className={`mx-auto mb-6 max-w-2xl rounded-3xl border-2 backdrop-blur-xl shadow-2xl p-6 sm:p-8 ${bgPanel}`}
      >
        {/* Header row */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className={`flex items-center gap-3 text-2xl font-light ${textMain}`}>
              {tool.icon && <tool.icon className="h-6 w-6 sm:h-7 sm:w-7" />}
              <span>{tool.name}</span>
            </h2>
            {tool.description && (
              <p className={`mt-1 text-xs sm:text-sm ${textSub}`}>
                {tool.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              className={`inline-flex items-center justify-center rounded-full p-2 text-xs transition hover:scale-110 ${
                darkMode ? "bg-slate-800/70 text-amber-200" : "bg-slate-100 text-teal-600"
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className={`inline-flex items-center justify-center rounded-full p-2 text-xs transition hover:scale-110 ${
                darkMode ? "bg-slate-800/70 text-amber-200" : "bg-slate-100 text-teal-600"
              }`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex items-center justify-center rounded-full p-2 text-xs transition hover:bg-slate-800/40 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Instruction / copy */}
        {tool.instruction && (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
              darkMode ? "bg-slate-900/70 text-amber-200/80" : "bg-slate-50 text-slate-700"
            }`}
          >
            {tool.instruction}
          </div>
        )}

        {/* Main content area */}
        <div className="mb-5 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="flex items-center justify-center">{children}</div>

          {/* Metrics column */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
            {metrics?.map((metric) => (
              <div
                key={metric.label}
                className={`rounded-xl px-3 py-2 text-center ${
                  darkMode ? "bg-slate-900/70" : "bg-white/70"
                }`}
              >
                <div
                  className={`mb-1 text-[0.65rem] uppercase tracking-wide ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {metric.label}
                </div>
                <div
                  className={`text-base sm:text-lg font-light ${
                    darkMode ? "text-amber-200" : "text-teal-700"
                  }`}
                >
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
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

