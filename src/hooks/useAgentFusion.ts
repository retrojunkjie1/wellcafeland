/**
 * WellnessCafe OS - Phase 55
 * Multi-Agent Fusion Protocol - React Hook
 * 
 * Provides a React hook interface for the agent fusion system.
 * Can be called from Living Guide, Ritual screens, or future consoles.
 */

import { useCallback, useState } from 'react';
import type { EmotionalSnapshot, RiskAssessment } from '../telemetry/emotionalTypes';
import type { FusionDecision, FusionContextInput } from '../agents/agentTypes';
import { fuseAgents } from '../agents/agentFusionEngine';

/**
 * useAgentFusion Hook
 * 
 * Provides access to the multi-agent fusion system.
 * 
 * @example
 * ```tsx
 * const { decision, runFusion } = useAgentFusion();
 * 
 * runFusion(snapshot, risk);
 * // Returns fusion decision with agent recommendations
 * ```
 */
export const useAgentFusion = () => {
  const [decision, setDecision] = useState<FusionDecision | null>(null);

  const runFusion = useCallback(
    (snapshot: EmotionalSnapshot, risk: RiskAssessment) => {
      const ctx: FusionContextInput = { snapshot, risk };
      const result = fuseAgents(ctx);
      setDecision(result);
      return result;
    },
    []
  );

  return {
    decision,
    runFusion,
  };
};

