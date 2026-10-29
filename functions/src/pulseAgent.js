const HEALTH_STATES = new Set(["healthy", "degraded", "unavailable", "not_measured"]);

function boundedMetric(value, max = 1_000_000_000) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0
    ? Math.min(max, Math.round(number * 100) / 100)
    : null;
}

function normalizePulseSnapshot(metrics = {}, snapshotAgeSeconds) {
  const source = metrics && typeof metrics === "object" && !Array.isArray(metrics) ? metrics : {};
  const age = boundedMetric(snapshotAgeSeconds, 31_536_000);
  return {
    systemHealth: age !== null && age > 60
      ? "stale"
      : HEALTH_STATES.has(source.systemHealth) ? source.systemHealth : "not_measured",
    agentExecutions: boundedMetric(source.agentExecutions),
    errorRatePercent: boundedMetric(source.errorRate, 100),
    averageResponseMs: boundedMetric(source.avgResponseTime, 600_000),
    snapshotAgeSeconds: age,
  };
}

function buildPulsePrompt(snapshot) {
  return `Authorized administrator operational snapshot (aggregate metrics only): ${JSON.stringify(snapshot)}\n\nSummarize this snapshot for an administrator. Distinguish measured values from missing or stale signals.`;
}

module.exports = { normalizePulseSnapshot, buildPulsePrompt };
