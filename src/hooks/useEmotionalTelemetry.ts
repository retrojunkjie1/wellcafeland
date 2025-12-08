/**
 * WellnessCafe OS - Phase 54
 * Emotional Telemetry V2 - React Hook
 * 
 * Provides a React hook interface for the emotional telemetry system.
 * Allows components to submit snapshots and receive risk assessments.
 */

import { useCallback, useState } from 'react';
import type { EmotionalSnapshot, RiskAssessment } from '../telemetry/emotionalTypes';
import { processSnapshot } from '../telemetry/riskRadar';

/**
 * useEmotionalTelemetry Hook
 * 
 * Provides access to the emotional telemetry system.
 * 
 * @example
 * ```tsx
 * const { submitSnapshot, risk, latestSnapshot } = useEmotionalTelemetry();
 * 
 * submitSnapshot({
 *   tag: 'anxious',
 *   stress: 7,
 *   trigger: 5,
 *   timestamp: Date.now(),
 * });
 * ```
 */
export const useEmotionalTelemetry = () => {
  const [latestSnapshot, setLatestSnapshot] = useState<EmotionalSnapshot | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  const submitSnapshot = useCallback((snapshot: EmotionalSnapshot) => {
    setLatestSnapshot(snapshot);
    const riskAssessment = processSnapshot(snapshot);
    setRisk(riskAssessment);
  }, []);

  return {
    latestSnapshot,
    risk,
    submitSnapshot,
  };
};

