// src/utils/seedRealHelpData.js
// Utility to seed sample Real Help data for development and testing

import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Sample housing providers data
 */
const SAMPLE_HOUSING = [
  {
    name: "Serenity House Recovery",
    type: "sober_home",
    region: "California",
    cost_range: "$800-1200/month",
    insurance: ["Medi-Cal", "Private Pay"],
    capacity_status: "open",
    contact: {
      phone: "(555) 123-4567",
      email: "info@serenityhouse.example",
    },
    website: "https://example.com/serenity",
    description: "A peaceful sober living environment with 24/7 support, life skills training, and recovery-focused community activities.",
    tags: ["sober living", "peer support", "life skills"],
    curated: true,
    createdAt: new Date(),
  },
  {
    name: "New Beginnings Transitional Housing",
    type: "transitional",
    region: "California",
    cost_range: "$500-800/month",
    insurance: ["Section 8", "Vouchers"],
    capacity_status: "waitlist",
    contact: {
      phone: "(555) 234-5678",
      email: "intake@newbeginnings.example",
    },
    website: "https://example.com/newbeginnings",
    description: "Transitional housing program offering 6-12 month stays with case management, job training, and recovery support.",
    tags: ["transitional", "case management", "employment"],
    curated: true,
    createdAt: new Date(),
  },
  {
    name: "Hope Haven Emergency Shelter",
    type: "emergency",
    region: "California",
    cost_range: "Free",
    insurance: [],
    capacity_status: "open",
    contact: {
      phone: "(555) 345-6789",
      email: "shelter@hopehaven.example",
    },
    website: "https://example.com/hopehaven",
    description: "Emergency shelter providing immediate housing, meals, and connection to long-term resources. No appointment needed.",
    tags: ["emergency", "immediate", "meals included"],
    curated: true,
    createdAt: new Date(),
  },
];

/**
 * Sample grants and funding data
 */
const SAMPLE_GRANTS = [
  {
    name: "SAMHSA Treatment Grant Program",
    region: "Nationwide",
    description: "Federal grants for substance abuse treatment covering detox, residential, and outpatient programs. Income-based eligibility.",
    contact: {
      phone: "1-800-662-4357",
      website: "https://www.samhsa.gov",
    },
    website: "https://www.samhsa.gov/find-help",
    tags: ["federal", "treatment", "income-based"],
    curated: true,
  },
  {
    name: "California Addiction Treatment Scholarship",
    region: "California",
    description: "State-funded scholarships for California residents seeking addiction treatment. Covers up to 90 days of residential care.",
    contact: {
      phone: "(916) 555-1234",
      email: "grants@catreatment.example",
    },
    website: "https://example.com/ca-scholarship",
    tags: ["state", "residential", "scholarship"],
    curated: true,
  },
  {
    name: "Recovery Foundation Emergency Fund",
    region: "Nationwide",
    description: "Emergency financial assistance for individuals in early recovery. Covers rent, utilities, and basic needs up to $2,000.",
    contact: {
      email: "emergency@recoveryfoundation.example",
    },
    website: "https://example.com/recovery-fund",
    tags: ["emergency", "basic needs", "early recovery"],
    curated: true,
  },
];

/**
 * Sample support programs data
 */
const SAMPLE_PROGRAMS = [
  {
    category: "treatment",
    name: "Phoenix Recovery Center",
    region: "California",
    website: "https://example.com/phoenix",
    description: "Comprehensive treatment center offering detox, residential (30-90 days), PHP, and IOP programs with trauma-informed care.",
    tags: ["detox", "residential", "PHP", "IOP", "trauma-informed"],
  },
  {
    category: "outpatient",
    name: "Mindful Recovery Outpatient",
    region: "California",
    website: "https://example.com/mindful",
    description: "Outpatient program with evening and weekend options. Includes individual therapy, group sessions, and family support.",
    tags: ["outpatient", "evening", "family support"],
  },
  {
    category: "government_assistance",
    name: "CalWORKs Substance Abuse Services",
    region: "California",
    website: "https://example.com/calworks",
    description: "State assistance program providing treatment services, case management, and employment support for eligible families.",
    tags: ["government", "case management", "employment"],
  },
];

/**
 * Sample recovery circles data
 */
