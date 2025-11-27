// src/services/supportersService.js
// Supporters/donors service (scaffold only - no real payments)
// For future integration

import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * List supporters (static or Firestore-backed)
 */
export async function listSupporters() {
  try {
    // Try Firestore first
    if (db) {
      try {
        const supportersRef = collection(db, "supporters");
        const q = query(supportersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const supporters = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          supporters.push({
            id: docSnap.id,
            name: data.name || "Anonymous Supporter",
            type: data.type || "donor", // "donor" | "partner" | "sponsor"
            message: data.message || null,
            website: data.website || null,
            logo: data.logo || null,
          });
        });
        
        if (supporters.length > 0) {
          logInfo("supportersService", "Loaded supporters from Firestore", { count: supporters.length });
          return supporters;
        }
      } catch (err) {
        logError("supportersService", err, { function: "listSupporters", step: "firestore" });
      }
    }

    // Fallback to static list (for now)
    return [
      {
        id: "static-1",
        name: "WellnessCafe Community",
        type: "partner",
        message: "Made possible by the community",
        website: null,
      },
    ];
  } catch (err) {
    logError("supportersService", err, { function: "listSupporters" });
    return [];
  }
}

export default {
  listSupporters,
};

