// src/components/content/NarrationControls.jsx
// Narration playback controls with cinematic styling
// Phase 39: Intelligent Audio Narration Engine

import React from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Gauge } from 'lucide-react';

const NarrationControls = ({
  isPlaying,
  isPaused,
  progress = 0,
  onPlay,
  onPause,
  onStop,
  onSkipForward,
  onSkipBackward,
  onSpeedChange,
  speed = 1.0,
}) => {
  return (
    <div className="
      bg-white/[0.08] backdrop-blur-xl
      border border-white/[0.12]
      rounded-2xl p-4
      space-y-4
    ">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onSkipBackward}
          disabled={!isPlaying}
          className="
            p-2 rounded-lg
            text-white/60 hover:text-amber-400
            hover:bg-white/10
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <SkipBack className="h-5 w-5" />
        </button>

        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="
              p-4 rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-600
              text-white
              hover:from-amber-400 hover:to-orange-500
              shadow-lg shadow-amber-500/30
              transition-all duration-300
            "
          >
            <Play className="h-6 w-6" fill="currentColor" />
          </button>
        ) : isPaused ? (
          <button
            onClick={onPlay}
            className="
              p-4 rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-600
              text-white
              hover:from-amber-400 hover:to-orange-500
              shadow-lg shadow-amber-500/30
              transition-all duration-300
            "
          >
            <Play className="h-6 w-6" fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="
              p-4 rounded-xl
              bg-white/10 text-white
              border border-white/20
              hover:bg-white/20
              transition-all duration-300
            "
          >
            <Pause className="h-6 w-6" />
          </button>
        )}

        <button
          onClick={onStop}
          disabled={!isPlaying}
          className="
            p-2 rounded-lg
            text-white/60 hover:text-red-400
            hover:bg-white/10
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <Square className="h-5 w-5" />
        </button>

        <button
          onClick={onSkipForward}
          disabled={!isPlaying}
          className="
            p-2 rounded-lg
            text-white/60 hover:text-amber-400
            hover:bg-white/10
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
          "
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Speed control */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <Gauge className="h-4 w-4 text-white/60" />
        <div className="flex-1 flex items-center gap-2">
          {[0.8, 1.0, 1.2, 1.5].map(rate => (
            <button
              key={rate}
              onClick={() => onSpeedChange(rate)}
              className={`
                px-2 py-1 rounded text-xs
                transition-all duration-200
                ${speed === rate 
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NarrationControls;

