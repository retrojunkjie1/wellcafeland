/**
 * WellnessCafe OS - Phase 57 Ultra
 * Healer Toolkit - Matching Engine
 * 
 * Logic that selects the best interventions for a given emotional + risk context.
 */

import type { HealerIntervention, HealerMatchContext } from './healerTypes';
import { healerRegistry } from './healerRegistry';
import type { RiskLevel } from '../telemetry/emotionalTypes';

function rankByRiskLevel(target: RiskLevel, candidateLevels: RiskLevel[]): number {
  const order: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
  const targetIndex = order.indexOf(target);
  const scores = candidateLevels.map((lvl) => Math.abs(order.indexOf(lvl) - targetIndex));
  return Math.min(...scores);
}

export function matchHealerInterventions(ctx: HealerMatchContext): HealerIntervention[] {
  const { snapshot, risk } = ctx;

  const filtered = healerRegistry.filter((intervention) => {
    const signalMatch = intervention.suitableForSignals.includes(snapshot.tag);
    const riskMatch = intervention.suitableForRisk.includes(risk.risk);
    return signalMatch || riskMatch;
  });

  const scored = filtered
    .map((intervention) => {
      const riskDistance = rankByRiskLevel(risk.risk, intervention.suitableForRisk);
      const signalBonus = intervention.suitableForSignals.includes(snapshot.tag) ? -1 : 0;
      const score = riskDistance + signalBonus;
      return { intervention, score };
    })
    .sort((a, b) => a.score - b.score);

  return scored.map((entry) => entry.intervention);
}

export function getTopHealerInterventions(ctx: HealerMatchContext, max = 3): HealerIntervention[] {
  const all = matchHealerInterventions(ctx);
  return all.slice(0, max);
}
