// src/components/learning/LearningTopicTiles.jsx
// Phase 45: 7-Tile Grid Component

import React from "react";

/**
 * LearningTopicTiles - Displays the 7-tile grid for a learning topic
 * @param {object} props
 * @param {Array} props.tiles - Array of tile objects
 * @param {string|null} props.activeTileId - Currently selected tile ID
 * @param {Function} props.onSelect - Callback when tile is clicked
 */
export function LearningTopicTiles({ tiles, activeTileId, onSelect }) {
  if (!tiles || tiles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {tiles.map((tile) => {
        const isActive = activeTileId === tile.id;
        return (
          <button
            key={tile.id}
            onClick={() => onSelect?.(tile.id)}
            className={`group relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
              isActive
                ? "border-amber-400/90 bg-slate-900/90 shadow-[0_0_30px_rgba(245,197,94,0.25)]"
                : "bg-slate-900/60 border-slate-700/70 hover:border-amber-400/70 hover:bg-slate-900/90"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-100">
                {tile.label}
              </span>
              {tile.mood && (
                <span className="text-[10px] uppercase tracking-wide text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {tile.mood}
                </span>
              )}
            </div>
            {tile.caption && (
              <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300/90">
                {tile.caption}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

