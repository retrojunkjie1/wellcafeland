const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizePulseSnapshot, buildPulsePrompt } = require("../src/pulseAgent");

test("Pulse only receives whitelisted aggregate health and latency metrics", () => {
  const snapshot = normalizePulseSnapshot({
    systemHealth: "degraded",
    agentExecutions: 18,
    errorRate: 2.5,
    avgResponseTime: 650,
    users: [{ uid: "private-user" }],
    reflections: "private text",
  }, 12);

  assert.deepEqual(snapshot, {
    systemHealth: "degraded",
    agentExecutions: 18,
    errorRatePercent: 2.5,
    averageResponseMs: 650,
    snapshotAgeSeconds: 12,
  });
  const prompt = buildPulsePrompt(snapshot);
  assert.doesNotMatch(prompt, /private-user|private text|reflections|users/);
});

test("Pulse treats missing, invalid, and stale observations as unknown", () => {
  assert.deepEqual(normalizePulseSnapshot({
    systemHealth: "made_up",
    agentExecutions: null,
    errorRate: "not a number",
    avgResponseTime: -1,
  }, 61), {
    systemHealth: "stale",
    agentExecutions: null,
    errorRatePercent: null,
    averageResponseMs: null,
    snapshotAgeSeconds: 61,
  });
});
