/**
 * Clinical Formulation Engine — OS treatment facility layer.
 * Deterministic, non-diagnostic, trauma-informed.
 */

const ENGINE_VERSION = "wc_os_engine_v1";

const { buildFormulation } = require("./FormulationEngine");
const { stratifyRisk, requiresEscalationScreen, blocksCasualCoaching } = require("./SafetyEngine");
const { buildCarePlan } = require("./CarePlanEngine");
const { matchInterventions } = require("./InterventionsLibrary");
const { applyToneDirectives } = require("./TonePolicy");
const { hash, createAuditEvent } = require("./Audit");

function runEngine(answers, sessionId) {
  const inputHash = hash(answers);
  const risk = stratifyRisk(answers);
  const formulation = buildFormulation(answers, risk);
  const interventions = matchInterventions(answers, formulation.contraindications);
  const carePlan = buildCarePlan(formulation, interventions, sessionId);

  const summary = {
    headline: applyToneDirectives(formulation.summary.headline, formulation.toneDirectives),
    todayPriority: applyToneDirectives(formulation.summary.todayPriority, formulation.toneDirectives),
    focus: formulation.summary.focus,
    riskLevel: risk.level,
    escalationPhrase: risk.escalationPhrase,
    firstThree: carePlan.firstThree.map((i) => ({
      id: i.id,
      domain: i.domain,
      title: i.title,
      durationMinutes: i.durationMinutes,
      steps: i.steps,
    })),
  };

  const outputHash = hash({ formulation: formulation.stageOfChange, riskLevel: risk.level, itemCount: carePlan.items.length });

  return {
    formulation,
    risk,
    carePlan,
    summary,
    inputHash,
    outputHash,
    engineVersion: ENGINE_VERSION,
    requiresEscalationScreen: requiresEscalationScreen(risk),
    blocksCasualCoaching: blocksCasualCoaching(risk),
  };
}

module.exports = {
  ENGINE_VERSION,
  runEngine,
  buildFormulation,
  stratifyRisk,
  buildCarePlan,
  matchInterventions,
  createAuditEvent,
  hash,
};
