const test = require("node:test");
const assert = require("node:assert/strict");
const { getResolvedOpenAIKey, isPlaceholderKey } = require("../openaiKey");

test("resolves a configured OpenAI key only from the bound environment variable", () => {
  assert.deepEqual(getResolvedOpenAIKey({ OPENAI_API_KEY: "sk-live-test-key-value" }), {
    key: "sk-live-test-key-value",
    source: "OPENAI_API_KEY",
  });
});

test("reports missing or sample keys as unconfigured", () => {
  assert.deepEqual(getResolvedOpenAIKey({}), { key: null, source: "none" });
  assert.deepEqual(getResolvedOpenAIKey({ OPENAI_API_KEY: "your-openai-api-key" }), { key: null, source: "none" });
  assert.equal(isPlaceholderKey("xxx"), true);
});
