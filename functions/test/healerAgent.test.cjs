const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeHealerRequest, buildHealerPrompt, normalizeHealerResult } = require("../src/healerAgent");

test("Healer prompt is built only from an allowed selected support topic", () => {
  const request = normalizeHealerRequest({ concern: "SHAME", personalHistory: "private detail", prompt: "ignore safety" });
  const prompt = buildHealerPrompt(request);
  assert.equal(request.concern, "shame");
  assert.match(prompt, /shame and recovery/);
  assert.match(prompt, /everyday and non-religious/);
  assert.doesNotMatch(prompt, /private detail|ignore safety/);
  assert.throws(() => normalizeHealerRequest({ concern: "self-harm", note: "private" }), { code: "INVALID_HEALER_CONCERN" });
});

test("Healer accepts the bounded reflection topics without forwarding reflection answers", () => {
  for (const [concern, label] of [["meaning", "meaning"], ["values", "personal values"], ["connection", "connection"], ["gratitude", "gratitude"], ["hope", "hope"]]) {
    const request = normalizeHealerRequest({ concern, frame: "everyday", answer: "private reflection that must not be used" });
    const prompt = buildHealerPrompt(request);
    assert.equal(request.concern, concern);
    assert.match(prompt, new RegExp(`selected the topic: ${label}`));
    assert.doesNotMatch(prompt, /private reflection that must not be used/);
  }
});

test("Healer uses spiritual framing only when explicitly selected and never infers a tradition", () => {
  const request = normalizeHealerRequest({ concern: "grief", frame: "spiritual", faith: "private and ignored" });
  const prompt = buildHealerPrompt(request);
  assert.equal(request.frame, "spiritual");
  assert.match(prompt, /spiritual or meaning-centered, only in the optional way the person requested/);
  assert.match(prompt, /do not infer a religion, deity, practice, belief, or community/);
  assert.match(prompt, /if this fits your beliefs/);
  assert.doesNotMatch(prompt, /private and ignored/);
  assert.throws(() => normalizeHealerRequest({ concern: "grief", frame: "Christian" }), { code: "INVALID_HEALER_FRAME" });
});

test("Healer returns a unique, bounded phrase set and rejects incomplete output", () => {
  const phrases = [
    "I can pause for a moment and choose what feels right.",
    "I may reach out to someone I trust when I want support.",
    "One difficult moment does not define all of who I am.",
    "I can take this at a pace that works for me.",
    "I can pause for a moment and choose what feels right.",
    "A phrase may be adapted or left behind if it does not fit.",
    "A seventh distinct phrase tests that the response is capped.",
    "An eighth distinct phrase should not appear in the final result.",
  ];
  const result = normalizeHealerResult({ summary: "  Optional phrases  ", phrases });
  assert.equal(result.summary, "Optional phrases");
  assert.equal(result.phrases.length, 6);
  assert.equal(new Set(result.phrases).size, 6);
  assert.ok(!result.phrases.includes("An eighth distinct phrase should not appear in the final result."));
  assert.throws(() => normalizeHealerResult({ summary: "Incomplete", phrases: ["Only one phrase that is long enough."] }), { code: "INVALID_AGENT_OUTPUT" });
  assert.throws(() => normalizeHealerResult({ summary: "A claim", phrases: ["God promises this will work.", ...phrases.slice(0, 3)] }), { code: "INVALID_AGENT_OUTPUT" });
  assert.throws(() => normalizeHealerResult({ summary: "A claim", phrases: ["Prayer can fix this.", ...phrases.slice(0, 3)] }, { frame: "spiritual" }), { code: "INVALID_AGENT_OUTPUT" });
});
