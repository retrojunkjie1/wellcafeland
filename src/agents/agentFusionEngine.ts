/**
 * WellnessCafe OS - Phase 55
 * Multi-Agent Fusion Protocol - Fusion Engine
 * 
 * Core fusion logic that takes emotional telemetry, risk assessment,
 * and OS manifest to produce agent-based recommendations.
 */

import type {
  FusionContextInput,
  FusionDecision,
  FusionMessage,
  FusionRecommendedAction,
} from './agentTypes';
import { getAgentProfile } from './agentRegistry';
import type { RiskLevel } from '../telemetry/emotionalTypes';
import type { RitualIntensity } from '../engines/ritual/ritualEngineConfig';
import { wcOsManifest } from '../core/wcOsManifest';

/**
 * Chooses the dominant agent and supporting agents based on risk level.
 * 
 * Trauma-informed: Higher risk = more protective agents (Sentinel/Overseer).
 */
function chooseDominantAgent(riskLevel: RiskLevel): {
  dominant: 'overseer' | 'healer' | 'seer' | 'sentinel';
  supporting: ('seer' | 'healer' | 'sentinel' | 'towncrier')[];
} {
  if (riskLevel === 'critical') {
    return { dominant: 'sentinel', supporting: ['overseer', 'healer'] };
  }
  if (riskLevel === 'high') {
    return { dominant: 'overseer', supporting: ['healer', 'seer'] };
  }
  if (riskLevel === 'medium') {
    return { dominant: 'healer', supporting: ['seer', 'towncrier'] };
  }
  return { dominant: 'seer', supporting: ['towncrier'] };
}

/**
 * Maps risk assessment recommended action to fusion action.
 */
function mapRiskToAction(
  riskLevel: RiskLevel,
  recommended: 'none' | 'grounding' | 'ritual' | 'escalate'
): FusionRecommendedAction {
  if (recommended === 'escalate') return 'escalate_support';
  if (recommended === 'ritual') return 'start_ritual';
  if (recommended === 'grounding') return 'offer_grounding';
  if (riskLevel === 'medium') return 'offer_grounding';
  return 'none';
}

/**
 * Determines default ritual intensity based on risk level.
 * 
 * Trauma-informed: Higher risk = lower intensity (safety first).
 */
function defaultIntensityForRisk(riskLevel: RiskLevel): RitualIntensity {
  if (riskLevel === 'critical' || riskLevel === 'high') return 'low';
  if (riskLevel === 'medium') return 'medium';
  return wcOsManifest.ritualEngine.defaultIntensity;
}

/**
 * Builds agent messages based on context and decision.
 * 
 * All messages are trauma-informed, non-judgmental, and shame-safe.
 */
function buildMessages(
  ctx: FusionContextInput,
  decision: { dominant: string; supporting: string[] },
  action: FusionRecommendedAction
): FusionMessage[] {
  const messages: FusionMessage[] = [];

  // Overseer / Sentinel speak first in higher risk
  if (decision.dominant === 'sentinel' || decision.dominant === 'overseer') {
    messages.push({
      from: decision.dominant as any,
      channel: 'system',
      text:
        ctx.risk.risk === 'critical'
          ? 'We are slowing things down and prioritizing your safety. You do not have to push through anything right now.'
          : 'We see that your nervous system is carrying a lot. We will keep things gentle and paced.',
    });
  }

  if (action === 'offer_grounding') {
    messages.push({
      from: 'healer',
      channel: 'ui_hint',
      text: 'Let's try a short grounding moment together—nothing heavy, just a few safe, steadying steps.',
    });
  }

  if (action === 'start_ritual') {
    messages.push({
      from: 'healer',
      channel: 'ui_hint',
      text: 'We can move into a guided ritual that meets you where you are and keeps your system supported.',
    });
  }

  if (action === 'escalate_support') {
    messages.push({
      from: 'overseer',
      channel: 'system',
      text: 'This might be a moment to reach for extra support. If you have a trusted person or professional, consider contacting them.',
    });
  }

  // Seer reflection in non-critical states
  if (ctx.risk.risk === 'medium' || ctx.risk.risk === 'low') {
    messages.push({
      from: 'seer',
      channel: 'reflection',
      text: 'There might be a pattern in how stress rises for you. We can explore it gently when you feel ready.',
    });
  }

  return messages;
}

/**
 * Fuses agent recommendations based on emotional telemetry and risk assessment.
 * 
 * This is the core decision engine that:
 * - Selects which agent should lead
 * - Determines recommended action
 * - Chooses appropriate ritual sequence
 * - Generates trauma-informed messages
 */
export function fuseAgents(context: FusionContextInput): FusionDecision {
  const { snapshot, risk } = context;
  const { dominant, supporting } = chooseDominantAgent(risk.risk);
  const action = mapRiskToAction(risk.risk, risk.recommendedAction);
  const intensity = defaultIntensityForRisk(risk.risk);

  const messages = buildMessages(context, { dominant, supporting }, action);

  // Simple mapping for now; later phases can attach actual ritual keys.
  const ritualSequenceKey =
    action === 'start_ritual' || action === 'offer_grounding'
      ? snapshot.tag === 'panic' || snapshot.tag === 'freeze'
        ? 'anchoringProtocol'
        : snapshot.tag === 'shame'
        ? 'selfCompassionProtocol'
        : 'standardSequence'
      : undefined;

  return {
    dominantAgent: dominant,
    supportingAgents: supporting,
    action,
    intensity,
    ritualSequenceKey,
    riskLevel: risk.risk,
    riskFactors: risk.factors,
    messages,
  };
}

