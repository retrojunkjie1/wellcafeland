/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Sentinel Alerts Feed
 * 
 * Live feed of high/critical risk alerts for internal monitoring.
 */

import React, { useEffect, useState } from 'react';
import type { RiskAssessment } from '../../telemetry/emotionalTypes';

interface AlertItem {
  id: number;
  risk: string;
  message: string;
  timestamp: number;
}

interface Props {
  latestRisk: RiskAssessment | null;
}

let alertCounter = 0;

export const SentinelAlertsFeed: React.FC<Props> = ({ latestRisk }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    if (!latestRisk) return;
    if (latestRisk.risk === 'high' || latestRisk.risk === 'critical') {
      const id = ++alertCounter;
      const item: AlertItem = {
        id,
        risk: latestRisk.risk,
        message:
          latestRisk.risk === 'critical'
            ? 'Critical nervous system load detected. Encourage slowing down, grounding, and additional support.'
            : 'High nervous system load detected. Suggest grounding or a gentle ritual.',
        timestamp: Date.now(),
      };
      setAlerts((prev) => [item, ...prev].slice(0, 20));
    }
  }, [latestRisk]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-black/60 via-black/50 to-black/80 p-4 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Sentinel Alerts</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/50">
        Live Internal Warnings
      </p>

      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-white/50">No alerts raised.</p>
      ) : (
        <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1 text-sm">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    a.risk === 'critical' ? 'text-red-300' : 'text-amber-300'
                  }`}
                >
                  {a.risk.toUpperCase()}
                </span>
                <span className="text-[10px] text-white/40">
                  {new Date(a.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">{a.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

