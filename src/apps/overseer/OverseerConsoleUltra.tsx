/**
 * WellnessCafe OS - Phase 56 Ultra
 * Overseer Console - Mission Control Edition
 * 
 * Full internal Mission Control for emotional telemetry, risk radar,
 * and multi-agent orchestration. Not user-facing.
 */

import React, { useEffect } from 'react';
import { RiskPanel } from '../../components/overseer/RiskPanel';
import { TelemetryStream } from '../../components/overseer/TelemetryStream';
import { StressWaveform } from '../../components/overseer/StressWaveform';
import { RiskTimelineChart } from '../../components/overseer/RiskTimelineChart';
import { AgentDecisionPanel } from '../../components/overseer/AgentDecisionPanel';
import { SentinelAlertsFeed } from '../../components/overseer/SentinelAlertsFeed';
import { SystemStatusPanel } from '../../components/overseer/SystemStatusPanel';
import { CommandPanel } from '../../components/overseer/CommandPanel';
import { useEmotionalTelemetry } from '../../hooks/useEmotionalTelemetry';
import { useAgentFusion } from '../../hooks/useAgentFusion';
import type { EmotionalSnapshot } from '../../telemetry/emotionalTypes';

export const OverseerConsoleUltra: React.FC = () => {
  const { latestSnapshot, risk, submitSnapshot } = useEmotionalTelemetry();
  const { decision, runFusion } = useAgentFusion();

  // Simple auto-fusion when new risk comes in
  useEffect(() => {
    if (latestSnapshot && risk) {
      runFusion(latestSnapshot, risk);
    }
  }, [latestSnapshot, risk, runFusion]);

  const handleSimulate = (payload: Partial<EmotionalSnapshot> = {}) => {
    const snapshot: EmotionalSnapshot = {
      tag: payload.tag ?? 'anxious',
      stress: payload.stress ?? Math.floor(Math.random() * 11),
      trigger: payload.trigger ?? Math.floor(Math.random() * 11),
      timestamp: Date.now(),
    };
    submitSnapshot(snapshot);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#05060A] to-black text-white px-4 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-white">
              Overseer Console · Ultra
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Mission control for emotional telemetry, risk radar, and multi-agent orchestration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                System Online
              </span>
            </div>
          </div>
        </header>

        {/* Top row: risk + telemetry + commands */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <RiskPanel risk={risk} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <TelemetryStream />
            <StressWaveform />
          </div>
          <div className="lg:col-span-1">
            <CommandPanel onSimulate={handleSimulate} />
          </div>
        </div>

        {/* Middle row: risk timeline + agent decision */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RiskTimelineChart />
          </div>
          <div className="lg:col-span-1">
            <AgentDecisionPanel decision={decision} />
          </div>
        </div>

        {/* Bottom row: alerts + system status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SentinelAlertsFeed latestRisk={risk} />
          <SystemStatusPanel />
        </div>
      </div>
    </div>
  );
};

