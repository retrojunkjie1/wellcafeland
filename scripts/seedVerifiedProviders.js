// scripts/seedVerifiedProviders.js
// Seed verified providers into Firestore (admin-only, dev/staging)

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Load seed data from JSON file
 */
function loadSeedData() {
  const seedPath = path.join(__dirname, "../seed/verified_seed_v1.json");
  const rawData = fs.readFileSync(seedPath, "utf8");
  return JSON.parse(rawData);
}

/**
 * Seed verified providers into Firestore
 */
async function seedVerifiedProviders(confirmCode = null) {
  // Safety check: require confirmation code in production
  const isProduction = process.env.NODE_ENV === "production" || 
                       process.env.GCLOUD_PROJECT?.includes("prod");
  
  if (isProduction && confirmCode !== "CONFIRM_PRODUCTION_SEED_2025") {
    throw new Error("Production seed requires confirmation code. Set confirmCode parameter.");
  }

  try {
    const seedData = loadSeedData();
    console.log(`[Seed] Loading ${seedData.length} verified providers...`);

    const batch = db.batch();
    const colRef = db.collection("realHelpProviders");
    let count = 0;

    for (const item of seedData) {
      // Check if provider already exists (by name + phone hash)
      const existingQuery = await colRef
        .where("name", "==", item.name)
        .where("phone", "==", item.phone || "")
        .limit(1)
        .get();

      if (!existingQuery.empty) {
        console.log(`[Seed] Skipping existing: ${item.name}`);
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

      // Firestore batch limit is 500, commit and start new batch if needed
      if (count >= 500) {
        await batch.commit();
        console.log(`[Seed] Committed batch of ${count} providers`);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`[Seed] Committed final batch of ${count} providers`);
    }

    console.log(`[Seed] Successfully seeded ${seedData.length} verified providers`);
    return { success: true, count: seedData.length };
  } catch (error) {
    console.error("[Seed] Error:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const confirmCode = process.argv[2] || null;
  seedVerifiedProviders(confirmCode)
    .then((result) => {
      console.log("Seed complete:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

module.exports = { seedVerifiedProviders };

