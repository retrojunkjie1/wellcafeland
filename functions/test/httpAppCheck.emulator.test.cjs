const { test } = require("node:test");
const assert = require("node:assert/strict");

const baseUrl = process.env.FUNCTIONS_EMULATOR_URL
  || "http://127.0.0.1:5001/demo-wellnesscafe-appcheck/us-central1";

test("Functions Emulator bypasses App Check only; chat still requires sign-in", async () => {
  const response = await fetch(`${baseUrl}/multimodalChat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "smoke test" }),
  });

  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.code, "AUTH_REQUIRED");
});
