/**
 * WellnessCafe OS - Phase 52
 * Ritual Engine V3.5 - Adaptive Logic
 * 
 * Trauma-adaptive decision engine that evaluates user emotional state
 * and selects appropriate ritual paths with cinematic and safety considerations.
 */

import { ritualEngineConfig, RitualIntensity } from './ritualEngineConfig';
import { wcOsManifest } from '../../core/wcOsManifest';

export interface UserEmotionalState {
  stress: number;      // 0–10
  trigger: number;     // 0–10
  freeze: boolean;
  panic: boolean;
  shame: boolean;
}

export interface AdaptiveDecision {
  intensity: RitualIntensity;
  nextPath: string;
  cinematicMode: 'soft' | 'deep' | 'immersive';
  requiresGrounding: boolean;
}

/**
 * Evaluates user emotional state and determines appropriate ritual intensity.
 * 
 * Trauma-informed: Always defaults to lower intensity for panic/freeze states.
 */
export function evaluateUserState(state: UserEmotionalState): RitualIntensity {
  // Highest priority: panic and freeze require lowest intensity
  if (state.panic || state.freeze) return 'low';
  
  // High stress or shame: medium intensity
  if (state.stress > 7 || state.shame) return 'medium';
  
  // Default: can handle higher intensity
  return 'high';
}

/**
 * Selects the appropriate ritual protocol based on user state.
 * 
 * Trauma-informed: Prioritizes safety and grounding protocols.
 */
export function selectAdaptivePath(state: UserEmotionalState): string {
  // Freeze state: needs orienting protocol
  if (state.freeze) return 'orientingProtocol';
  
  // Panic state: needs anchoring protocol
  if (state.panic) return 'anchoringProtocol';
  
  // Shame state: needs self-compassion protocol
  if (state.shame) return 'selfCompassionProtocol';
  
  // Default: standard sequence
  return 'standardSequence';
}

/**
 * Determines cinematic mode based on intensity and system capabilities.
 * 
 * Respects wcOsManifest cinematic tools configuration.
 */
export function applyCinematicHooks(intensity: RitualIntensity): 'soft' | 'deep' | 'immersive' {
  // If cinematic tools are disabled, always use soft mode
  if (!wcOsManifest.cinematicTools.enabled) return 'soft';
  
  // Low intensity: soft cinematic experience
  if (intensity === 'low') return 'soft';
  
  // Medium intensity: deep cinematic experience
  if (intensity === 'medium') return 'deep';
  
  // High intensity: fully immersive cinematic experience
  return 'immersive';
}

/**
 * Applies trauma-informed guardrails based on user state.
 * 
 * Returns true if grounding intervention is required.
 */
export function applyTraumaGuardrails(state: UserEmotionalState): boolean {
  // If de-escalation patterns are disabled, don't trigger guardrails
  if (!wcOsManifest.traumaInformed.deescalationPatternsEnabled) return false;
  
  // Panic or freeze always require grounding
  if (state.panic || state.freeze) return true;
  
  return false;
}

/**
 * Computes the complete adaptive decision for a ritual session.
 * 
 * Integrates intensity evaluation, path selection, cinematic mode,
 * and trauma guardrails into a single decision object.
 */
export function computeAdaptiveDecision(state: UserEmotionalState): AdaptiveDecision {
  const intensity = evaluateUserState(state);
  
  return {
    intensity,
    nextPath: selectAdaptivePath(state),
    cinematicMode: applyCinematicHooks(intensity),
    requiresGrounding: applyTraumaGuardrails(state),
  };
}

