const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeCompassRequest, buildCompassPrompt } = require("../src/compassAgent");

test("Compass accepts only bounded values and a selected practical move", () => {
  assert.deepEqual(normalizeCompassRequest({ values: ["Rest", "Connection"], selectedMove: "reach-someone" }), {
    values: ["Rest", "Connection"], selectedMove: "reach-someone",
  });
  assert.throws(() => normalizeCompassRequest({ values: ["Rest", "diagnosis"], selectedMove: "reach-someone" }), { code: "INVALID_COMPASS_VALUES" });
  assert.throws(() => normalizeCompassRequest({ values: [], selectedMove: "reach-someone" }), { code: "INVALID_COMPASS_VALUES" });
  assert.throws(() => normalizeCompassRequest({ values: ["Rest"], selectedMove: "contact-sponsor-now" }), { code: "INVALID_COMPASS_MOVE" });
});

test("Compass prompt uses only selected values and the mapped move", () => {
  const request = normalizeCompassRequest({ values: ["Rest"], selectedMove: "hands-busy" });
  const prompt = buildCompassPrompt(request);
  assert.match(prompt, /Values the person selected: Rest/);
  assert.match(prompt, /start a familiar, nearby task/);
  assert.match(prompt, /Do not infer urge severity, diagnosis, readiness, personal history, or safety/);
  assert.doesNotMatch(prompt, /private journal|free text/i);
});
