const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeOverseerRequest, buildOverseerPrompt, normalizeOverseerResult } = require("../src/overseerAgent");

test("Overseer accepts only fixed review goals and allowlisted aggregate metrics", () => {
  const result = normalizeOverseerRequest({
    goal: "agent-health",
    state: {
      snapshotAgeSeconds: 40,
      agentExecutions: 12,
      errorRatePercent: 2,
      avgResponseTimeMs: 700,
      enabledHandlers: 25,
      implementedHandlers: 25,
      riskSignals: { warningCount: 1, criticalCount: 0, totalEvents: 1 },
      reviewQueues: { practitioner: 3, communityGivers: 1, meetingSources: 0 },
      userId: "private-id",
      healthRecord: "must not pass",
    },
  });

  assert.deepEqual(result, {
    goal: "agent-health",
    snapshotAgeSeconds: 40,
    agentExecutions: 12,
    errorRatePercent: 2,
    avgResponseTimeMs: 700,
    enabledHandlers: 25,
    implementedHandlers: 25,
    riskSignals: { state: "available", warningCount: 1, criticalCount: 0, totalEvents: 1 },
    reviewQueues: { practitioner: 3, communityGivers: 1, meetingSources: 0 },
  });
  assert.throws(() => normalizeOverseerRequest({ goal: "send-announcement", state: {} }), { code: "INVALID_OVERSEER_GOAL" });
  assert.throws(() => normalizeOverseerRequest({ goal: "agent-health", state: "raw" }), { code: "INVALID_OVERSEER_SNAPSHOT" });
});

test("Overseer prompt makes stale-data and no-clinical-inference constraints explicit", () => {
  const prompt = buildOverseerPrompt(normalizeOverseerRequest({ goal: "signal-review", state: { riskSignals: { state: "paused" } } }));
  assert.match(prompt, /verified aggregate snapshot/);
  assert.match(prompt, /measurements are stale, paused, unavailable, or missing/);
  assert.match(prompt, /Do not infer member safety, clinical outcomes/);
  assert.doesNotMatch(prompt, /private-id|health record/i);
});

test("Overseer output is complete, bounded, and strips model-added fields", () => {
  const result = normalizeOverseerResult({
    summary: "Check current operations health.",
    steps: ["Refresh the handler snapshot.", "Review the latest event counts.", "Confirm the time window.", "Fourth step"],
    evidenceLimit: "This snapshot does not establish future availability.",
    userId: "private-id",
  });
  assert.deepEqual(result, {
    summary: "Check current operations health.",
    steps: ["Refresh the handler snapshot.", "Review the latest event counts.", "Confirm the time window."],
    evidenceLimit: "This snapshot does not establish future availability.",
  });
  assert.throws(() => normalizeOverseerResult({}), { code: "INCOMPLETE_OVERSEER_RESULT" });
});
