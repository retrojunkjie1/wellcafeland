const assert = require("node:assert/strict");
const { test } = require("node:test");
const { normalizeWitnessRequest, buildMetricSnapshot, buildPracticeSnapshot } = require("../src/witnessAgent");

test("Witness accepts only a bounded client identifier", () => {
  assert.deepEqual(normalizeWitnessRequest({ clientId: " client-1 " }), { clientId: "client-1" });
  for (const clientId of ["", "a/b", "x".repeat(161), null]) {
    assert.throws(() => normalizeWitnessRequest({ clientId }), (error) => error.code === "INVALID_WITNESS_CLIENT");
  }
});

test("Witness returns only first/latest numeric check-in facts for explicitly shared scopes", () => {
  const result = buildMetricSnapshot([
    { date: "2026-10-12", cravingIntensity: 4, stress: 3, journal: "private words" },
    { date: "2026-10-09", cravingIntensity: 6, stress: 5 },
    { date: "2026-10-01", cravingIntensity: 7, stress: 8 },
  ], { recoveryProgress: true, wellnessPatterns: false });
  assert.deepEqual(result, [{
    label: "Craving intensity", first: 7, latest: 4, change: -3,
    firstDate: "2026-10-01", latestDate: "2026-10-12", entries: 3,
  }]);
  assert.equal(JSON.stringify(result).includes("private words"), false);
});

test("Witness aggregates fixed practice outcomes and excludes notes and malformed records", () => {
  const records = [
    { data: () => ({ toolId: "breathing", outcome: "tried", note: "private detail" }) },
    { data: () => ({ toolId: "breathing", outcome: "not-yet" }) },
    { data: () => ({ toolId: "../../private", outcome: "tried" }) },
    { data: () => ({ toolId: "grounding", outcome: "invented" }) },
  ];
  const result = buildPracticeSnapshot(records);
  assert.deepEqual(result, [{ toolId: "breathing", tried: 1, notYet: 1, notFit: 0, preferNot: 0 }]);
  assert.equal(JSON.stringify(result).includes("private detail"), false);
});
