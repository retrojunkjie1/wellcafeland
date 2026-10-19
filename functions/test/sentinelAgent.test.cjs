const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeSentinelRequest, createSentinelRoute } = require("../src/sentinelAgent");

test("Sentinel accepts only a fixed explicit support choice and discards extra fields", () => {
  assert.deepEqual(normalizeSentinelRequest({ supportNeed: "need-a-person", message: "private text", clientId: "member-1" }), {
    supportNeed: "need-a-person",
  });
});

test("Sentinel rejects free-form or unknown choices", () => {
  assert.throws(() => normalizeSentinelRequest({ supportNeed: "tell-me-if-i-am-high-risk" }), {
    code: "INVALID_SENTINEL_SUPPORT_NEED",
  });
  assert.throws(() => normalizeSentinelRequest({ message: "I am in danger" }), {
    code: "INVALID_SENTINEL_SUPPORT_NEED",
  });
});

test("Sentinel route is a fixed human-support path, never a risk label or provider alert", () => {
  const result = createSentinelRoute(normalizeSentinelRequest({ supportNeed: "immediate-danger" }));
  assert.equal(result.resourcePath, "/resources?type=hotlines");
  assert.match(result.nextStep, /call 911/i);
  assert.equal("riskLevel" in result, false);
  assert.equal("providerAlert" in result, false);
});
