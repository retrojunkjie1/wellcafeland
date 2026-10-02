const assert = require("node:assert/strict");
const { test } = require("node:test");
const { requireVerifiedAccount } = require("../src/accountAccess");

test("verified-account guard accepts only a signed-in account with a verified email", () => {
  assert.equal(requireVerifiedAccount({
    auth: { uid: "member-1", token: { email_verified: true } },
  }, "request support"), "member-1");

  for (const request of [
    { auth: null },
    { auth: { uid: "guest", token: { firebase: { sign_in_provider: "anonymous" }, email_verified: true } } },
  ]) {
    assert.throws(() => requireVerifiedAccount(request), (error) => error.code === "unauthenticated");
  }

  for (const token of [{}, { email_verified: false }]) {
    assert.throws(
      () => requireVerifiedAccount({ auth: { uid: "unverified-member", token } }, "request support"),
      (error) => error.code === "failed-precondition" && /verify your email/i.test(error.message),
    );
  }
});
