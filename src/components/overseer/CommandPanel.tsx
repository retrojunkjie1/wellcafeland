/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Command Panel
 * 
 * Internal control panel for generating synthetic telemetry snapshots.
 */

import React, { useState } from 'react';
import type { EmotionalSnapshot } from '../../telemetry/emotionalTypes';

interface Props {
  onSimulate: (payload?: Partial<EmotionalSnapshot>) => void;
}

export const CommandPanel: React.FC<Props> = ({ onSimulate }) => {
  const [stress, setStress] = useState(5);
  const [trigger, setTrigger] = useState(3);
  const [tag, setTag] = useState<EmotionalSnapshot['tag']>('anxious');

  const handleRun = () => {
    onSimulate({ stress, trigger, tag });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/60 p-4 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Command Panel</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/50">
        Internal Simulation
      </p>

      <div className="mt-3 space-y-3 text-sm">
        <div>
          <label className="block text-xs text-white/60 mb-1">Signal Tag</label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as EmotionalSnapshot['tag'])}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="steady">steady</option>
            <option value="anxious">anxious</option>
            <option value="overwhelmed">overwhelmed</option>
            <option value="numb">numb</option>
            <option value="shame">shame</option>
            <option value="panic">panic</option>
            <option value="freeze">freeze</option>
            <option value="grief">grief</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-1">
            Stress ({stress}/10)
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-1">
            Trigger ({trigger}/10)
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={trigger}
            onChange={(e) => setTrigger(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleRun}
        className="mt-4 w-full rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/20"
      >
        Inject Snapshot
      </button>
    </div>
  );
};

