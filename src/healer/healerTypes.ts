/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Type Definitions
 * 
 * Trauma-informed intervention types for nervous system support.
 * Non-judgmental, shame-safe, clinically-informed.
 */

import type { EmotionalSignal, EmotionalSnapshot, RiskLevel, RiskAssessment } from '../telemetry/emotionalTypes';

export type HealerCategory =
  | 'grounding'
  | 'breathwork'
  | 'somatic'
  | 'urge_surfing'
  | 'shame_rescue'
  | 'panic_calm'
  | 'grief_support'
  | 'stabilization';

export type HealerIntensity = 'low' | 'medium' | 'high';

export interface HealerStep {
  id: string;
  label: string;
  description: string;
  suggestedDurationSeconds?: number;
}

export interface HealerIntervention {
  id: string;
  name: string;
  category: HealerCategory;
  intensity: HealerIntensity;
  suitableForSignals: EmotionalSignal[];
  suitableForRisk: RiskLevel[];
  approximateDurationSeconds: number;
  summary: string;
  steps: HealerStep[];
  notes?: string;
  linkedRitualSequenceKey?: string; // optional tie-in to ritualSequences (e.g. 'anchoringProtocol')
}

export interface HealerMatchContext {
  snapshot: EmotionalSnapshot;
  risk: RiskAssessment;
}

export interface HealerRecommendation {
  intervention: HealerIntervention;
  matchScore: number;
  reason: string;
}

