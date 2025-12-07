// src/components/learning/LearningPathView.jsx
// Phase 45: Main component that integrates learning paths into ToolDetailPage

import React, { useState, useEffect, useRef } from "react";
import { useLearningTopic } from "@/hooks/useLearningPath";
import { LearningInsightPanel } from "./LearningInsightPanel";
import { ChevronDown } from "lucide-react";

/**
 * LearningPathView - Renders the 7-tile learning path for a topic
 * @param {object} props
 * @param {string} props.topicId - The learning topic ID (e.g., "shame-and-recovery")
 * @param {Function} props.onBack - Callback for back navigation
 */
export function LearningPathView({ topicId, onBack }) {
  const {
    topic,
    tiles,
    activeTileId,
    currentInsight,
    openTile,
    refreshInsight,
    closeInsight,
  } = useLearningTopic(topicId);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownOpen]);

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-3xl bg-slate-900/80 px-6 py-5 text-center text-sm text-slate-300">
          Topic not found.
        </div>
      </div>
    );
  }

  const activeTile = tiles.find((t) => t.id === activeTileId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-2 text-xs font-medium text-amber-300 hover:text-amber-200 transition"
        >
          ← Back
        </button>
      )}

      {/* Title Section - Compact */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white">
          {topic.title}
        </h1>
        {topic.subtitle && (
          <p className="text-xs md:text-sm text-slate-400">{topic.subtitle}</p>
        )}
      </div>

      {/* Compact Dropdown Selector */}
      <div ref={dropdownRef} className="relative z-30">
        <button
          type="button"
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
          }}
          className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-slate-900/60 px-4 py-2.5 text-left transition-all hover:border-amber-400/70 hover:bg-slate-900/90 cursor-pointer"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-100 truncate">
              {activeTile
                ? activeTile.label
                : "Select a topic to explore..."}
            </span>
            {activeTile?.mood && (
              <span className="text-[10px] uppercase tracking-wide text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                {activeTile.mood}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && tiles && tiles.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-slate-700/80 bg-slate-950/95 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.65)] max-h-[60vh] overflow-y-auto">
            {tiles.map((tile) => {
              const isActive = activeTileId === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    openTile(tile.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    isActive
                      ? "bg-amber-500/10 border-l-2 border-amber-400/90"
                      : "hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-100">
                      {tile.label}
                    </span>
                    {tile.mood && (
                      <span className="text-[10px] uppercase tracking-wide text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                        {tile.mood}
                      </span>
                    )}
                  </div>
                  {tile.caption && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {tile.caption}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Insight Panel (appears when a tile is selected) */}
      {currentInsight && (
        <LearningInsightPanel
          insight={currentInsight}
          onRefresh={refreshInsight}
          onClose={closeInsight}
        />
      )}
    </div>
  );
}

