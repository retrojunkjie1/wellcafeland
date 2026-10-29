const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeTranslatorRequest, buildTranslatorPrompt } = require("../src/translatorAgent");

test("Translator accepts only a catalog topic and supported language", () => {
  const request = normalizeTranslatorRequest({ topicId: "cravings-and-urges", language: "es" });
  assert.equal(request.languageLabel, "Spanish");
  assert.match(request.sourceText, /not a moral failure/);
  assert.throws(() => normalizeTranslatorRequest({ topicId: "private-note", language: "es" }), { code: "INVALID_TRANSLATOR_TOPIC" });
  assert.throws(() => normalizeTranslatorRequest({ topicId: "sleep-and-recovery", language: "xx" }), { code: "INVALID_TRANSLATOR_LANGUAGE" });
});

test("Translator prompt requests a faithful translation without added advice", () => {
  const request = normalizeTranslatorRequest({ topicId: "self-compassion", language: "fr" });
  const prompt = buildTranslatorPrompt(request);
  assert.match(prompt, /clear, natural French/);
  assert.match(prompt, /Do not add medical advice, diagnosis, treatment claims/);
  assert.match(prompt, /responsible for protecting/);
});
