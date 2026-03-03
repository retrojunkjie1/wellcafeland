// src/features/breathing/LuxuryBreathingShell.jsx
// Phase 53: OS-grade layout shell — no scrollbars, luxury glass, containment
// Phase 53C2: BackButton styling, rounded-3xl, bg-white/5

import React from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function LuxuryBreathingShell({
  onBack,
  voiceEnabled,
  onToggleVoice,
  children,
}) {
  return (
    <div className="relative flex flex-col overflow-hidden min-h-[400px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl w-full h-full">
      {/* Luxury background layers */}
      <div className="absolute inset-0 bg-slate-950 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(800px 500px at 35% 25%, rgba(245,158,11,0.18), transparent 55%), radial-gradient(900px 700px at 70% 60%, rgba(59,130,246,0.14), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/40 to-slate-950/80 pointer-events-none" />

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

      {/* Content area — no scroll */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden py-8 px-4 min-h-0">
        {children}
      </div>

      {/* Voice toggle — pill, OS-native */}
      {onToggleVoice && (
        <div className="relative flex justify-center pb-3">
          <button
            type="button"
            onClick={onToggleVoice}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-200 hover:bg-white/12 transition"
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

    </div>
  );
}
