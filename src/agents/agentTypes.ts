/**
 * WellnessCafe OS - Phase 55
 * Multi-Agent Fusion Protocol - Type Definitions
 * 
 * Defines agent roles, capabilities, and fusion decision models.
 * Integrates with emotional telemetry, risk radar, and ritual engine.
 */

import type { RiskLevel, RiskAssessment } from '../telemetry/emotionalTypes';
import type { EmotionalSnapshot } from '../telemetry/emotionalTypes';
import type { RitualIntensity } from '../engines/ritual/ritualEngineConfig';

// The shared JSON catalog is the runtime source of IDs and capabilities.
// These aliases stay open so new catalog entries do not require a second roster.
export type AgentRole = string;
export type AgentCapability = string;

export interface AgentProfile {
  id: AgentRole;
  displayName: string;
  primaryCapabilities: AgentCapability[];
  description: string;
}

export type FusionRecommendedAction =
  | 'none'
  | 'offer_grounding'
  | 'start_ritual'
  | 'show_reflection'
  | 'escalate_support';

export interface FusionMessage {
  from: AgentRole;
  channel: 'system' | 'ui_hint' | 'reflection';
  text: string;
}

export interface FusionDecision {
  dominantAgent: AgentRole;
  supportingAgents: AgentRole[];
  action: FusionRecommendedAction;
  intensity?: RitualIntensity;
  ritualSequenceKey?: string;
  riskLevel: RiskLevel;
  riskFactors: string[];
  messages: FusionMessage[];
}

export interface FusionContextInput {
  snapshot: EmotionalSnapshot;
  risk: RiskAssessment;
}
