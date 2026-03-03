// src/features/breathing/LuxuryBreathingCard.jsx
// Phase 53: Premium breathing surface — overflow-hidden, no scrollbars
// Phase 53C2: BackButton styling, End Session neutral (danger on hover only)

import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function LuxuryBreathingCard({
  onBack,
  onEnd,
  voiceEnabled,
  onToggleVoice,
  children,
}) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Back button — BackButton styling */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[calc(12px+env(safe-area-inset-top))] left-3 z-50 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 transition"
          aria-label="Go back"
        >
          Back
        </button>
      )}

      {/* Content area — overflow-hidden to prevent scrollbars */}
      <div className="flex flex-col items-center justify-center overflow-hidden min-h-[50vh] py-8 px-4">
        {children}
      </div>

      {/* Voice toggle — pill button, subtle */}
      {onToggleVoice && (
        <div className="flex justify-center pb-3">
          <button
            type="button"
            onClick={onToggleVoice}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
          >
            {voiceEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-amber-300" />
                <span>Voice Guide On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-white/50" />
                <span>Voice Guide Off</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* End Session — neutral by default, danger on hover/focus only */}
      {onEnd && (
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={onEnd}
            className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white/90 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300 focus:bg-red-500/15 focus:border-red-500/30 focus:text-red-300 transition"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  );
}
