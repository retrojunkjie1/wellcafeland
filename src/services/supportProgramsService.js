// src/services/supportProgramsService.js
// Support programs service (government assistance, legal, emergency, employment)

import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * List support programs
 * @param {Object} filters - { category?, region? }
 * @returns {Promise<Array>}
 */
export async function listSupportPrograms(filters = {}) {
  try {
    const programsRef = collection(db, "support_programs");
    let q = query(programsRef);

    if (filters.category) {
      q = query(programsRef, where("category", "==", filters.category));
    }
    if (filters.region) {
      q = query(programsRef, where("region", "==", filters.region));
    }

    const snapshot = await getDocs(q);
    const programs = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      programs.push({
        id: docSnap.id,
        category: data.category || "government_assistance",
        name: data.name || "",
        region: data.region || "",
        website: data.website || "",
        description: data.description || "",
        tags: data.tags || [],
      });
    });

    return programs;
  } catch (err) {
    logError("supportProgramsService", err, { function: "listSupportPrograms", filters });
    return [];
  }
}

/**
 * Get support program by ID
 * @param {string} programId - Program ID
 * @returns {Promise<Object|null>}
 */
export async function getSupportProgram(programId) {
  try {
    if (!programId) return null;

    const programRef = doc(db, "support_programs", programId);
    const programDoc = await getDoc(programRef);

    if (!programDoc.exists()) return null;

    const data = programDoc.data();
    return {
      id: programDoc.id,
      category: data.category || "government_assistance",
      name: data.name || "",
      region: data.region || "",
      website: data.website || "",
      description: data.description || "",
      tags: data.tags || [],
    };
  } catch (err) {
    logError("supportProgramsService", err, { function: "getSupportProgram", programId });
    return null;
  }
}

export default {
  listSupportPrograms,
  getSupportProgram,
};

