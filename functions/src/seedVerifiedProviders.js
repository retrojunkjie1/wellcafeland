// functions/src/seedVerifiedProviders.js
// Callable function to seed verified providers (admin-only)

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const db = admin.firestore();

/**
 * Load seed data from JSON file (deployed with functions)
 */
function loadSeedData() {
  try {
    // In Cloud Functions, file is in the deployed functions directory
    const seedPath = path.join(__dirname, "../../seed/verified_seed_v1.json");
    const rawData = fs.readFileSync(seedPath, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    // Fallback: return minimal seed data if file not found
    console.warn("[Seed] Seed file not found, using fallback data");
    return [
      {
        name: "988 Suicide & Crisis Lifeline",
        category: "crisis",
        phone: "988",
        address: "Dial 988",
        state: "US",
        website: "https://988lifeline.org",
        tags: ["crisis", "24/7", "phone", "national"],
        regionKey: "US-National",
        verification: {
          status: "verified",
          source: "staff",
          verifiedBy: "system",
        },
        publicNotes: "National 24/7 suicide and crisis lifeline. Dial 988.",
      },
    ];
  }
}

/**
 * Seed verified providers (callable function)
 */
async function seedVerifiedProviders(data, context) {
  // Admin-only
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
  }

  const userRecord = await admin.auth().getUser(context.auth.uid);
  const claims = userRecord.customClaims || {};
  if (!claims.admin) {
    throw new functions.https.HttpsError("permission-denied", "Admin access required");
  }

  // Safety check: require confirmation in production
  const isProduction = process.env.GCLOUD_PROJECT?.includes("prod") || 
                       process.env.NODE_ENV === "production";
  const confirmCode = data?.confirmCode;

  if (isProduction && confirmCode !== "CONFIRM_PRODUCTION_SEED_2025") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Production seed requires confirmation code: CONFIRM_PRODUCTION_SEED_2025"
    );
  }

  try {
    const seedData = loadSeedData();
    console.log(`[Seed] Loading ${seedData.length} verified providers...`);

    let batch = db.batch();
    const colRef = db.collection("realHelpProviders");
    let count = 0;
    let skipped = 0;

    for (const item of seedData) {
      // Check if provider already exists
      const existingQuery = await colRef
        .where("name", "==", item.name)
        .where("phone", "==", item.phone || "")
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        skipped++;
        continue;
      }

      const docRef = colRef.doc();
      const docData = {
        name: item.name || "",
        type: item.type || item.category || "information",
        category: item.category || "information",
        subtype: item.subtype || null,
        phone: item.phone || "",
        email: item.email || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        zip: item.zip || "",
        website: item.website || "",
        tags: Array.isArray(item.tags) ? item.tags : [],
        regionKey: item.regionKey || "",
        verification: {
          status: item.verification?.status || "verified",
          source: item.verification?.source || "staff",
          verifiedAt: item.verification?.verifiedAt 
            ? admin.firestore.Timestamp.fromDate(new Date(item.verification.verifiedAt))
            : admin.firestore.FieldValue.serverTimestamp(),
          verifiedBy: item.verification?.verifiedBy || "system",
        },
        publicNotes: item.publicNotes || "",
        internalNotes: item.internalNotes || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(docRef, docData);
      count++;

      if (count >= 500) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    return {
      success: true,
      seeded: seedData.length,
      skipped,
      added: seedData.length - skipped,
    };
  } catch (error) {
    console.error("[Seed] Error:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
}

module.exports = { seedVerifiedProviders };

