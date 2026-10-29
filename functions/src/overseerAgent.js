const ALLOWED_GOALS = new Set(["agent-health", "signal-review", "service-baseline"]);

function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
}

function normalizeOverseerRequest({ state, goal } = {}) {
  if (!ALLOWED_GOALS.has(goal)) {
    const error = new Error("Choose one of the available God-Eye review goals.");
    error.code = "INVALID_OVERSEER_GOAL";
    throw error;
  }
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    const error = new Error("Overseer needs the verified aggregate operations snapshot.");
    error.code = "INVALID_OVERSEER_SNAPSHOT";
    throw error;
  }
  const risk = state.riskSignals && typeof state.riskSignals === "object" ? state.riskSignals : {};
  return {
    goal,
    snapshotAgeSeconds: finiteNonNegative(state.snapshotAgeSeconds),
    agentExecutions: finiteNonNegative(state.agentExecutions),
    errorRatePercent: finiteNonNegative(state.errorRatePercent),
    avgResponseTimeMs: finiteNonNegative(state.avgResponseTimeMs),
    enabledHandlers: finiteNonNegative(state.enabledHandlers),
    implementedHandlers: finiteNonNegative(state.implementedHandlers),
    riskSignals: {
      state: ["paused", "unavailable"].includes(risk.state) ? risk.state : "available",
      warningCount: finiteNonNegative(risk.warningCount),
      criticalCount: finiteNonNegative(risk.criticalCount),
      totalEvents: finiteNonNegative(risk.totalEvents),
    },
    reviewQueues: {
      practitioner: finiteNonNegative(state.reviewQueues?.practitioner),
      communityGivers: finiteNonNegative(state.reviewQueues?.communityGivers),
      meetingSources: finiteNonNegative(state.reviewQueues?.meetingSources),
    },
  };
}

function buildOverseerPrompt(request) {
  const goalLabels = {
    "agent-health": "verify handler readiness and measured run health",
    "signal-review": "review the aggregate seven-day operational signal counts",
    "service-baseline": "review measured response time and error rate",
  };
  return [
    `Prepare a short, evidence-based admin review plan to ${goalLabels[request.goal]}.`,
    "Use only the verified aggregate snapshot below. Do not invent tasks that assume missing data exists.",
    "If measurements are stale, paused, unavailable, or missing, make verification the first step.",
    "Do not infer member safety, clinical outcomes, causes, or future service health. Never include private member data.",
    "Return JSON: {\"summary\":\"one concise plan overview\",\"steps\":[\"up to three concrete checks\"],\"evidenceLimit\":\"one sentence describing what this snapshot cannot establish\"}.",
    `Verified aggregates: ${JSON.stringify(request)}`,
  ].join("\n");
}

function normalizeOverseerResult(result = {}) {
  const boundedText = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  const summary = boundedText(result.summary, 400);
  const evidenceLimit = boundedText(result.evidenceLimit, 240);
  if (!summary || !evidenceLimit || !Array.isArray(result.steps)) {
    const error = new Error("Overseer returned an incomplete operational plan.");
    error.code = "INCOMPLETE_OVERSEER_RESULT";
    throw error;
  }
  return {
    summary,
    steps: result.steps.slice(0, 3).map((step) => boundedText(step, 200)).filter(Boolean),
    evidenceLimit,
  };
}

module.exports = { normalizeOverseerRequest, buildOverseerPrompt, normalizeOverseerResult };
