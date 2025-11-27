// src/components/interaction/modules/VoiceModule.jsx
// Voice recording module with waveform

import React, { useMemo } from "react";
import { Mic, Square } from "lucide-react";
import { useInteractionCanvasStore } from "@/stores/useInteractionCanvasStore";

const VoiceModule = () => {
  const { isRecording, stopRecording } = useInteractionCanvasStore();

  // Fixed waveform pattern for consistent rendering
  const waveformHeights = useMemo(
    () => [
      35, 42, 28, 50, 32, 45, 38, 48, 34, 40, 36, 44, 30, 46, 33, 39, 37, 43,
      31, 47,
    ],
    []
  );

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 h-16 w-full">
            {waveformHeights.map((height, i) => (
              <div
                key={i}
                className="w-1 bg-wcGold rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>

          {/* Status Text */}
          <p className="text-sm text-white/80 text-center">
            {isRecording
              ? "Listening… share what's real for you right now."
              : "Voice mode ready"}
          </p>

          {/* Stop Button */}
          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="rounded-full bg-red-500/20 border border-red-400/40 px-6 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
            >
              <Square className="h-4 w-4 inline mr-2" />
              Stop recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceModule;

