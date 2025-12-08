/**
 * WellnessCafe OS - Phase 54
 * Emotional Telemetry V2 - UI Component
 * 
 * Cinematic UI band displaying:
 * - Current emotional signal
 * - Stress level visualization
 * - Risk level assessment
 * - Trauma-safe, non-judgmental presentation
 */

import React from 'react';
import type { EmotionalSnapshot, RiskAssessment } from '../../telemetry/emotionalTypes';

interface TelemetryBandProps {
  snapshot: EmotionalSnapshot | null;
  risk: RiskAssessment | null;
}

/**
 * TelemetryBand Component
 * 
 * Displays emotional telemetry data in a luxury, trauma-informed way.
 * Uses color coding for risk levels while maintaining a calm, non-alarming aesthetic.
 */
export const TelemetryBand: React.FC<TelemetryBandProps> = ({ snapshot, risk }) => {
  if (!snapshot) return null;

  const stressPercent = (snapshot.stress / 10) * 100;
  
  // Risk color mapping - trauma-informed: calm colors, not alarming
  const riskColor =
    risk?.risk === 'critical'
      ? '#E54B4B'  // Soft red (not harsh)
      : risk?.risk === 'high'
      ? '#E5A84B'  // Amber/warm
      : risk?.risk === 'medium'
      ? '#4BA0E5'  // Calm blue
      : '#4BE58A'; // Gentle green

  return (
    <div className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
              Emotional Telemetry
            </p>
            <p className="text-sm text-white/80">
              Current Signal:{' '}
              <span className="font-semibold text-white">
                {snapshot.tag.toUpperCase()}
              </span>
            </p>
          </div>

          {risk && (
            <div className="flex flex-col items-end">
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
                Risk Radar
              </p>
              <p className="text-sm font-semibold" style={{ color: riskColor }}>
                {risk.risk.toUpperCase()}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${stressPercent}%`,
              backgroundColor: riskColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

