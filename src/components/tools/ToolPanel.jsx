// src/components/tools/ToolPanel.jsx
// Glassmorphism tool panel with controls
// Phase 36B: OS Integration

import React from "react";
import { Play, Pause, Square, Volume2, Mic } from "lucide-react";

const ToolPanel = ({
  tool,
  isActive,
  onBegin,
  onPause,
  onStop,
  soundscapeVolume = 0.5,
  voiceEnabled = true,
  onSoundscapeVolumeChange,
  onVoiceToggle,
  children,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 lg:relative lg:bottom-auto">
      {/* Glass panel */}
      <div
        className="
          mx-auto max-w-2xl
          rounded-t-3xl lg:rounded-3xl
          bg-white/[0.08]
          backdrop-blur-xl
          border border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
          p-6
        "
      >
        {/* Tool header */}
        <div className="flex items-center gap-3 mb-6">
          {tool && tool.icon && <tool.icon className="h-6 w-6 text-amber-400" />}
          <div className="flex-1">
            <h2 className="text-white font-light text-xl tracking-wide">
              {tool?.name || "Wellness Tool"}
            </h2>
            <p className="text-white/60 text-sm">
              {tool?.description || "Begin your practice"}
            </p>
          </div>
          <div className="text-white/40 text-xs">
            {tool?.duration || ""}
          </div>
        </div>

        {/* Custom content */}
        {children}

        {/* Control buttons */}
        <div className="flex items-center gap-3 mt-6">
          {!isActive ? (
            <button
              onClick={onBegin}
              className="
                flex-1 flex items-center justify-center gap-2
                bg-gradient-to-r from-amber-400 to-amber-500
                text-slate-950 font-medium
                px-6 py-3 rounded-xl
                hover:from-amber-300 hover:to-amber-400
                transition-all duration-300
                shadow-lg shadow-amber-500/30
              "
            >
              <Play className="h-5 w-5" fill="currentColor" />
              Begin Session
            </button>
          ) : (
            <>
              <button
                onClick={onPause}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-white/10 text-white border border-white/20
                  px-6 py-3 rounded-xl
                  hover:bg-white/20
                  transition-all duration-300
                "
              >
                <Pause className="h-5 w-5" />
                Pause
              </button>
              <button
                onClick={onStop}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-red-500/20 text-red-300 border border-red-500/30
                  px-6 py-3 rounded-xl
                  hover:bg-red-500/30
                  transition-all duration-300
                "
              >
                <Square className="h-5 w-5" />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Audio controls */}
        {isActive && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            {/* Soundscape volume */}
            <div className="flex items-center gap-3">
              <Volume2 className="h-4 w-4 text-white/60" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={soundscapeVolume}
                onChange={(e) => onSoundscapeVolumeChange?.(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400
                "
              />
              <span className="text-white/60 text-xs w-8 text-right">
                {Math.round(soundscapeVolume * 100)}%
              </span>
            </div>

            {/* Voice toggle */}
            <div className="flex items-center gap-3">
              <Mic className="h-4 w-4 text-white/60" />
              <button
                onClick={onVoiceToggle}
                className={`
                  flex-1 text-left text-sm
                  ${voiceEnabled ? 'text-white/90' : 'text-white/40'}
                `}
              >
                Voice Guidance
              </button>
              <div
                onClick={onVoiceToggle}
                className={`
                  w-10 h-5 rounded-full cursor-pointer transition-colors
                  ${voiceEnabled ? 'bg-amber-400' : 'bg-white/20'}
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full bg-white shadow-md
                    transition-transform duration-200
                    ${voiceEnabled ? 'translate-x-5' : 'translate-x-0.5'}
                    mt-0.5
                  `}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPanel;

