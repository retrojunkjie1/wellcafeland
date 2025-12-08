/**
 * WellnessCafe OS - Phase 55
 * Multi-Agent Fusion Protocol - Integration Examples
 * 
 * This file demonstrates how to integrate the agent fusion system
 * with Living Guide V3, Ritual Engine V3.5, and Emotional Telemetry V2.
 * DELETE THIS FILE after reviewing - it's for reference only.
 */

import React, { useEffect } from 'react';
import { useAgentFusion } from '../hooks/useAgentFusion';
import { useEmotionalTelemetry } from '../hooks/useEmotionalTelemetry';
import { useLivingGuideSession } from '../apps/living/LivingGuideSessionContext';
import { useRitualEngine } from '../hooks/useRitualEngine';

/**
 * Example: Living Guide with Agent Fusion
 */
export const LivingGuideAgentFusionExample = () => {
  const { latestSnapshot, risk, submitSnapshot } = useEmotionalTelemetry();
  const { decision, runFusion } = useAgentFusion();
  const { state } = useLivingGuideSession();
  const { startRitual } = useRitualEngine();

  // Submit snapshot when session state changes
  useEffect(() => {
    const snapshot = {
      tag: state.emotionalTag,
      stress: state.stress,
      trigger: state.trigger,
      timestamp: Date.now(),
    };
    submitSnapshot(snapshot);
  }, [state, submitSnapshot]);

  // Run fusion when risk assessment is available
  useEffect(() => {
    if (latestSnapshot && risk) {
      runFusion(latestSnapshot, risk);
    }
  }, [latestSnapshot, risk, runFusion]);

  // Auto-trigger ritual if agent recommends it
  useEffect(() => {
    if (decision?.action === 'start_ritual' && latestSnapshot) {
      const result = startRitual({
        stress: latestSnapshot.stress,
        trigger: latestSnapshot.trigger,
        freeze: latestSnapshot.tag === 'freeze',
        panic: latestSnapshot.tag === 'panic',
        shame: latestSnapshot.tag === 'shame',
      });
      console.log('Agent-triggered ritual:', result);
    }
  }, [decision, latestSnapshot, startRitual]);

  if (!decision) {
    return <div>Waiting for agent fusion...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Agent Recommendation</h3>
        <p>Dominant Agent: {decision.dominantAgent}</p>
        <p>Action: {decision.action}</p>
        <p>Risk Level: {decision.riskLevel}</p>
      </div>

      <div>
        <h4 className="font-semibold">Messages</h4>
        {decision.messages.map((msg, i) => (
          <div key={i} className="p-2 bg-white/5 rounded">
            <p className="text-xs text-white/60">{msg.from} ({msg.channel})</p>
            <p className="text-sm">{msg.text}</p>
          </div>
        ))}
      </div>

      {decision.action === 'start_ritual' && (
        <div>
          <p>Recommended Ritual: {decision.ritualSequenceKey}</p>
          <p>Intensity: {decision.intensity}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Manual Agent Fusion Check
 */
export const ManualAgentFusionExample = () => {
  const { decision, runFusion } = useAgentFusion();

  const handleCheckIn = () => {
    const snapshot = {
      tag: 'anxious' as const,
      stress: 7,
      trigger: 5,
      timestamp: Date.now(),
    };

    const risk = {
      risk: 'high' as const,
      factors: ['acute stress load'],
      recommendedAction: 'ritual' as const,
    };

    runFusion(snapshot, risk);
  };

  return (
    <div>
      <button onClick={handleCheckIn}>Check In with Agents</button>
      {decision && (
        <div>
          <p>Agent: {decision.dominantAgent}</p>
          <p>Action: {decision.action}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Agent Message Display
 */
export const AgentMessageDisplay = ({ decision }) => {
  if (!decision) return null;

  return (
    <div className="space-y-2">
      {decision.messages.map((msg, i) => {
        const channelStyles = {
          system: 'bg-red-500/10 border-red-500/20',
          ui_hint: 'bg-blue-500/10 border-blue-500/20',
          reflection: 'bg-purple-500/10 border-purple-500/20',
        };

        return (
          <div
            key={i}
            className={`p-3 rounded border ${channelStyles[msg.channel]}`}
          >
            <p className="text-xs uppercase tracking-wide text-white/60">
              {msg.from} · {msg.channel}
            </p>
            <p className="text-sm text-white/90 mt-1">{msg.text}</p>
          </div>
        );
      })}
    </div>
  );
};

