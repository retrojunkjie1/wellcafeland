/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - System Status Panel
 * 
 * Displays overall system health and status for mission control.
 */

import React from 'react';
import { useWcOs } from '../../hooks/useWcOs';

export const SystemStatusPanel: React.FC = () => {
  const { manifest } = useWcOs();

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/50 p-4 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">System Status</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/50">
        OS Health & Configuration
      </p>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl bg-black/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Current Phase
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            Phase {manifest.phases.currentPhase}
          </p>
        </div>

        <div className="rounded-2xl bg-black/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Active Modules
          </p>
          <ul className="mt-2 space-y-1 text-xs text-white/80">
            <li>
              Living Guide: <span className="text-white">{manifest.livingGuide.version}</span>
            </li>
            <li>
              Ritual Engine: <span className="text-white">{manifest.ritualEngine.version}</span>
            </li>
            <li>
              Cinematic Tools: <span className="text-white">{manifest.cinematicTools.version}</span>
            </li>
            <li>
              Intelligent Content: <span className="text-white">{manifest.intelligentContent.version}</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-black/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Safety Protocols
          </p>
          <ul className="mt-2 space-y-1 text-xs text-white/80">
            <li>
              Trauma-Informed: <span className="text-emerald-400">Active</span>
            </li>
            <li>
              Ikuku Luxury: <span className="text-emerald-400">Enabled</span>
            </li>
            <li>
              De-escalation: <span className="text-emerald-400">Enabled</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

