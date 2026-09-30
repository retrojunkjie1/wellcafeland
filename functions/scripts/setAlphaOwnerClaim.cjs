#!/usr/bin/env node
const admin = require("firebase-admin");

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function main() {
  const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "";
  if (projectId !== "wellnesscafelanding") {
    throw new Error("No change made. Select the intended Firebase project first by setting GCLOUD_PROJECT=wellnesscafelanding.");
  }
  const email = normalizeEmail(process.argv[2]);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: node scripts/setAlphaOwnerClaim.cjs <verified-owner-email>");
  }
  if (normalizeEmail(process.env.CONFIRM_ALPHA_OWNER_EMAIL) !== email) {
    throw new Error("No change made. Set CONFIRM_ALPHA_OWNER_EMAIL to the exact target email to confirm this root-access change.");
  }

  if (!admin.apps.length) admin.initializeApp({ projectId, credential: admin.credential.applicationDefault() });
  let user;
  try {
    user = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found") throw new Error("No Firebase Authentication account uses that email.");
    throw error;
  }
  if (user.disabled) throw new Error("No change made. The target account is disabled.");
  if (!user.emailVerified) throw new Error("No change made. Verify this account's email before setting the Alpha Owner claim.");

  const existingClaims = user.customClaims || {};
  await admin.auth().setCustomUserClaims(user.uid, { ...existingClaims, godAdmin: true });
  const confirmed = await admin.auth().getUser(user.uid);
  if (confirmed.customClaims?.godAdmin !== true) throw new Error("Firebase did not confirm the Alpha Owner claim.");
  console.log(`Alpha Owner claim confirmed for ${confirmed.email}. No credential or claim values were printed.`);
  console.log("Sign out and back in, or refresh the ID token, then open /admin/roles.");
}

main().catch((error) => {
  console.error(`[Alpha Owner setup] ${error.message || "The claim could not be set."}`);
  process.exitCode = 1;
}).finally(async () => {
  if (admin.apps.length) await admin.app().delete();
});
