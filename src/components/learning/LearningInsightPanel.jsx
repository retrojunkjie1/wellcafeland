// src/components/learning/LearningInsightPanel.jsx
// Phase 45: Dynamic Insight Card Component with natural voice playback

import React, { useEffect } from "react";
import { ChevronRight, Play, Pause, Volume2, Square } from "lucide-react";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";

/**
 * LearningInsightPanel - Displays the insight card when a tile is selected
 * @param {object} props
 * @param {object|null} props.insight - Current insight object
 * @param {Function} props.onRefresh - Callback to show a nested detail
 * @param {Function} props.onClose - Callback to close the panel
 */
export function LearningInsightPanel({
  insight,
  onRefresh,
  parentAngleTitle,
  detailPosition,
  detailCount,
  remainingAngles = 0,
}) {
  const { status, error, play, pause, resume, stop } = useNaturalVoice("marin");
  const insightKey = insight ? `${insight.topicTitle}|${insight.tileLabel}|${insight.versionId}|${insight.title}` : "";

  useEffect(() => {
    stop();
  }, [insightKey, stop]);

  if (!insight) return null;

  const toggleAudio = () => {
    if (status === "playing") {
      void pause();
      return;
    }
    if (status === "paused") {
      void resume();
      return;
    }

    const fullText = `${insight.title}. ${insight.body}${insight.reflectionPrompt ? ` Reflection: ${insight.reflectionPrompt}` : ""}`;
    void play(fullText);
  };

  const statusText = error || (status === "preparing"
    ? "Preparing the natural voice…"
    : status === "playing"
      ? "Reading aloud. You can pause or stop at any time."
      : status === "paused"
        ? "Reading paused."
        : "Natural voice is ready when you choose Listen.");

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] md:px-6 md:py-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {insight.topicTitle} • {insight.tileLabel}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleAudio}
            disabled={status === "preparing"}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-600/60 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-amber-400/60 hover:bg-slate-800/80 hover:text-amber-100 disabled:opacity-60"
            aria-label={status === "playing" ? "Pause audio" : status === "paused" ? "Resume audio" : "Listen to this insight"}
          >
            {status === "playing" ? <Pause className="h-4 w-4" /> : status === "paused" ? <Play className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {status === "preparing" ? "Preparing…" : status === "playing" ? "Pause" : status === "paused" ? "Resume" : status === "finished" ? "Listen again" : "Listen"}
          </button>
          {(status === "playing" || status === "paused" || status === "preparing") && (
            <button
              type="button"
              onClick={stop}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-600/60 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800/80"
            >
              <Square className="h-3.5 w-3.5" /> Stop
            </button>
          )}
        </div>
      </div>

      <p role={error ? "alert" : "status"} aria-live="polite" className={`mb-4 min-h-5 text-xs ${error ? "text-rose-300" : "text-slate-400"}`}>
        {statusText}
      </p>

      <h3 className="mb-4 text-lg font-semibold text-amber-100 md:text-xl">
        {insight.title}
      </h3>

      {parentAngleTitle ? (
        <p className="mb-4 rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-base leading-relaxed text-slate-200">
          <span className="font-semibold text-amber-200">Within: {parentAngleTitle}</span>
          <span className="ml-2 text-slate-400">Detail {detailPosition} of {detailCount}</span>
        </p>
      ) : remainingAngles > 0 ? (
        <p className="mb-4 rounded-xl border border-slate-700/70 bg-slate-900/70 px-4 py-3 text-base leading-relaxed text-slate-300">
          {remainingAngles} deeper {remainingAngles === 1 ? "perspective" : "perspectives"} sit under this insight.
        </p>
      ) : null}

      <div className="prose prose-invert max-w-none">
        <p className="mb-6 whitespace-pre-line text-lg leading-[1.75] text-slate-100/95">
          {insight.body}
        </p>
      </div>

      {insight.reflectionPrompt && (
        <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-900/80 px-4 py-3">
          <div className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">
            Reflection
          </div>
          <p className="text-base leading-relaxed text-slate-100/95">{insight.reflectionPrompt}</p>
        </div>
      )}

      {onRefresh ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => { stop(); onRefresh(); }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-amber-400/60 px-5 py-3 text-base font-medium text-amber-100 transition hover:bg-amber-500/10"
          >
            <ChevronRight className="h-4 w-4" />
            Show me another angle
            <span className="sr-only">within {parentAngleTitle || insight.title}</span>
          </button>
        </div>
      ) : remainingAngles === 0 && detailPosition ? (
        <p className="mt-6 rounded-xl border border-slate-700/70 px-4 py-3 text-base leading-relaxed text-slate-300">
          You’ve reached the end of the additional details under “{parentAngleTitle}.”
        </p>
      ) : null}
    </div>
  );
}
