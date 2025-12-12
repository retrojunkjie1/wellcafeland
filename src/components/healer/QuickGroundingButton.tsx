/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Quick Grounding Button
 * 
 * Tiny component you can drop anywhere to one-click a grounding intervention
 * using current snapshot + risk.
 * 
 * Assumes caller gives snapshot + risk (e.g. from Living Guide or Overseer).
 */

import React, { useCallback } from 'react';
import type { EmotionalSnapshot, RiskAssessment } from '../../telemetry/emotionalTypes';
import { useHealerToolkit } from '../../hooks/useHealerToolkit';
import { HealerPanel } from './HealerPanel';

interface QuickGroundingButtonProps {
  snapshot: EmotionalSnapshot;
  risk: RiskAssessment;
}

export const QuickGroundingButton: React.FC<QuickGroundingButtonProps> = ({
  snapshot,
  risk,
}) => {
  const { recommendations, computeRecommendations } = useHealerToolkit();

  const handleClick = useCallback(() => {
    computeRecommendations({ snapshot, risk }, 3);
  }, [computeRecommendations, snapshot, risk]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white hover:bg-white/20"
      >
        Offer Gentle Support
      </button>

      {recommendations.length > 0 && <HealerPanel interventions={recommendations} />}
    </div>
  );
};
