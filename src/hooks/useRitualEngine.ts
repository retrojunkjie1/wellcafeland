/**
 * WellnessCafe OS - Phase 52
 * Ritual Engine V3.5 - React Hook
 * 
 * Provides a React hook interface for the trauma-adaptive ritual engine.
 * Integrates with wcOsManifest and provides easy access to ritual functionality.
 */

import { useMemo } from 'react';
import { computeAdaptiveDecision, UserEmotionalState } from '../engines/ritual/ritualAdaptiveLogic';
import { ritualSequences, RitualStep } from '../engines/ritual/ritualSequences';
import { useWcOs } from './useWcOs';

export interface RitualStartResult {
  decision: ReturnType<typeof computeAdaptiveDecision>;
  sequence: RitualStep[];
}

/**
 * useRitualEngine Hook
 * 
 * Provides access to the trauma-adaptive ritual engine.
 * 
 * @example
 * ```tsx
 * const { startRitual } = useRitualEngine();
 * const result = startRitual({
 *   stress: 8,
 *   trigger: 6,
 *   freeze: false,
 *   panic: false,
 *   shame: true,
 * });
 * ```
 */
export const useRitualEngine = () => {
  const { manifest } = useWcOs();

  const startRitual = useMemo(
    () => (state: UserEmotionalState): RitualStartResult | null => {
      // Check if ritual engine is enabled
      if (!manifest.ritualEngine.enabled) {
        console.warn('Ritual Engine is disabled in manifest');
        return null;
      }

      // Compute adaptive decision based on user state
      const decision = computeAdaptiveDecision(state);

      // Get the selected sequence
      const sequence = ritualSequences[decision.nextPath as keyof typeof ritualSequences];

      if (!sequence) {
        console.error(`Ritual sequence not found: ${decision.nextPath}`);
        return null;
      }

      return {
        decision,
        sequence,
      };
    },
    [manifest.ritualEngine.enabled]
  );

  return { startRitual };
};

