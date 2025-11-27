// src/services/consentService.js
// Client-provider consent and visibility settings

import { doc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Get client consent settings for a provider
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export async function getClientConsentSettings(clientId, providerId) {
  try {
    if (!clientId || !providerId || !db) {
      return getDefaultConsentSettings();
    }

    const settingsRef = collection(db, "clientProviderSettings");
    const q = query(
      settingsRef,
      where("clientId", "==", clientId),
      where("providerId", "==", providerId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return getDefaultConsentSettings();
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
      id: docSnap.id,
      clientId: data.clientId,
      providerId: data.providerId,
      canViewTimeline: data.canViewTimeline !== false, // Default true
      canViewSummaries: data.canViewSummaries !== false, // Default true
      canViewToolsUsage: data.canViewToolsUsage === true, // Default false
      canSeeCircleActivity: data.canSeeCircleActivity === true, // Default false
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("consentService", err, { function: "getClientConsentSettings", clientId, providerId });
    return getDefaultConsentSettings();
  }
}

/**
 * Update client consent settings
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID
 * @param {Object} partialSettings - Partial settings to update
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateClientConsentSettings(clientId, providerId, partialSettings) {
  try {
    if (!clientId || !providerId || !db) {
      return { ok: false, error: "Missing required fields or database not available" };
    }

    const settingsRef = collection(db, "clientProviderSettings");
    const q = query(
      settingsRef,
      where("clientId", "==", clientId),
      where("providerId", "==", providerId)
    );
    const snapshot = await getDocs(q);

    const updateData = {
      ...partialSettings,
      updatedAt: serverTimestamp(),
    };

    if (snapshot.empty) {
      // Create new settings document
      const newSettings = {
        clientId,
        providerId,
        canViewTimeline: partialSettings.canViewTimeline !== false,
        canViewSummaries: partialSettings.canViewSummaries !== false,
        canViewToolsUsage: partialSettings.canViewToolsUsage === true,
        canSeeCircleActivity: partialSettings.canSeeCircleActivity === true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(settingsRef), newSettings);
    } else {
      // Update existing settings
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, updateData);
    }

    logInfo("consentService", "Consent settings updated", { clientId, providerId });
    return { ok: true };
  } catch (err) {
    logError("consentService", err, { function: "updateClientConsentSettings", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * Get default consent settings
 * @returns {Object}
 */
function getDefaultConsentSettings() {
  return {
    id: null,
    clientId: null,
    providerId: null,
    canViewTimeline: true,
    canViewSummaries: true,
    canViewToolsUsage: false,
    canSeeCircleActivity: false,
    createdAt: null,
    updatedAt: null,
  };
}

export default {
  getClientConsentSettings,
  updateClientConsentSettings,
};

