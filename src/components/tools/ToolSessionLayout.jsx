// Shared session shell: consistent exit, readable context, and clear session state.
import React from "react";
import { ArrowLeft, Play, Square } from "lucide-react";

export const ToolSessionLayout = ({
  tool,
  darkMode = true,
  isActive,
  onStart,
  onEnd,
  onClose,
  children,
}) => {
  const bgPanel = darkMode
    ? "bg-slate-900/90 border-amber-500/30"
    : "bg-white/90 border-teal-500/30";
  const textMain = darkMode ? "text-amber-50" : "text-slate-900";
  const textSub = darkMode ? "text-slate-300" : "text-slate-600";

  return (
    <div className="wc-tool-detail relative z-30 mx-auto w-full max-w-2xl px-3 pb-28 pt-2 sm:px-4">
      <div className={`wc-tool-session-panel mb-6 rounded-3xl border backdrop-blur-xl shadow-2xl p-5 sm:p-8 ${bgPanel}`}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
              darkMode
                ? "border-white/15 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                : "border-slate-300 bg-white/70 text-slate-700 hover:bg-white"
            }`}
            aria-label="Return to practice library"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            <span>All practices</span>
          </button>
          <p className={`text-right text-xs font-medium ${textSub}`} role="status" aria-live="polite">
            {isActive ? "Practice in progress" : "Ready when you are"}
          </p>
        </div>

        {tool?.name && (
          <header className="mb-6 text-center">
            <h1 className={`text-2xl font-semibold tracking-tight sm:text-3xl ${textMain}`}>
              {tool.name}
            </h1>
            {tool.description && (
              <p className={`mx-auto mt-2 max-w-lg text-sm leading-relaxed sm:text-base ${textSub}`}>
                {tool.description}
              </p>
            )}
          </header>
        )}

        <div className="mb-5">
          <div className="flex min-h-0 items-center justify-center overflow-visible">{children}</div>
        </div>

        <button
          type="button"
          onClick={isActive ? onEnd : onStart}
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
            isActive
              ? darkMode
                ? "bg-red-500/15 text-red-200 hover:bg-red-500/25"
                : "bg-red-100 text-red-700 hover:bg-red-200"
              : darkMode
              ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-105"
              : "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg shadow-teal-500/25 hover:brightness-105"
          }`}
        >
          {isActive ? (
            <>
              <Square size={16} aria-hidden="true" />
              <span>End practice</span>
            </>
          ) : (
            <>
              <Play size={18} aria-hidden="true" />
              <span>{tool?.sessionType === "breathing" ? "Begin breathing" : "Begin practice"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
