// src/services/providerService.js
// Service for real help provider data

import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * List verified providers by category and region
 */
export async function listVerifiedProviders({ category, regionKey, tags = [] }) {
  try {
    const colRef = collection(db, "realHelpProviders");
    let q = query(colRef, where("category", "==", category));

    if (regionKey) {
      q = query(q, where("regionKey", "==", regionKey));
    }

    const snapshot = await getDocs(q);
    const providers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Remove internalNotes for non-admin users
      internalNotes: undefined,
    }));

    // Filter by verification status (verified first)
    const verified = providers.filter(p => p.verification?.status === "verified");
    const others = providers.filter(p => p.verification?.status !== "verified");

    // Filter by tags if provided
    let filtered = [...verified, ...others];
    if (tags.length > 0) {
      filtered = filtered.filter(p => 
        tags.some(tag => p.tags?.includes(tag))
      );
    }

    return filtered;
  } catch (err) {
    console.error("Failed to list verified providers:", err);
    return [];
  }
}

/**
 * Search providers by name, city, or tags
 */
export async function searchProviders({ query, category, regionKey }) {
  try {
    const providers = await listVerifiedProviders({ category, regionKey });
    if (!query) return providers;

    const lowerQuery = query.toLowerCase();
    return providers.filter(p => 
      p.name?.toLowerCase().includes(lowerQuery) ||
      p.city?.toLowerCase().includes(lowerQuery) ||
      p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (err) {
    console.error("Failed to search providers:", err);
    return [];
  }
}
