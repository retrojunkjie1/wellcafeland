// src/services/housingService.js
// Housing providers and reviews service

import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { logError, logInfo } from "./logService";

/**
 * Get current user ID (authenticated or anonymous)
 */
function getCurrentUserId() {
  try {
    if (auth?.currentUser?.uid) {
      return auth.currentUser.uid;
    }
    return getAnonymousUserId();
  } catch {
    return getAnonymousUserId();
  }
}

/**
 * List housing providers
 * @param {Object} filters - { region?, type?, capacity_status? }
 * @returns {Promise<Array>}
 */
export async function listHousingProviders(filters = {}) {
  try {
    const housingRef = collection(db, "housing_providers");
    let q = query(housingRef);

    if (filters.region) {
      q = query(housingRef, where("region", "==", filters.region));
    }
    if (filters.type) {
      q = query(housingRef, where("type", "==", filters.type));
    }
    if (filters.capacity_status) {
      q = query(housingRef, where("capacity_status", "==", filters.capacity_status));
    }

    const snapshot = await getDocs(q);
    const providers = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      providers.push({
        id: docSnap.id,
        name: data.name || "",
        type: data.type || "sober_home",
        region: data.region || "",
        cost_range: data.cost_range || "",
        insurance: data.insurance || [],
        capacity_status: data.capacity_status || "open",
        contact: data.contact || {},
        website: data.website || "",
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return providers;
  } catch (err) {
    logError("housingService", err, { function: "listHousingProviders", filters });
    return [];
  }
}

/**
 * Get housing provider by ID
 * @param {string} housingId - Housing provider ID
 * @returns {Promise<Object|null>}
 */
export async function getHousingProvider(housingId) {
  try {
    if (!housingId) return null;

    const housingRef = doc(db, "housing_providers", housingId);
    const housingDoc = await getDoc(housingRef);

    if (!housingDoc.exists()) return null;

    const data = housingDoc.data();
    return {
      id: housingDoc.id,
      name: data.name || "",
      type: data.type || "sober_home",
      region: data.region || "",
      cost_range: data.cost_range || "",
      insurance: data.insurance || [],
      capacity_status: data.capacity_status || "open",
      contact: data.contact || {},
      website: data.website || "",
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
    };
  } catch (err) {
    logError("housingService", err, { function: "getHousingProvider", housingId });
    return null;
  }
}

/**
 * Get reviews for a housing provider
 * @param {string} housingId - Housing provider ID
 * @returns {Promise<Array>}
 */
export async function getHousingReviews(housingId) {
  try {
    if (!housingId) return [];

    const reviewsRef = collection(db, "housing_providers", housingId, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(50));

    const snapshot = await getDocs(q);
    const reviews = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reviews.push({
        id: docSnap.id,
        housingId,
        userId: data.userId || null,
        rating: data.rating || 0,
        tags: data.tags || [],
        review: data.review || "",
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    return reviews;
  } catch (err) {
    logError("housingService", err, { function: "getHousingReviews", housingId });
    return [];
  }
}

/**
 * Add a review for a housing provider
 * @param {string} housingId - Housing provider ID
 * @param {Object} reviewData - { rating, tags, review }
 * @returns {Promise<{ok: boolean, reviewId?: string, error?: string}>}
 */
export async function addHousingReview(housingId, reviewData) {
  try {
    if (!housingId || !reviewData) {
      return { ok: false, error: "Missing housingId or reviewData" };
    }

    const userId = getCurrentUserId();
    const reviewsRef = collection(db, "housing_providers", housingId, "reviews");

    const reviewDoc = await addDoc(reviewsRef, {
      housingId,
      userId,
      rating: reviewData.rating || 0,
      tags: reviewData.tags || [],
      review: reviewData.review || "",
      createdAt: new Date(),
    });

    logInfo("housingService", "Review added", { housingId, reviewId: reviewDoc.id });
    return { ok: true, reviewId: reviewDoc.id };
  } catch (err) {
    logError("housingService", err, { function: "addHousingReview", housingId });
    return { ok: false, error: err.message };
  }
}

export default {
  listHousingProviders,
  getHousingProvider,
  getHousingReviews,
  addHousingReview,
};

