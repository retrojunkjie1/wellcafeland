import { getAgentById } from "@/ai/agents/agentRegistry";

const SAMPLE_COUNTS = Object.freeze({
  savedCheckIns: 1,
  checkInsNamingASkill: 0,
  gratitudeNotes: 0,
  plansOrSupportNotes: 0,
  completedPractices: 1,
  practiceDaysLast7: 1,
  recoveryDaysRecorded: null,
});

const CLIENT_TEST_PAYLOADS = Object.freeze({
  sentinel: { supportNeed: "unsure" },
  oracle: { question: "Offer one brief, non-diagnostic reflection for this system test." },
  cherubim: { content: "I am asking my recovery group for support today." },
  healer: { concern: "sleep" },
  scribe: { question: "Offer one optional reflection prompt for a system test." },
  cartographer: { situations: ["uncertainty"], helps: ["one_step"], avoid: [] },
  bridge: { category: "programs", contactMethod: "website" },
  mirror: { content: "For this system test, I chose to pause and write for a moment." },
  anchor: { question: "Offer one optional grounding invitation for a system test." },
  breathkeeper: { question: "Offer one gentle, optional cue for the existing breathing practice." },
  shepherd: { preference: "browse_first" },
  gatekeeper: { pathway: "not-sure" },
  rhythm: { question: "Offer one small optional step for a system test." },
  lantern: { question: "Explain what a grounding practice is in plain language." },
  steward: { topicId: "sharing" },
  compass: { values: ["Rest"], selectedMove: "basic-need" },
  gardener: { question: "Reflect only on this explicitly selected system-test summary: one practice was completed." },
  translator: { topicId: "cravings-and-urges", language: "es" },
  hearth: { choice: "quiet-company" },
  lighthouse: { cue: "not-sure" },
  towncrier: { updateType: "feature", audience: "clients" },
});

function buildOperationsSnapshot(snapshot = {}) {
  return {
    snapshotAgeSeconds: snapshot.snapshotAgeSeconds,
    agentExecutions: snapshot.agentExecutions,
    errorRatePercent: snapshot.errorRatePercent,
    avgResponseTimeMs: snapshot.avgResponseTimeMs,
    enabledHandlers: snapshot.enabledHandlers,
    implementedHandlers: snapshot.implementedHandlers,
    riskSignals: snapshot.riskSignals,
    reviewQueues: snapshot.reviewQueues,
  };
}

/** Build a non-personal, route-valid smoke request for God-Eye's Test Agent action. */
export function buildAgentSmokeTestPlan(agentId, snapshot = {}) {
  const definition = getAgentById(agentId);
  if (!definition?.handlerId || agentId === "witness") return null;

  if (agentId === "overseer") {
    return {
      agentId: definition.id,
      payload: { goal: "agent-health", state: buildOperationsSnapshot(snapshot) },
    };
  }
  if (agentId === "seer") {
    const riskSignals = snapshot.riskSignals || {};
    return {
      agentId: definition.id,
      payload: {
        telemetry: {
          snapshotAgeSeconds: snapshot.snapshotAgeSeconds,
          agentExecutions: snapshot.agentExecutions,
          errorRatePercent: snapshot.errorRatePercent,
          avgResponseTimeMs: snapshot.avgResponseTimeMs,
          activeUsers24h: 0,
          checkinsLast7Days: 0,
          riskSignals: {
            state: riskSignals.state,
            warningCount: riskSignals.warningCount,
            criticalCount: riskSignals.criticalCount,
            totalEvents: riskSignals.totalEvents,
            dailyCounts: [],
          },
        },
      },
    };
  }
  if (agentId === "pulse") {
    return {
      agentId: definition.id,
      payload: {
        metrics: {
          systemHealth: snapshot.systemHealth || "not_measured",
          agentExecutions: snapshot.agentExecutions,
          errorRate: snapshot.errorRatePercent,
          avgResponseTime: snapshot.avgResponseTimeMs,
        },
        snapshotAgeSeconds: snapshot.snapshotAgeSeconds,
      },
    };
  }
  if (agentId === "gardener") {
    return {
      agentId: definition.id,
      payload: { question: `The person explicitly asked for a system-test reflection on these aggregate counts: ${JSON.stringify(SAMPLE_COUNTS)}. Recognize only what the counts show; do not infer clinical progress.` },
    };
  }

  const payload = CLIENT_TEST_PAYLOADS[agentId];
  return payload ? { agentId: definition.id, payload: { ...payload } } : null;
}

export function canRunAdminAgentSmokeTest(agentId) {
  return buildAgentSmokeTestPlan(agentId) !== null;
}
