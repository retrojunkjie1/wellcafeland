/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

async function main() {
  const email = process.argv[2] || process.env.TARGET_EMAIL;
  if (!email) {
    console.error("Usage: npm run grant:admin -- <email>  OR set TARGET_EMAIL");
    process.exit(1);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "wellnesscafelanding";
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credPath) {
    console.error("❌ GOOGLE_APPLICATION_CREDENTIALS is not set.");
    console.error("");
    console.error("To fix (for zsh/bash):");
    console.error("");
    console.error("  1. Ensure your service account JSON file is in .secrets/");
    console.error("     Example: .secrets/wc-admin.json");
    console.error("");
    console.error("  2. Export the environment variable:");
    console.error("     export GOOGLE_APPLICATION_CREDENTIALS=\"$PWD/.secrets/wc-admin.json\"");
    console.error("");
    console.error("  3. (Optional) Set project ID:");
    console.error("     export FIREBASE_PROJECT_ID=\"wellnesscafelanding\"");
    console.error("");
    console.error("  4. Run the script:");
    console.error("     npm run grant:admin --", email || "<email>");
    console.error("");
    console.error("To make this permanent, add to ~/.zshrc or ~/.bashrc:");
    console.error("  export GOOGLE_APPLICATION_CREDENTIALS=\"$HOME/path/to/.secrets/wc-admin.json\"");
    process.exit(1);
  }

  const abs = path.isAbsolute(credPath) ? credPath : path.join(process.cwd(), credPath);
  if (!fs.existsSync(abs)) {
    console.error(`❌ Service account file not found: ${abs}`);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(abs, "utf8"));

  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  }

  console.log("🔍 Granting admin…");
  console.log(`   Project: ${projectId}`);
  console.log(`   Email:   ${email}`);

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true, role: "admin" });

  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("users").doc(user.uid).set(
    {
      email: user.email || email,
      role: "admin",
      isAdmin: true,
      adminGrantedAt: now,
    },
    { merge: true }
  );

  await db.collection("roles").doc(user.uid).set(
    {
      email: user.email || email,
      admin: true,
      role: "admin",
      updatedAt: now,
    },
    { merge: true }
  );

  console.log(`✅ Granted admin to ${email} (uid: ${user.uid})`);
  console.log("ℹ️ User must sign out/in (or refresh token) to receive claims immediately.");
}

main().catch((e) => {
  console.error("❌ Failed to grant admin:", e);
  process.exit(1);
});
