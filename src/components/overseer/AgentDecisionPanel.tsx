/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Agent Decision Panel
 * 
 * Displays multi-agent fusion decisions with messages and recommendations.
 */

import React from 'react';
import type { FusionDecision } from '../../agents/agentTypes';

interface Props {
  decision: FusionDecision | null;
}

export const AgentDecisionPanel: React.FC<Props> = ({ decision }) => {
  if (!decision) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <p className="text-sm text-white/50">
          No agent decisions yet. Awaiting telemetry and risk data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/50 p-4 shadow-xl backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">Agent Fusion Decision</h2>
      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/50">
        Orchestration Outcome
      </p>

      <div className="mt-3 space-y-1 text-sm text-white/80">
        <p>
          Dominant:{' '}
          <span className="font-semibold text-white">{decision.dominantAgent}</span>
        </p>
        <p>
          Action:{' '}
          <span className="font-semibold text-white">{decision.action}</span>
        </p>
        {decision.intensity && (
          <p>
            Ritual Intensity:{' '}
            <span className="font-semibold text-white">{decision.intensity}</span>
          </p>
        )}
        {decision.ritualSequenceKey && (
          <p>
            Sequence:{' '}
            <span className="font-semibold text-white">{decision.ritualSequenceKey}</span>
          </p>
        )}
      </div>

      <div className="mt-4 rounded-2xl bg-black/50 p-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-1">
          Messages
        </p>
        <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {decision.messages.map((m, i) => (
            <li key={i} className="text-xs text-white/80">
              <span className="font-semibold text-white">{m.from}</span>: {m.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

