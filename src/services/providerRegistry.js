// src/services/providerRegistry.js
// Provider registry and access management

import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Check if current user has provider access
 * @returns {Promise<boolean>}
 */
export async function hasProviderAccess() {
  try {
    const user = auth?.currentUser;
    
    if (!user) return false;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    const roles = userData.roles || [];
    const role = userData.role || "client";

    return roles.includes("provider") || 
           roles.includes("admin") || 
           role === "provider" || 
           role === "admin";
  } catch (err) {
    logError("providerRegistry", err, { function: "hasProviderAccess" });
    return false;
  }
}

/**
 * Check provider access synchronously (for components)
 * @param {string} userId - User ID
 * @returns {boolean}
 */
export function hasProviderAccessSync(userId) {
  // This is a fallback - should use the async version in most cases
  // For now, return false and let async version handle it
  return false;
}

/**
 * List all providers
 * @returns {Promise<Array>}
 */
export async function listProviders() {
  try {
    const providersRef = collection(db, "users");
    const q = query(
      providersRef,
      where("role", "in", ["provider", "admin"])
    );

    const snapshot = await getDocs(q);
    const providers = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      providers.push({
        id: docSnap.id,
        displayName: data.displayName || data.name || "Provider",
        email: data.email || "",
        role: data.role || "provider",
        roles: data.roles || [],
      });
    });

    return providers;
  } catch (err) {
    logError("providerRegistry", err, { function: "listProviders" });
    return [];
  }
}

/**
 * Assign a client to a provider
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function assignClientToProvider(clientId, providerId) {
  try {
    if (!clientId || !providerId) {
      return { ok: false, error: "Missing clientId or providerId" };
    }

    const clientRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientRef);

    if (!clientDoc.exists()) {
      return { ok: false, error: "Client not found" };
    }

    const clientData = clientDoc.data();
    const assignedProviders = clientData.assignedProviderIds || [];

    if (!assignedProviders.includes(providerId)) {
      await updateDoc(clientRef, {
        assignedProviderIds: [...assignedProviders, providerId],
        updatedAt: new Date(),
      });
    }

    logInfo("providerRegistry", "Client assigned to provider", { clientId, providerId });
    return { ok: true };
  } catch (err) {
    logError("providerRegistry", err, { function: "assignClientToProvider", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * List clients assigned to a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>}
 */
export async function listClientsForProvider(providerId) {
  try {
    if (!providerId) return [];

    const clientsRef = collection(db, "clients");
    const q = query(
      clientsRef,
      where("assignedProviderIds", "array-contains", providerId)
    );

    const snapshot = await getDocs(q);
    const clients = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      clients.push({
        id: docSnap.id,
        alias: data.alias || "Client",
        riskLevel: data.riskLevel || "safe",
        assignedProviderIds: data.assignedProviderIds || [],
        lastContactAt: data.lastContactAt?.toDate?.() || data.lastContactAt || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      });
    });

    // Sort by risk level (critical first) then last contact
    clients.sort((a, b) => {
      const riskOrder = { critical: 0, "at-risk": 1, strained: 2, safe: 3 };
      const riskDiff = (riskOrder[a.riskLevel] || 3) - (riskOrder[b.riskLevel] || 3);
      if (riskDiff !== 0) return riskDiff;
      
      const aTime = a.lastContactAt?.getTime() || 0;
      const bTime = b.lastContactAt?.getTime() || 0;
      return bTime - aTime; // Most recent first
    });

    return clients;
  } catch (err) {
    logError("providerRegistry", err, { function: "listClientsForProvider", providerId });
    return [];
  }
}

export default {
  hasProviderAccess,
  hasProviderAccessSync,
  listProviders,
  assignClientToProvider,
  listClientsForProvider,
};

