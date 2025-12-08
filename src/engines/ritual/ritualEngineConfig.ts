/**
 * WellnessCafe OS - Phase 52
 * Ritual Engine V3.5 - Configuration
 * 
 * Central configuration for the trauma-adaptive ritual engine.
 * Integrates with wcOsManifest for system-wide consistency.
 */

import { wcOsManifest } from '../../core/wcOsManifest';

export type RitualIntensity = 'low' | 'medium' | 'high';

export interface RitualPacingRules {
  baseDurationMs: number;
  allowSlowdown: boolean;
  allowIntensify: boolean;
}

export interface TraumaAdaptiveRules {
  enableDownshift: boolean;
  enableDeescalationFallback: boolean;
  enableGroundingInterrupt: boolean;
}

export interface RitualEngineConfig {
  version: string;
  defaultIntensity: RitualIntensity;
  pacing: RitualPacingRules;
  trauma: TraumaAdaptiveRules;
}

/**
 * Ritual Engine V3.5 Configuration
 * 
 * Defaults pulled from wcOsManifest with additional trauma-adaptive settings.
 */
export const ritualEngineConfig: RitualEngineConfig = {
  version: 'v3.5',
  defaultIntensity: wcOsManifest.ritualEngine.defaultIntensity,
  pacing: {
    baseDurationMs: 30000,
    allowSlowdown: true,
    allowIntensify: true,
  },
  trauma: {
    enableDownshift: true,
    enableDeescalationFallback: true,
    enableGroundingInterrupt: true,
  },
};

