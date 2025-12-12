/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Living Guide Integration Example
 * 
 * Example snippet showing how to integrate QuickGroundingButton
 * into the Living Guide page.
 * 
 * This is an EXAMPLE FILE - not meant to be imported directly.
 * Use this as a reference for integrating into your actual Living Guide component.
 */

import React from 'react';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';
import { QuickGroundingButton } from '@/components/healer/QuickGroundingButton';
import { useHealerToolkit } from '@/hooks/useHealerToolkit';
import { HealerPanel } from '@/components/healer/HealerPanel';
import type { HealerIntervention } from '@/healer/healerTypes';

/**
 * Example: Living Guide with Healer Toolkit Integration
 * 
 * This shows how to add the QuickGroundingButton to your Living Guide page.
 * The button will appear when there's a valid snapshot and risk assessment.
 */
export const LivingGuideWithHealer: React.FC = () => {
  const { latestSnapshot, risk, submitSnapshot } = useEmotionalTelemetry();

  // In reality, snapshot would be built from a check-in UI
  // Here we just guard for when data exists
  const canOffer = latestSnapshot && risk;

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/70">
        When things feel heavy, this section offers options that move at the speed of your nervous system, not at the speed of pressure.
      </p>

      {canOffer && (
        <QuickGroundingButton snapshot={latestSnapshot!} risk={risk!} />
      )}

      {!canOffer && (
        <p className="text-xs text-white/50">
          Once you complete a quick emotional check-in, we&apos;ll suggest one or two gentle support options here.
        </p>
      )}
    </div>
  );
};

/**
 * Example: Using HealerPanel directly with custom logic
 */
export const LivingGuideWithHealerPanel: React.FC = () => {
  const { latestSnapshot, risk } = useEmotionalTelemetry();
  const { recommendations, computeRecommendations } = useHealerToolkit();

  React.useEffect(() => {
    if (latestSnapshot && risk) {
      computeRecommendations({ snapshot: latestSnapshot, risk }, 3);
    }
  }, [latestSnapshot, risk, computeRecommendations]);

  const handleBeginIntervention = (intervention: HealerIntervention) => {
    // Navigate to intervention flow or start practice
    console.log('Begin intervention:', intervention.id);
    // Example: navigate(`/tools/${intervention.id}`);
    // Example: startRitualSequence(intervention.linkedRitualSequenceKey);
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Supportive Interventions
        </h2>
        {recommendations.length > 0 ? (
          <HealerPanel
            interventions={recommendations}
            onBeginIntervention={handleBeginIntervention}
          />
        ) : (
          <p className="text-sm text-white/60">
            Complete an emotional check-in to see recommended interventions.
          </p>
        )}
      </section>
    </div>
  );
};

