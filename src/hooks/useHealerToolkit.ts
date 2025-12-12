/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - React Hook
 * 
 * React hook for components / flows to use the toolkit.
 */

import { useCallback, useState } from 'react';
import type { HealerIntervention, HealerMatchContext } from '../healer/healerTypes';
import { getTopHealerInterventions } from '../healer/healerEngine';

export const useHealerToolkit = () => {
  const [lastContext, setLastContext] = useState<HealerMatchContext | null>(null);
  const [recommendations, setRecommendations] = useState<HealerIntervention[]>([]);

  const computeRecommendations = useCallback((ctx: HealerMatchContext, max = 3) => {
    const results = getTopHealerInterventions(ctx, max);
    setLastContext(ctx);
    setRecommendations(results);
    return results;
  }, []);

  return {
    lastContext,
    recommendations,
    computeRecommendations,
  };
};
