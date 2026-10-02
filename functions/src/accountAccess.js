const { HttpsError } = require("firebase-functions/v2/https");

/**
 * Enforce the email-verification boundary in callable handlers, not only in
 * the browser router. App Check attests the app instance; it does not prove
 * that the account email was verified.
 */
function requireVerifiedAccount(request, action = "continue") {
  const auth = request?.auth;
  if (!auth?.uid || auth.token?.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to continue.");
  }
  if (auth.token?.email_verified !== true) {
    throw new HttpsError("failed-precondition", `Verify your email before you ${action}.`);
  }
  return auth.uid;
}

module.exports = { requireVerifiedAccount };
