const test = require("node:test");
const assert = require("node:assert/strict");

let main;
test("the model verifier ignores API credentials loaded from files", async () => {
  ({ main } = await import("../scripts/verifyFireworksModels.mjs"));
  let requestCount = 0;

  const exitCode = await main({
    env: {},
    modelEnv: {
      FIREWORKS_API_KEY: "file-secret-must-not-be-used",
      FIREWORKS_MODEL_CHAT: "accounts/example/models/chat",
      FIREWORKS_MODEL_REASONING: "accounts/example/models/reasoning",
    },
    fetchImpl: async () => { requestCount += 1; throw new Error("unexpected request"); },
  });

  assert.equal(exitCode, 4);
  assert.equal(requestCount, 0);
});

test("the verifier sends only the process environment credential to the fixed HTTPS API", async () => {
  let request;
  const exitCode = await main({
    env: { FIREWORKS_API_KEY: "environment-secret" },
    modelEnv: {
      FIREWORKS_MODEL_CHAT: "accounts/example/models/chat",
      FIREWORKS_MODEL_REASONING: "accounts/example/models/reasoning",
    },
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        json: async () => ({ data: [
          { id: "accounts/example/models/chat" },
          { id: "accounts/example/models/reasoning" },
        ] }),
      };
    },
  });

  assert.equal(exitCode, 0);
  assert.equal(request.url, "https://api.fireworks.ai/inference/v1/models");
  assert.equal(request.options.headers.Authorization, "Bearer environment-secret");
});
