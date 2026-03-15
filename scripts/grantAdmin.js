const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const EMAIL = "aleggi007@gmail.com";

async function grantAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(EMAIL);

    // Set custom claims (God's Eye)
    await admin.auth().setCustomUserClaims(user.uid, {
      role: "admin",
      superadmin: true,
      godEye: true
    });

    // Sync Firestore role (UI + queries)
    const db = admin.firestore();
    await db.collection("users").doc(user.uid).set(
      {
        email: EMAIL,
        role: "admin",
        superadmin: true,
        godEye: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    console.log("✅ Admin access granted to:", EMAIL);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to grant admin:", err);
    process.exit(1);
  }
}

grantAdmin();

