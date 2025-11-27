// src/services/providerService.js
// Provider profiles management

import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Create a provider profile
 * @param {Object} data - { uid, name, orgId, specialties, modalities, regions, timeZone }
 * @returns {Promise<{ok: boolean, providerId?: string, error?: string}>}
 */
export async function createProviderProfile({ uid, name, orgId, specialties = [], modalities = [], regions = [], timeZone = null }) {
  try {
    if (!uid || !name) {
      return { ok: false, error: "Missing required fields: uid, name" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const providerRef = doc(db, "providers", uid);
    const providerData = {
      uid,
      name: name.trim(),
      role: "provider",
      orgId: orgId || null,
      specialties: Array.isArray(specialties) ? specialties : [],
      modalities: Array.isArray(modalities) ? modalities : [],
      regions: Array.isArray(regions) ? regions : [],
      timeZone: timeZone || null,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(providerRef, providerData);

    logInfo("providerService", "Provider profile created", { providerId: uid, name });
    return { ok: true, providerId: uid };
  } catch (err) {
    logError("providerService", err, { function: "createProviderProfile", uid });
    return { ok: false, error: err.message };
  }
}

/**
 * Get provider profile by providerId
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object|null>}
 */
export async function getProviderProfile(providerId) {
  try {
    if (!providerId || !db) return null;

    const providerRef = doc(db, "providers", providerId);
    const providerDoc = await getDoc(providerRef);

    if (!providerDoc.exists()) return null;

    const data = providerDoc.data();
    return {
      id: providerDoc.id,
      uid: data.uid,
      name: data.name,
      role: data.role || "provider",
      orgId: data.orgId || null,
      specialties: data.specialties || [],
      modalities: data.modalities || [],
      regions: data.regions || [],
      timeZone: data.timeZone || null,
      active: data.active !== false,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("providerService", err, { function: "getProviderProfile", providerId });
    return null;
  }
}

/**
 * Get provider profile by UID
 * @param {string} uid - User UID
 * @returns {Promise<Object|null>}
 */
export async function getProviderProfileByUid(uid) {
  try {
    if (!uid || !db) return null;

    const providersRef = collection(db, "providers");
    const q = query(providersRef, where("uid", "==", uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      uid: data.uid,
      name: data.name,
      role: data.role || "provider",
      orgId: data.orgId || null,
      specialties: data.specialties || [],
      modalities: data.modalities || [],
      regions: data.regions || [],
      timeZone: data.timeZone || null,
      active: data.active !== false,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("providerService", err, { function: "getProviderProfileByUid", uid });
    return null;
  }
}

/**
 * Update provider profile
 * @param {string} providerId - Provider ID
 * @param {Object} data - Partial update data
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateProviderProfile(providerId, data) {
  try {
    if (!providerId || !db) {
      return { ok: false, error: "Missing providerId or database not available" };
    }

    const providerRef = doc(db, "providers", providerId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(providerRef, updateData);

    logInfo("providerService", "Provider profile updated", { providerId });
    return { ok: true };
  } catch (err) {
    logError("providerService", err, { function: "updateProviderProfile", providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * List providers by organization
 * @param {string} orgId - Organization ID
 * @returns {Promise<Array>}
 */
export async function listProvidersByOrg(orgId) {
  try {
    if (!orgId || !db) return [];

    const providersRef = collection(db, "providers");
    const q = query(providersRef, where("orgId", "==", orgId), where("active", "==", true));
    const snapshot = await getDocs(q);

    const providers = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      providers.push({
        id: docSnap.id,
        uid: data.uid,
        name: data.name,
        role: data.role || "provider",
        orgId: data.orgId || null,
        specialties: data.specialties || [],
        modalities: data.modalities || [],
        regions: data.regions || [],
        timeZone: data.timeZone || null,
        active: data.active !== false,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    return providers;
  } catch (err) {
    logError("providerService", err, { function: "listProvidersByOrg", orgId });
    return [];
  }
}

export default {
  createProviderProfile,
  getProviderProfile,
  getProviderProfileByUid,
  updateProviderProfile,
  listProvidersByOrg,
};
