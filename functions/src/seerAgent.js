const MAX_DAILY_POINTS = 7;

function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) / 100 : null;
}

function normalizeSeerTelemetry(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    const error = new Error("Seer needs a verified aggregate operations snapshot.");
    error.code = "INVALID_SEER_SNAPSHOT";
    throw error;
  }

  const dailyCounts = Array.isArray(input.riskSignals?.dailyCounts)
    ? input.riskSignals.dailyCounts.slice(-MAX_DAILY_POINTS).map((point) => ({
      date: typeof point?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(point.date) ? point.date : null,
      count: finiteNonNegative(point?.count),
    })).filter((point) => point.date && point.count !== null)
    : [];

  return {
    snapshotAgeSeconds: finiteNonNegative(input.snapshotAgeSeconds),
    agentExecutions: finiteNonNegative(input.agentExecutions),
    errorRatePercent: finiteNonNegative(input.errorRatePercent),
    avgResponseTimeMs: finiteNonNegative(input.avgResponseTimeMs),
    activeUsers24h: finiteNonNegative(input.activeUsers24h),
    checkinsLast7Days: finiteNonNegative(input.checkinsLast7Days),
    riskSignals: {
      state: ["paused", "unavailable"].includes(input.riskSignals?.state) ? input.riskSignals.state : "available",
      warningCount: finiteNonNegative(input.riskSignals?.warningCount),
      criticalCount: finiteNonNegative(input.riskSignals?.criticalCount),
      totalEvents: finiteNonNegative(input.riskSignals?.totalEvents),
      dailyCounts,
    },
  };
}

function buildSeerPrompt(snapshot) {
  return [
    "Review this point-in-time, aggregate-only WellnessCafe operations snapshot.",
    "Describe only patterns directly supported by the numbers and dated daily counts.",
    "Do not infer causes, member-level safety, clinical outcomes, or future system health.",
    "Call out missing, paused, or stale measurements. If there is not enough evidence, say so.",
    "Always return all three JSON keys. Use an empty insights array when no specific observation is supported, and state that no check is supported when no follow-up is justified.",
    "Return JSON: {\"summary\":\"one concise evidence-based overview\",\"insights\":[\"up to three specific observations\"],\"nextCheck\":\"one evidence-backed admin check, or say none is supported\"}.",
    `Verified aggregates: ${JSON.stringify(snapshot)}`,
  ].join("\n");
}

function normalizeSeerResult(result = {}) {
  const boundedText = (value, maxLength) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
  const summary = boundedText(result.summary, 500);
  const nextCheck = boundedText(result.nextCheck, 240)
    || "No additional check is supported by the returned evidence.";
  if (!summary) {
    const error = new Error("Seer returned an incomplete trend review.");
    error.code = "INCOMPLETE_SEER_RESULT";
    throw error;
  }
  return {
    summary,
    insights: Array.isArray(result.insights)
      ? result.insights.slice(0, 3).map((insight) => boundedText(insight, 240)).filter(Boolean)
      : [],
    nextCheck,
  };
}

module.exports = { normalizeSeerTelemetry, buildSeerPrompt, normalizeSeerResult };
