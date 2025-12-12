/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - React Hook
 * 
 * Provides access to Seer insights from emotional telemetry.
 * Combines analytical and narrative layers.
 */

import { useCallback, useState, useMemo } from 'react';
import { getTelemetryWindow } from '../telemetry/emotionalTelemetry';
import { generateAnalyticsSummary } from '../seer/seerAnalyticsEngine';
import { generateNarrativeInsight } from '../seer/seerNarrativeEngine';
import type { SeerHybridInsight } from '../seer/seerTypes';
import type { RiskAssessment } from '../telemetry/emotionalTypes';

export interface UseSeerInsightsResult {
  /**
   * Combined analytical and narrative insight.
   */
  insight: SeerHybridInsight | null;

  /**
   * Whether insights are available.
   */
  hasInsights: boolean;

  /**
   * Compute insights from current telemetry and optional risk.
   * Call this to generate or refresh insights.
   */
  computeInsights: (risk: RiskAssessment | null) => void;
}

/**
 * React hook for accessing Seer insights.
 * 
 * Combines analytical (clinical) and narrative (oracle) layers
 * to provide trauma-informed, non-blaming insights.
 * 
 * @example
 * ```tsx
 * const { insight, computeInsights } = useSeerInsights();
 * 
 * useEffect(() => {
 *   computeInsights(risk ?? null);
 * }, [risk, computeInsights]);
 * 
 * if (insight?.narrative) {
 *   console.log(insight.narrative.title);
 * }
 * ```
 */
export function useSeerInsights(): UseSeerInsightsResult {
  const [insight, setInsight] = useState<SeerHybridInsight | null>(null);

  const computeInsights = useCallback((risk: RiskAssessment | null) => {
    const snapshots = getTelemetryWindow();

    if (snapshots.length === 0) {
      setInsight(null);
      return;
    }

    const analytics = generateAnalyticsSummary(snapshots);
    if (!analytics) {
      setInsight(null);
      return;
    }

    const narrative = generateNarrativeInsight(analytics);

    setInsight({
      analytics,
      narrative,
    });
  }, []);

  const hasInsights = insight !== null && (insight.analytics !== null || insight.narrative !== null);

  return {
    insight,
    hasInsights,
    computeInsights,
  };
}

