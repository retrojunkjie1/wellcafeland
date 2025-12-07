// src/components/learning/LearningInsightPanel.jsx
// Phase 45: Dynamic Insight Card Component with Audio

import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Play, Pause, Volume2 } from "lucide-react";

/**
 * LearningInsightPanel - Displays the insight card when a tile is selected
 * @param {object} props
 * @param {object|null} props.insight - Current insight object
 * @param {Function} props.onRefresh - Callback to show another version
 * @param {Function} props.onClose - Callback to close the panel
 */
export function LearningInsightPanel({ insight, onRefresh, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastVersionId, setLastVersionId] = useState(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Stop audio when insight changes
  useEffect(() => {
    if (insight?.versionId !== lastVersionId) {
      stopAudio();
      setLastVersionId(insight?.versionId || null);
    }
    return () => {
      stopAudio();
    };
  }, [insight?.versionId, lastVersionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    utteranceRef.current = null;
  };

  const playAudio = () => {
    if (!insight || !synthRef.current) return;

    // Stop any current audio
    stopAudio();

    // Get full text to read
    const fullText = `${insight.title}. ${insight.body}${insight.reflectionPrompt ? ` Reflection: ${insight.reflectionPrompt}` : ""}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  if (!insight) return null;

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 px-5 py-6 md:px-6 md:py-7 shadow-[0_24px_80px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
          {insight.topicTitle} • {insight.tileLabel}
        </div>
        <div className="flex items-center gap-2">
          {/* Audio Control */}
          {synthRef.current && (
            <button
              type="button"
              onClick={toggleAudio}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/60 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-slate-800/80 hover:border-amber-400/60 hover:text-amber-200 transition-all"
              title={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  Listen
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-semibold text-amber-100 mb-4">
        {insight.title}
      </h3>

      <div className="prose prose-invert max-w-none">
        <p className="text-sm md:text-[15px] leading-relaxed text-slate-200/90 whitespace-pre-line mb-6">
          {insight.body}
        </p>
      </div>

      {insight.reflectionPrompt && (
        <div className="mt-6 rounded-2xl bg-slate-900/80 border border-slate-700/70 px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300/80 mb-1.5">
            Reflection
          </div>
          <p className="text-sm text-slate-100/95">{insight.reflectionPrompt}</p>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-400/60 px-4 py-2.5 text-sm font-medium text-amber-100 hover:bg-amber-500/10 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Show me another angle
        </button>
      </div>
    </div>
  );
}

