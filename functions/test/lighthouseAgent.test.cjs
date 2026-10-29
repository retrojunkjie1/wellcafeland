const assert = require("node:assert/strict");
const { test } = require("node:test");
const { EARLY_CUES, normalizeLighthouseRequest, buildLighthousePrompt, normalizeLighthouseResult } = require("../src/lighthouseAgent");

test("Lighthouse accepts only one fixed client-selected cue", () => {
  assert.equal(EARLY_CUES.size, 6);
  assert.deepEqual(normalizeLighthouseRequest({ cue: "urge-building", privateText: "ignored" }), { cue: "urge-building" });
  assert.throws(() => normalizeLighthouseRequest({ cue: "high-risk", message: "infer danger" }), { code: "INVALID_LIGHTHOUSE_CUE" });
});

test("Lighthouse prompt is optional support, not monitoring or risk prediction", () => {
  const prompt = buildLighthousePrompt({ cue: "body-tense" });
  assert.match(prompt, /notice tension in their body/);
  assert.match(prompt, /Do not monitor, infer, score, diagnose, predict escalation/);
  assert.match(prompt, /optional, immediately available stabilizing choice/);
  assert.doesNotMatch(prompt, /private journal|user history/i);
});

test("Lighthouse result requires bounded, complete fields", () => {
  const result = normalizeLighthouseResult({ reflection: "  A small cue. ", option: "A choice.", supportStep: "Ask someone you trust.", extra: "discard" });
  assert.deepEqual(result, { reflection: "A small cue.", option: "A choice.", supportStep: "Ask someone you trust." });
  assert.throws(() => normalizeLighthouseResult({ reflection: "", option: "choice", supportStep: "step" }), { code: "INVALID_LIGHTHOUSE_OUTPUT" });
});
