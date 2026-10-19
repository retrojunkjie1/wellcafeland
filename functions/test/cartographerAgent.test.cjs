const assert = require("node:assert/strict");
const { test } = require("node:test");
const {
  MAP_CHOICES,
  normalizeCartographerRequest,
  buildCartographerPrompt,
  normalizeCartographerResult,
} = require("../src/cartographerAgent");

test("Cartographer accepts only bounded, allowlisted selections", () => {
  const request = normalizeCartographerRequest({
    situations: ["uncertainty"],
    helps: ["one_step", "quiet"],
    avoid: [],
    journal: "private text must not be accepted",
  });
  assert.deepEqual(request, { situations: ["uncertainty"], helps: ["one_step", "quiet"], avoid: [] });
  for (const bad of [
    { situations: [], helps: ["quiet"], avoid: [] },
    { situations: ["uncertainty"], helps: [], avoid: [] },
    { situations: ["diagnosis"], helps: ["quiet"], avoid: [] },
    { situations: ["uncertainty", "uncertainty"], helps: ["quiet"], avoid: [] },
    { situations: ["uncertainty"], helps: ["quiet"], avoid: ["invented"] },
    { situations: ["uncertainty"], helps: ["quiet", "quiet"], avoid: [] },
  ]) assert.throws(() => normalizeCartographerRequest(bad), { code: "INVALID_CARTOGRAPHER_CHOICES" });
  assert.equal(Object.keys(MAP_CHOICES.situations).length, 6);
});

test("Cartographer prompt limits the map to chosen preferences and avoids diagnosis", () => {
  const prompt = buildCartographerPrompt({ situations: ["low_energy"], helps: ["one_step"], avoid: ["forced_positivity"] });
  assert.match(prompt, /low energy or exhaustion/);
  assert.match(prompt, /one small practical step/);
  assert.match(prompt, /forced positivity/);
  assert.match(prompt, /not evidence of a diagnosis/);
  assert.match(prompt, /only the selected labels/);
});

test("Cartographer drops model-added preferences and bounds its output", () => {
  const request = { situations: ["uncertainty"], helps: ["quiet"], avoid: ["long_explanations"] };
  const result = normalizeCartographerResult({
    overview: "  " + "x".repeat(500),
    helpfulSupports: ["quiet and less input", "unselected support"],
    avoid: ["long explanations", "diagnostic assumption"],
    firstStep: "model-invented action should be ignored",
  }, request);
  assert.equal(result.overview.length, 300);
  assert.deepEqual(result.helpfulSupports, ["quiet and less input"]);
  assert.deepEqual(result.avoid, ["long explanations"]);
  assert.equal(result.firstStep, "One option you chose: quiet and less input. You can use it or ignore it.");
});
