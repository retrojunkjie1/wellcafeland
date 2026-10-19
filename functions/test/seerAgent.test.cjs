const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSeerTelemetry, buildSeerPrompt, normalizeSeerResult } = require("../src/seerAgent");

test("Seer accepts only bounded aggregate operations data", () => {
  const snapshot = normalizeSeerTelemetry({
    snapshotAgeSeconds: 36,
    agentExecutions: 220,
    errorRatePercent: 2.5,
    avgResponseTimeMs: 450,
    activeUsers24h: 18,
    checkinsLast7Days: 42,
    userId: "private-user-id",
    reflection: "private reflection",
    riskSignals: {
      warningCount: 3,
      criticalCount: 1,
      totalEvents: 4,
      dailyCounts: [{ date: "2026-10-12", count: 2 }],
    },
  });

  assert.deepEqual(snapshot, {
    snapshotAgeSeconds: 36,
    agentExecutions: 220,
    errorRatePercent: 2.5,
    avgResponseTimeMs: 450,
    activeUsers24h: 18,
    checkinsLast7Days: 42,
    riskSignals: {
      state: "available",
      warningCount: 3,
      criticalCount: 1,
      totalEvents: 4,
      dailyCounts: [{ date: "2026-10-12", count: 2 }],
    },
  });
});

test("Seer drops invalid values and limits dated trend history", () => {
  const snapshot = normalizeSeerTelemetry({
    agentExecutions: -1,
    errorRatePercent: "3",
    riskSignals: {
      dailyCounts: [
        { date: "2026-10-01", count: 1 },
        { date: "bad-date", count: 999 },
        ...Array.from({ length: 8 }, (_, index) => ({ date: `2026-10-${String(index + 2).padStart(2, "0")}`, count: index })),
      ],
    },
  });

  assert.equal(snapshot.agentExecutions, null);
  assert.equal(snapshot.errorRatePercent, null);
  assert.equal(snapshot.riskSignals.dailyCounts.length, 7);
  assert.ok(snapshot.riskSignals.dailyCounts.every((point) => point.date && Number.isFinite(point.count)));
});

test("Seer prompt makes evidence and privacy boundaries explicit", () => {
  const prompt = buildSeerPrompt(normalizeSeerTelemetry({ activeUsers24h: 10 }));
  assert.match(prompt, /aggregate-only/);
  assert.match(prompt, /Do not infer causes, member-level safety, clinical outcomes/);
  assert.doesNotMatch(prompt, /private reflection|private-user-id/);
});

test("Seer output is complete, bounded, and strips model-added fields", () => {
  const result = normalizeSeerResult({
    summary: "  A verified summary.  ",
    insights: ["First finding", "Second finding", "Third finding", "Fourth finding", " ".repeat(20)],
    nextCheck: "Refresh the error-rate snapshot.",
    riskLevel: "high",
    users: ["private-user-id"],
  });

  assert.deepEqual(result, {
    summary: "A verified summary.",
    insights: ["First finding", "Second finding", "Third finding"],
    nextCheck: "Refresh the error-rate snapshot.",
  });
  assert.throws(() => normalizeSeerResult({ summary: "", insights: [], nextCheck: "none" }), { code: "INCOMPLETE_SEER_RESULT" });
});

test("Seer keeps a useful partial answer when optional model fields are omitted", () => {
  assert.deepEqual(normalizeSeerResult({ summary: "The snapshot is current, but trend evidence is limited." }), {
    summary: "The snapshot is current, but trend evidence is limited.",
    insights: [],
    nextCheck: "No additional check is supported by the returned evidence.",
  });
});
