/**
 * WellnessCafe OS - Phase 53
 * Living Guide V3 - Type Definitions
 * 
 * Shared types for the Living Guide V3 cinematic and adaptive session system.
 */

import type { RitualIntensity } from '../../engines/ritual/ritualEngineConfig';

export type EmotionalStateTag =
  | 'steady'
  | 'anxious'
  | 'overwhelmed'
  | 'numb'
  | 'shame'
  | 'grieving';

export interface LivingGuideSessionState {
  emotionalTag: EmotionalStateTag;
  stress: number;   // 0–10
  trigger: number;  // 0–10
  freeze: boolean;
  panic: boolean;
  shame: boolean;
  grieving: boolean;
  currentRitualIntensity?: RitualIntensity;
  activeSequenceKey?: string;
}

