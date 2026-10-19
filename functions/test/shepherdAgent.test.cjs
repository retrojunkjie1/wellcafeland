const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeShepherdRequest, buildShepherdPrompt } = require("../src/shepherdAgent");

test("Shepherd accepts only a user-selected connection preference", () => {
  assert.deepEqual(normalizeShepherdRequest({ preference: "browse_first" }), { preference: "browse_first" });
  assert.throws(() => normalizeShepherdRequest({ preference: "lonely" }), { code: "INVALID_SHEPHERD_PREFERENCE" });
});

test("Shepherd prompt uses the selected preference and avoids inferred isolation", () => {
  const prompt = buildShepherdPrompt({ preference: "trusted_person" });
  assert.match(prompt, /consider connecting with one trusted person/);
  assert.match(prompt, /Do not assume loneliness, isolation, readiness, safety/);
  assert.match(prompt, /Do not identify available people, promise that a group is active, or join\/contact anyone/);
});
