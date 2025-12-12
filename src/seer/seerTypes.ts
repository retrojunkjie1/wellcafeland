/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Type Definitions
 * 
 * Models for analytical and narrative insights.
 * Trauma-informed, non-blaming, shame-safe.
 */

import type { EmotionalSnapshot, EmotionalSignal, RiskAssessment } from '../telemetry/emotionalTypes';

export interface SignalDistribution {
  tag: EmotionalSignal;
  count: number;
  percentage: number;
}

export interface SeerAnalyticsSummary {
  totalSamples: number;
  timeframeLabel: string;
  dominantSignal: EmotionalSignal | null;
  averageStress: number;
  averageTrigger: number;
  maxStress: number;
  distribution: SignalDistribution[];
  risingStressTrend: boolean;
  eveningBias: boolean;
}

export interface SeerNarrativeInsight {
  title: string;
  body: string;
  tone: 'gentle' | 'supportive' | 'informative';
}

export interface SeerHybridInsight {
  analytics: SeerAnalyticsSummary | null;
  narrative: SeerNarrativeInsight | null;
}

export interface SeerContextInput {
  snapshots: EmotionalSnapshot[];
  latestRisk: RiskAssessment | null;
}

