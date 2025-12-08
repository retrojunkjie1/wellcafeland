/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Risk Timeline Chart
 * 
 * Shows risk level over time mapped from telemetry snapshots.
 */

import React, { useEffect, useState } from 'react';
import type { EmotionalSnapshot, RiskLevel } from '../../telemetry/emotionalTypes';
import { getTelemetryWindow, assessRisk } from '../../telemetry/emotionalTelemetry';

interface RiskPoint {
  timestamp: number;
  level: RiskLevel;
}

const riskToIndex = (r: RiskLevel): number =>
  r === 'critical' ? 3 : r === 'high' ? 2 : r === 'medium' ? 1 : 0;

export const RiskTimelineChart: React.FC = () => {
  const [points, setPoints] = useState<RiskPoint[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const window = getTelemetryWindow();
      const mapped: RiskPoint[] = window.map((s) => {
        const risk = assessRisk(s);
        return { timestamp: s.timestamp, level: risk.risk };
      });
      setPoints(mapped);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Risk Timeline</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
          Low → Critical
        </p>
      </div>

      {points.length === 0 ? (
        <p className="mt-3 text-sm text-white/50">No risk data yet.</p>
      ) : (
        <div className="mt-4 h-32 w-full rounded-xl bg-black/40">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#F5C26B"
                strokeWidth="1.4"
                strokeOpacity="0.9"
                points={points
                  .map((p, idx) => {
                    const x = (idx / Math.max(points.length - 1, 1)) * 100;
                    const y = 40 - riskToIndex(p.level) * 12 - 2;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>
        </div>
      )}
    </div>
  );
};