const SAMPLE_CIRCLES = [
  {
    theme: "early_recovery",
    description: "A supportive community for those in their first year of recovery. Share experiences, celebrate wins, and navigate challenges together.",
    cadence: "daily",
    prompts: [
      "What's one thing you're grateful for today?",
      "Share a challenge you're facing and how you're handling it.",
      "What helped you stay sober today?",
      "Name one person who supported you this week.",
      "What's a healthy coping skill you used recently?",
    ],
    createdAt: new Date(),
  },
  {
    theme: "trauma_healing",
    description: "A safe space for processing trauma and building resilience. Peer support for those working through past wounds.",
    cadence: "weekly",
    prompts: [
      "What does safety mean to you today?",
      "Share a small victory in your healing journey.",
      "What boundary did you set this week?",
      "How are you practicing self-compassion?",
    ],
    createdAt: new Date(),
  },
  {
    theme: "family_recovery",
    description: "Support for family members and loved ones affected by addiction. Share experiences, find hope, and heal together.",
    cadence: "weekly",
    prompts: [
      "What's one thing you learned about boundaries this week?",
      "How are you taking care of yourself?",
      "Share a moment of hope or progress.",
      "What support do you need right now?",
    ],
    createdAt: new Date(),
  },
];

/**
 * Check if collection already has data
 */
async function hasData(collectionName) {
  try {
    const ref = collection(db, collectionName);
    const snapshot = await getDocs(query(ref));
    return !snapshot.empty;
  } catch (err) {
    console.error(`Error checking ${collectionName}:`, err);
    return false;
  }
}

/**
 * Seed housing providers
 */
async function seedHousing() {
  try {
    if (await hasData("housing_providers")) {
      console.log("✓ Housing providers already seeded");
      return { ok: true, skipped: true };
    }

    const housingRef = collection(db, "housing_providers");
    let count = 0;

    for (const housing of SAMPLE_HOUSING) {
      await addDoc(housingRef, housing);
      count++;
    }

    console.log(`✓ Seeded ${count} housing providers`);
    return { ok: true, count };
  } catch (err) {
    console.error("Error seeding housing:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Seed grants
 */
async function seedGrants() {
  try {
    if (await hasData("grants")) {
      console.log("✓ Grants already seeded");
      return { ok: true, skipped: true };
    }

    const grantsRef = collection(db, "grants");
    let count = 0;

    for (const grant of SAMPLE_GRANTS) {
      await addDoc(grantsRef, grant);
      count++;
    }

    console.log(`✓ Seeded ${count} grants`);
    return { ok: true, count };
  } catch (err) {
    console.error("Error seeding grants:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Seed support programs
 */
async function seedPrograms() {
  try {
    if (await hasData("support_programs")) {
      console.log("✓ Support programs already seeded");
      return { ok: true, skipped: true };
    }

    const programsRef = collection(db, "support_programs");
    let count = 0;

    for (const program of SAMPLE_PROGRAMS) {
      await addDoc(programsRef, program);
      count++;
    }

    console.log(`✓ Seeded ${count} support programs`);
    return { ok: true, count };
  } catch (err) {
    console.error("Error seeding programs:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Seed recovery circles
 */
async function seedCircles() {
  try {
    if (await hasData("recovery_circles")) {
      console.log("✓ Recovery circles already seeded");
      return { ok: true, skipped: true };
    }

    const circlesRef = collection(db, "recovery_circles");
    let count = 0;

    for (const circle of SAMPLE_CIRCLES) {
      await addDoc(circlesRef, circle);
      count++;
    }

    console.log(`✓ Seeded ${count} recovery circles`);
    return { ok: true, count };
  } catch (err) {
    console.error("Error seeding circles:", err);
    return { ok: false, error: err.message };
  }
}

/**
 * Seed all Real Help data
 */
export async function seedAllRealHelpData() {
  console.log("🌱 Starting Real Help data seed...");
  
  const results = {
    housing: await seedHousing(),
    grants: await seedGrants(),
    programs: await seedPrograms(),
    circles: await seedCircles(),
  };

  const totalSeeded = Object.values(results).reduce(
    (sum, r) => sum + (r.count || 0),
    0
  );

  console.log(`\n✅ Seed complete! Added ${totalSeeded} total resources.`);
  
  return results;
}

/**
 * Export individual seed functions for selective seeding
 */
export default {
  seedAllRealHelpData,
  seedHousing,
  seedGrants,
  seedPrograms,
  seedCircles,
};

