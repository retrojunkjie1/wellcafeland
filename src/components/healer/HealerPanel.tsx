/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Luxury UI Panel
 * 
 * Luxury UI panel to display recommended interventions and steps.
 */

import React from 'react';
import type { HealerIntervention } from '../../healer/healerTypes';

interface HealerPanelProps {
  interventions: HealerIntervention[];
  onBeginIntervention?: (intervention: HealerIntervention) => void;
}

export const HealerPanel: React.FC<HealerPanelProps> = ({
  interventions,
  onBeginIntervention,
}) => {
  if (!interventions.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <p className="text-sm text-white/60">
          When you share how you are doing, this space will offer options that respect your pace and your nervous system.
        </p>
      </div>
    );
  }

  const primary = interventions[0];
  const secondary = interventions.slice(1);

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/60 p-4 shadow-xl backdrop-blur-md">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
          Suggested Support
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">{primary.name}</h2>
        <p className="mt-1 text-sm text-white/75">{primary.summary}</p>

        <ul className="mt-3 space-y-2 text-sm text-white/80">
          {primary.steps.map((step) => (
            <li key={step.id} className="rounded-2xl bg-black/40 px-3 py-2 border border-white/5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                {step.label}
              </p>
              <p className="mt-1 text-xs text-white/80">{step.description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between text-xs text-white/60">
          <span>
            Duration ~ {Math.round(primary.approximateDurationSeconds / 60)} min ·{' '}
            {primary.category.replace('_', ' ')}
          </span>
          {onBeginIntervention && (
            <button
              type="button"
              onClick={() => onBeginIntervention(primary)}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-white/20"
            >
              Begin Sequence
            </button>
          )}
        </div>
      </section>

      {secondary.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">
            Other Options
          </p>
          <div className="space-y-2">
            {secondary.map((iv) => (
              <button
                key={iv.id}
                type="button"
                onClick={() => onBeginIntervention && onBeginIntervention(iv)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10"
              >
                <p className="font-semibold text-white">{iv.name}</p>
                <p className="mt-1 line-clamp-2">{iv.summary}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
