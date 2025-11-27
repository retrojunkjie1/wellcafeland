// src/services/grantsService.js
// Grants and funding assistance service

import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * List grants
 * @param {Object} filters - { region?, tags? }
 * @returns {Promise<Array>}
 */
export async function listGrants(filters = {}) {
  try {
    const grantsRef = collection(db, "grants");
    let q = query(grantsRef);

    if (filters.region) {
      q = query(grantsRef, where("region", "==", filters.region));
    }

    const snapshot = await getDocs(q);
    const grants = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      grants.push({
        id: docSnap.id,
        name: data.name || "",
        region: data.region || "",
        description: data.description || "",
        contact: data.contact || {},
        website: data.website || "",
        tags: data.tags || [],
        curated: data.curated === true,
      });
    });

    return grants;
  } catch (err) {
    logError("grantsService", err, { function: "listGrants", filters });
    return [];
  }
}

/**
 * Get grant by ID
 * @param {string} grantId - Grant ID
 * @returns {Promise<Object|null>}
 */
export async function getGrant(grantId) {
  try {
    if (!grantId) return null;

    const grantRef = doc(db, "grants", grantId);
    const grantDoc = await getDoc(grantRef);

    if (!grantDoc.exists()) return null;

    const data = grantDoc.data();
    return {
      id: grantDoc.id,
      name: data.name || "",
      region: data.region || "",
      description: data.description || "",
      contact: data.contact || {},
      website: data.website || "",
      tags: data.tags || [],
      curated: data.curated === true,
    };
  } catch (err) {
    logError("grantsService", err, { function: "getGrant", grantId });
    return null;
  }
}

export default {
  listGrants,
  getGrant,
};

