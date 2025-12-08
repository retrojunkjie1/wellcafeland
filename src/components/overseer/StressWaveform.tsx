/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Stress Waveform
 * 
 * Horizontal waveform visualization of stress levels over time.
 */

import React, { useEffect, useState } from 'react';
import type { EmotionalSnapshot } from '../../telemetry/emotionalTypes';
import { getTelemetryWindow } from '../../telemetry/emotionalTelemetry';

export const StressWaveform: React.FC = () => {
  const [windowData, setWindowData] = useState<EmotionalSnapshot[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const window = getTelemetryWindow();
      setWindowData([...window]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (windowData.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
        <p className="text-xs text-white/50">Waveform will appear once telemetry is active.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-black/50 via-white/5 to-black/60 p-3 shadow-lg backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 mb-2">
        Stress Waveform
      </p>
      <div className="h-16 w-full overflow-hidden rounded-xl bg-black/40">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
          {windowData.length > 1 && (
            <polyline
              fill="none"
              stroke="white"
              strokeOpacity="0.85"
              strokeWidth="1.2"
              points={windowData
                .map((s, idx) => {
                  const x = (idx / Math.max(windowData.length - 1, 1)) * 100;
                  const y = 40 - (s.stress / 10) * 36 - 2;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
          )}
        </svg>
      </div>
    </div>
  );
};

