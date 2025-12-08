/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Risk Panel
 * 
 * Displays current risk status with factors and recommended actions.
 */

import React from 'react';
import type { RiskAssessment } from '../../telemetry/emotionalTypes';

interface Props {
  risk: RiskAssessment | null;
}

export const RiskPanel: React.FC<Props> = ({ risk }) => {
  const color =
    risk?.risk === 'critical'
      ? '#E54B4B'
      : risk?.risk === 'high'
      ? '#E5A84B'
      : risk?.risk === 'medium'
      ? '#4BA0E5'
      : '#4BE58A';

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/40 p-4 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Risk Status</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
        Nervous System Load
      </p>

      {!risk ? (
        <p className="mt-4 text-sm text-white/50">Awaiting telemetry input...</p>
      ) : (
        <>
          <p className="mt-3 text-2xl font-bold" style={{ color }}>
            {risk.risk.toUpperCase()}
          </p>

          <ul className="mt-3 space-y-1">
            {risk.factors.map((f, i) => (
              <li key={i} className="text-sm text-white/70">
                • {f}
              </li>
            ))}
            {risk.factors.length === 0 && (
              <li className="text-sm text-white/50">No specific risk factors flagged.</li>
            )}
          </ul>

          <div className="mt-4 rounded-2xl bg-black/40 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
              Recommended Path
            </p>
            <p className="mt-1 text-xs text-white/80">
              {risk.recommendedAction === 'none' &&
                'Observe and keep space available for support if needed.'}
              {risk.recommendedAction === 'grounding' &&
                'Offer a short grounding ritual; keep everything simple and optional.'}
              {risk.recommendedAction === 'ritual' &&
                'Guide into a gentle ritual calibrated to current load.'}
              {risk.recommendedAction === 'escalate' &&
                'Encourage reaching for additional human support or professional backup.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

