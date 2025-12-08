/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Telemetry Stream
 * 
 * Displays the full telemetry window with visual bar chart.
 */

import React, { useEffect, useState } from 'react';
import type { EmotionalSnapshot } from '../../telemetry/emotionalTypes';
import { getTelemetryWindow } from '../../telemetry/emotionalTelemetry';

export const TelemetryStream: React.FC = () => {
  const [windowData, setWindowData] = useState<EmotionalSnapshot[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const window = getTelemetryWindow();
      setWindowData([...window]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const latest = windowData[windowData.length - 1];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Emotional Telemetry Stream</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
          Last {windowData.length} samples
        </p>
      </div>

      {!latest ? (
        <p className="mt-3 text-sm text-white/50">No telemetry data yet.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-white/70">
            Latest Signal:{' '}
            <span className="font-semibold text-white">{latest.tag}</span> · Stress{' '}
            <span className="font-semibold text-white">{latest.stress}/10</span>
          </p>

          <div className="mt-4 flex items-end gap-1 overflow-x-auto">
            {windowData.map((s) => {
              const height = (s.stress / 10) * 48 + 4;
              return (
                <div
                  key={s.timestamp}
                  className="w-2 rounded-t-full bg-gradient-to-t from-white/20 to-white/80"
                  style={{ height }}
                  title={`${new Date(s.timestamp).toLocaleTimeString()} · ${s.tag} · ${s.stress}/10`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

