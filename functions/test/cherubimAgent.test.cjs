const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MAX_CONTENT_LENGTH,
  normalizeCherubimRequest,
  buildCherubimPrompt,
  normalizeCherubimResult,
} = require("../src/cherubimAgent");

test("Cherubim receives only bounded proposed message content", () => {
  const request = normalizeCherubimRequest({
    content: "  A peer-support message  ",
    userId: "private-account-id",
    threadId: "private-thread-id",
    history: "private history",
  });
  assert.deepEqual(request, { content: "A peer-support message" });
  assert.match(buildCherubimPrompt(request), /A peer-support message/);
  assert.doesNotMatch(buildCherubimPrompt(request), /private-account-id|private-thread-id|private history/);
});

test("Cherubim rejects empty and oversized content", () => {
  assert.throws(() => normalizeCherubimRequest({ content: " " }), { code: "INVALID_CHERUBIM_CONTENT" });
  assert.throws(() => normalizeCherubimRequest({ content: "x".repeat(MAX_CONTENT_LENGTH + 1) }), { code: "CHERUBIM_CONTENT_TOO_LONG" });
});

test("Cherubim accepts only coherent, bounded moderation decisions", () => {
  assert.deepEqual(normalizeCherubimResult({ safe: true, category: "allowed", reason: "ignored", suggestion: "ignored" }), {
    safe: true, category: "allowed", reason: "", suggestion: "",
  });
  assert.deepEqual(normalizeCherubimResult({ safe: false, category: "targeted_harassment", reason: "x".repeat(300), suggestion: "y".repeat(400) }), {
    safe: false, category: "targeted_harassment", reason: "x".repeat(160), suggestion: "y".repeat(240),
  });
  assert.throws(() => normalizeCherubimResult({ safe: "false", category: "allowed" }), { code: "INVALID_CHERUBIM_OUTPUT" });
  assert.throws(() => normalizeCherubimResult({ safe: true, category: "other_safety_concern" }), { code: "INVALID_CHERUBIM_OUTPUT" });
});
