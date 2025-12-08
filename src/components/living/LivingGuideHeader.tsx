/**
 * WellnessCafe OS - Phase 53
 * Living Guide V3 - Cinematic Header
 * 
 * Luxury, cinematic live-session header with pulsing indicator,
 * emotional state display, and ritual engine status.
 */

import React from 'react';
import { useWcOs } from '../../hooks/useWcOs';
import { useLivingGuideSession } from '../../apps/living/LivingGuideSessionContext';

export const LivingGuideHeader: React.FC = () => {
  const { manifest } = useWcOs();
  const { state } = useLivingGuideSession();

  if (!manifest.livingGuide.enabled) return null;

  const pulseColor = manifest.ikukuLuxury.palette.gold;

  return (
    <header className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="relative inline-flex h-3 w-3 rounded-full shadow-md"
            style={{ backgroundColor: pulseColor }}
          >
            <span
              className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ backgroundColor: pulseColor }}
            />
          </span>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-white/60">
              Living Guide · Session Online
            </span>
            <span className="text-sm text-white/80">
              Emotional state: <span className="font-medium text-white">{state.emotionalTag}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            Ritual Engine
          </span>
          <span className="text-xs text-white/80">
            {state.currentRitualIntensity
              ? `Intensity: ${state.currentRitualIntensity}`
              : 'Waiting to calibrate'}
          </span>
        </div>
      </div>
    </header>
  );
};

