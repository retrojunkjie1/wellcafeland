/**
 * WellnessCafe OS - Phase 53
 * Living Guide V3 - Adaptive Mood Band
 * 
 * Cinematic mood band that displays stress/trigger levels and
 * provides grounding shortcuts when needed. Trauma-informed and adaptive.
 */

import React from 'react';
import { useLivingGuideSession } from '../../apps/living/LivingGuideSessionContext';
import { useWcOs } from '../../hooks/useWcOs';

export const AdaptiveMoodBand: React.FC = () => {
  const { state } = useLivingGuideSession();
  const { manifest } = useWcOs();

  const stressLevel = Math.min(Math.max(state.stress, 0), 10);
  const triggerLevel = Math.min(Math.max(state.trigger, 0), 10);

  const stressLabel =
    stressLevel <= 3 ? 'Steady' : stressLevel <= 6 ? 'Elevated' : 'High Load';

  const showGroundingShortcut =
    manifest.traumaInformed.showGroundingOptionsInAllFlows ||
    stressLevel >= 7 ||
    state.freeze ||
    state.panic;

  return (
    <section className="w-full border-b border-white/10 bg-gradient-to-r from-black/60 via-black/40 to-black/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">
            Nervous System Snapshot
          </p>
          <p className="text-sm text-white/80">
            Stress: <span className="font-semibold text-white">{stressLabel}</span> · Trigger: {triggerLevel}/10
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex w-full max-w-xs items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white/70 transition-all duration-300"
                style={{ width: `${(stressLevel / 10) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-white/60">{stressLevel}/10</span>
          </div>

          {showGroundingShortcut && (
            <button
              type="button"
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10"
            >
              Begin Grounding Ritual
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

