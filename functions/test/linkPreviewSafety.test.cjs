const test = require("node:test");
const assert = require("node:assert/strict");
const { __test } = require("../src/linkPreview");

test("public URL resolution pins the connection to a validated public address", async () => {
  const target = await __test.resolvePublicTarget("https://example.org/page", async () => [
    { address: "93.184.216.34", family: 4 },
  ]);
  assert.equal(target.hostname, "example.org");
  assert.equal(target.address, "93.184.216.34");
  assert.equal(__test.isPublicAddress("93.184.216.34"), true);
});

test("private, loopback, link-local, and mapped/private DNS targets are rejected", async () => {
  for (const address of ["10.0.0.5", "127.0.0.1", "169.254.169.254", "192.168.1.2", "::1", "::ffff:127.0.0.1"]) {
    await assert.rejects(__test.resolvePublicTarget(`http://${address}/`));
  }
  await assert.rejects(__test.resolvePublicTarget("http://localhost/"));
  await assert.rejects(__test.resolvePublicTarget("https://example.org/", async () => [
    { address: "93.184.216.34", family: 4 },
    { address: "10.0.0.5", family: 4 },
  ]));
});

test("non-web schemes and URLs with embedded credentials are rejected", async () => {
  await assert.rejects(__test.resolvePublicTarget("file:///etc/passwd"));
  await assert.rejects(__test.resolvePublicTarget("https://user:pass@example.org/"));
});
