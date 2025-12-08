/**
 * WellnessCafe OS - Phase 53
 * Living Guide V3 - Main Shell Component
 * 
 * The cinematic front door of the OS. Wraps the Living Guide experience
 * with session context, adaptive header, mood band, and ritual integration.
 */

import React, { ReactNode, useCallback } from 'react';
import { LivingGuideSessionProvider, useLivingGuideSession } from './LivingGuideSessionContext';
import { LivingGuideHeader } from '../../components/living/LivingGuideHeader';
import { AdaptiveMoodBand } from '../../components/living/AdaptiveMoodBand';
import { useRitualEngine } from '../../hooks/useRitualEngine';

interface InnerShellProps {
  children?: ReactNode;
}

const InnerLivingGuideShell: React.FC<InnerShellProps> = ({ children }) => {
  const { state, setRitualResult } = useLivingGuideSession();
  const { startRitual } = useRitualEngine();

  const handleBeginRitual = useCallback(() => {
    const result = startRitual({
      stress: state.stress,
      trigger: state.trigger,
      freeze: state.freeze,
      panic: state.panic,
      shame: state.shame,
    });

    if (!result) {
      console.warn('Ritual engine returned null');
      return;
    }

    setRitualResult(result.decision.intensity, result.decision.nextPath);

    // In a future phase, you will:
    // - Navigate to the ritual player
    // - Pass `sequence` and `decision.cinematicMode`
    // For now, this just calibrates and updates UI.
    console.log('Ritual decision:', result.decision, 'sequence:', result.sequence);
  }, [startRitual, state, setRitualResult]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050608] to-[#050608] text-white">
      <LivingGuideHeader />
      <AdaptiveMoodBand />
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/50 backdrop-blur-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
                Daily Ritual
              </p>
              <h1 className="text-lg font-semibold text-white">
                Calibrate Your System
              </h1>
              <p className="mt-1 text-sm text-white/70">
                When you&apos;re ready, we&apos;ll choose the safest path for today&apos;s ritual
                based on how your nervous system is actually doing—no forcing, no pressure.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <button
                type="button"
                onClick={handleBeginRitual}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/15"
              >
                Begin Ritual Calibration
              </button>
              <p className="text-[11px] text-white/50">
                Intensity:{' '}
                <span className="font-medium text-white/80">
                  {state.currentRitualIntensity ?? 'Not set yet'}
                </span>
              </p>
            </div>
          </div>
        </section>

        {children && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/40 backdrop-blur-md">
            {children}
          </section>
        )}
      </main>
    </div>
  );
};

interface LivingGuideShellProps {
  children?: ReactNode;
}

export const LivingGuideShell: React.FC<LivingGuideShellProps> = ({ children }) => {
  return (
    <LivingGuideSessionProvider>
      <InnerLivingGuideShell>{children}</InnerLivingGuideShell>
    </LivingGuideSessionProvider>
  );
};

