/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Integration Example
 * 
 * Example showing how to integrate Seer insights into
 * Living Guide, Overseer Console, or any component.
 * 
 * This is an EXAMPLE FILE - not meant to be imported directly.
 * Use this as a reference for integrating into your actual components.
 */

import React, { useEffect } from 'react';
import { useEmotionalTelemetry } from '@/hooks/useEmotionalTelemetry';
import { useSeerInsights } from '@/hooks/useSeerInsights';
import { SeerInsightPanel } from '@/components/seer/SeerInsightPanel';

/**
 * Example: Seer Insight Section
 * 
 * This shows how to add Seer insights to your component.
 * The insights will appear when emotional telemetry data is available.
 */
export const SeerInsightSection: React.FC = () => {
  const { risk } = useEmotionalTelemetry();
  const { insight, computeInsights } = useSeerInsights();

  useEffect(() => {
    computeInsights(risk ?? null);
  }, [risk, computeInsights]);

  return (
    <SeerInsightPanel
      insight={insight}
      onRefresh={() => computeInsights(risk ?? null)}
    />
  );
};

/**
 * Example: Seer Insights in Living Guide
 */
export const LivingGuideWithSeer: React.FC = () => {
  const { risk } = useEmotionalTelemetry();
  const { insight, computeInsights } = useSeerInsights();

  useEffect(() => {
    computeInsights(risk ?? null);
  }, [risk, computeInsights]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Pattern Insights
        </h2>
        <SeerInsightPanel
          insight={insight}
          onRefresh={() => computeInsights(risk ?? null)}
        />
      </section>
    </div>
  );
};

/**
 * Example: Seer Insights in Overseer Console
 */
export const OverseerWithSeer: React.FC = () => {
  const { risk } = useEmotionalTelemetry();
  const { insight, computeInsights } = useSeerInsights();

  useEffect(() => {
    computeInsights(risk ?? null);
  }, [risk, computeInsights]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            System Insights
          </h2>
          <button
            onClick={() => computeInsights(risk ?? null)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-colors"
          >
            Refresh
          </button>
        </div>
        <SeerInsightPanel
          insight={insight}
          showAnalytics={true}
          showNarrative={true}
          onRefresh={() => computeInsights(risk ?? null)}
        />
      </section>
    </div>
  );
};

