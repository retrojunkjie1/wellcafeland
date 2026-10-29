const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeStewardRequest,
  buildStewardPrompt,
  normalizeStewardResult,
} = require("../src/stewardAgent");

test("Steward accepts only a fixed privacy topic and strips all other input", () => {
  assert.deepEqual(normalizeStewardRequest({ topicId: "sharing", privateRecord: "secret" }), {
    topicId: "sharing",
    label: "Practitioner access",
    facts: "A practitioner does not receive check-ins just because the client has an account. The client can review what each connected practitioner is allowed to see in Practitioner sharing settings.",
  });
  assert.throws(() => normalizeStewardRequest({ topicId: "private-records" }), { code: "INVALID_STEWARD_TOPIC" });
});

test("Steward prompt limits answers to verified product facts and avoids compliance guarantees", () => {
  const prompt = buildStewardPrompt(normalizeStewardRequest({ topicId: "retention" }));
  assert.match(prompt, /automatic timed deletion is not available yet/i);
  assert.match(prompt, /Do not make legal, HIPAA, confidentiality, retention, or security guarantees/i);
  assert.match(prompt, /Do not claim that you inspected the user's account/i);
});

test("Steward bounds the explanation and rejects incomplete output", () => {
  assert.deepEqual(normalizeStewardResult({ answer: "  Check your sharing choices.  " }), { answer: "Check your sharing choices." });
  assert.equal(normalizeStewardResult({ answer: "a".repeat(800) }).answer.length, 700);
  assert.throws(() => normalizeStewardResult({ answer: " " }), { code: "INVALID_AGENT_OUTPUT" });
});
