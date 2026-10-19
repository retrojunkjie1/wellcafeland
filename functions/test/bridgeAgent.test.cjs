const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeBridgeRequest, buildBridgePrompt } = require("../src/bridgeAgent");

test("Bridge accepts only selected support category and contact method", () => {
  const request = normalizeBridgeRequest({ category: "housing", contactMethod: "phone", region: "private location", note: "private detail" });
  assert.deepEqual(request, { category: "housing", supportArea: "housing or a safe place", contactMethod: "phone" });
  const prompt = buildBridgePrompt(request);
  assert.match(prompt, /housing or a safe place/);
  assert.doesNotMatch(prompt, /private location|private detail/);
});

test("Bridge rejects emergency routing and arbitrary contact channels", () => {
  assert.throws(() => normalizeBridgeRequest({ category: "emergency", contactMethod: "phone" }), { code: "INVALID_BRIDGE_CATEGORY" });
  assert.throws(() => normalizeBridgeRequest({ category: "programs", contactMethod: "email" }), { code: "INVALID_BRIDGE_CONTACT_METHOD" });
});
