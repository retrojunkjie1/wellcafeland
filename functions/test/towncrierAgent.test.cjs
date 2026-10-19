const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeTowncrierRequest,
  buildTowncrierPrompt,
  normalizeTowncrierResult,
} = require("../src/towncrierAgent");

test("Towncrier accepts only known update types and audiences", () => {
  assert.deepEqual(normalizeTowncrierRequest({ updateType: "maintenance", audience: "practitioners" }), {
    updateType: "maintenance",
    audience: "practitioners",
  });
  assert.throws(() => normalizeTowncrierRequest({ updateType: "other", audience: "everyone" }), { code: "INVALID_TOWNCRIER_REQUEST" });
  assert.deepEqual(normalizeTowncrierRequest({ updateType: "feature", audience: "clients", details: "private data" }), {
    updateType: "feature",
    audience: "clients",
  });
});

test("Towncrier prompt is review-only and forbids invented release details", () => {
  const prompt = buildTowncrierPrompt({ updateType: "privacy", audience: "clients" });
  assert.match(prompt, /only confirmed context/i);
  assert.match(prompt, /Do not invent dates/i);
  assert.match(prompt, /published or delivered/i);
  assert.doesNotMatch(prompt, /private data/);
});

test("Towncrier bounds and validates the human-review draft", () => {
  assert.deepEqual(normalizeTowncrierResult({ title: "  Update  ", message: "  Hello  ", reviewNote: " Verify date " }), {
    title: "Update",
    message: "Hello",
    reviewNote: "Verify date",
  });
  assert.equal(normalizeTowncrierResult({ title: "t".repeat(120), message: "m".repeat(600), reviewNote: "r".repeat(300) }).title.length, 100);
  assert.throws(() => normalizeTowncrierResult({ title: "Incomplete" }), { code: "INVALID_AGENT_OUTPUT" });
});
