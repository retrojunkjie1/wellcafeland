/**
 * WellnessCafe OS - Phase 54
 * Emotional Telemetry V2 - Integration Examples
 * 
 * This file demonstrates how to integrate the telemetry system
 * with Living Guide V3 and Ritual Engine V3.5.
 * DELETE THIS FILE after reviewing - it's for reference only.
 */

import React, { useEffect } from 'react';
import { useEmotionalTelemetry } from '../hooks/useEmotionalTelemetry';
import { useLivingGuideSession } from '../apps/living/LivingGuideSessionContext';
import { useRitualEngine } from '../hooks/useRitualEngine';
import { TelemetryBand } from '../components/telemetry/TelemetryBand';

/**
 * Example: Living Guide with Telemetry Integration
 */
export const LivingGuideTelemetryExample = () => {
  const { submitSnapshot, risk } = useEmotionalTelemetry();
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

  // Auto-trigger ritual if risk is high
  useEffect(() => {
    if (risk?.recommendedAction === 'ritual') {
      const result = startRitual({
        stress: state.stress,
        trigger: state.trigger,
        freeze: state.freeze,
        panic: state.panic,
        shame: state.shame,
      });

      if (result) {
        console.log('Auto-triggered ritual:', result.decision);
      }
    }
  }, [risk, state, startRitual]);

  return (
    <div>
      <TelemetryBand snapshot={null} risk={risk} />
      {/* Rest of Living Guide */}
    </div>
  );
};

/**
 * Example: Manual Telemetry Submission
 */
export const ManualTelemetryExample = () => {
  const { submitSnapshot, risk, latestSnapshot } = useEmotionalTelemetry();

  const handleSubmit = () => {
    submitSnapshot({
      tag: 'anxious',
      stress: 7,
      trigger: 5,
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit Emotional State</button>
      {risk && (
        <div>
          <p>Risk: {risk.risk}</p>
          <p>Recommended: {risk.recommendedAction}</p>
          <p>Factors: {risk.factors.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example: Risk-Based UI Adaptation
 */
export const RiskBasedUIExample = () => {
  const { risk } = useEmotionalTelemetry();

  if (!risk) {
    return <NormalUI />;
  }

  switch (risk.risk) {
    case 'critical':
      return <EmergencyGroundingUI />;
    case 'high':
      return <RitualRecommendationUI />;
    case 'medium':
      return <GroundingOptionsUI />;
    default:
      return <NormalUI />;
  }
};

const NormalUI = () => <div>Normal flow</div>;
const EmergencyGroundingUI = () => <div>Emergency grounding panel</div>;
const RitualRecommendationUI = () => <div>Ritual recommendation</div>;
const GroundingOptionsUI = () => <div>Grounding options</div>;

