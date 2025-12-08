/**
 * WellnessCafe OS - Phase 54
 * Emotional Telemetry V2 - Type Definitions
 * 
 * Core emotional and risk models for the telemetry system.
 * Clinically-informed, trauma-aware, shame-safe.
 */

export type EmotionalSignal =
  | 'steady'
  | 'anxious'
  | 'overwhelmed'
  | 'numb'
  | 'shame'
  | 'panic'
  | 'freeze'
  | 'grief';

export interface EmotionalSnapshot {
  tag: EmotionalSignal;
  stress: number;   // 0–10
  trigger: number;  // 0–10
  timestamp: number;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskAssessment {
  risk: RiskLevel;
  factors: string[];
  recommendedAction: 'none' | 'grounding' | 'ritual' | 'escalate';
}

