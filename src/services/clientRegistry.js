// src/services/clientRegistry.js
// Client registry and event logging

import { doc, getDoc, setDoc, collection, addDoc, query, getDocs, updateDoc, orderBy, limit } from "firebase/firestore";
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
 * List all clients (provider-only)
 * @returns {Promise<Array>}
 */
export async function listClients() {
  try {
    const clientsRef = collection(db, "clients");
    const snapshot = await getDocs(clientsRef);
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

    return clients;
  } catch (err) {
    logError("clientRegistry", err, { function: "listClients" });
    return [];
  }
}

/**
 * Create a new client record
 * @param {string} alias - Client alias/name
 * @param {string} userId - User ID (optional, will use current if not provided)
 * @returns {Promise<{ok: boolean, clientId?: string, error?: string}>}
 */
export async function createClient(alias, userId = null) {
  try {
    const clientId = userId || getCurrentUserId();
    
    if (!alias || !alias.trim()) {
      return { ok: false, error: "Alias is required" };
    }

    const clientRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientRef);

    if (clientDoc.exists()) {
      // Update existing client
      await updateDoc(clientRef, {
        alias: alias.trim(),
        updatedAt: new Date(),
      });
      return { ok: true, clientId };
    }

    // Create new client
    await setDoc(clientRef, {
      alias: alias.trim(),
      riskLevel: "safe",
      assignedProviderIds: [],
      lastContactAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logInfo("clientRegistry", "Client created", { clientId, alias });
    return { ok: true, clientId };
  } catch (err) {
    logError("clientRegistry", err, { function: "createClient", alias });
    return { ok: false, error: err.message };
  }
}

/**
 * Get client by ID
 * @param {string} clientId - Client ID
 * @returns {Promise<Object|null>}
 */
export async function getClient(clientId) {
  try {
    if (!clientId) return null;

    const clientRef = doc(db, "clients", clientId);
    const clientDoc = await getDoc(clientRef);

    if (!clientDoc.exists()) return null;

    const data = clientDoc.data();
    return {
      id: clientDoc.id,
      alias: data.alias || "Client",
      riskLevel: data.riskLevel || "safe",
      assignedProviderIds: data.assignedProviderIds || [],
      lastContactAt: data.lastContactAt?.toDate?.() || data.lastContactAt || null,
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("clientRegistry", err, { function: "getClient", clientId });
    return null;
  }
}

/**
 * Update client risk level
 * @param {string} clientId - Client ID
 * @param {string} riskLevel - Risk level ("safe" | "strained" | "at-risk" | "critical")
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateClientRisk(clientId, riskLevel) {
  try {
    if (!clientId) {
      return { ok: false, error: "Missing clientId" };
    }

    const validRiskLevels = ["safe", "strained", "at-risk", "critical"];
    if (!validRiskLevels.includes(riskLevel)) {
      return { ok: false, error: "Invalid risk level" };
    }

    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, {
      riskLevel,
      updatedAt: new Date(),
    });

    logInfo("clientRegistry", "Client risk updated", { clientId, riskLevel });
    return { ok: true };
  } catch (err) {
    logError("clientRegistry", err, { function: "updateClientRisk", clientId, riskLevel });
    return { ok: false, error: err.message };
  }
}

/**
 * Log a client event
 * @param {string} clientId - Client ID
 * @param {Object} eventData - Event data
 * @param {string} eventData.type - Event type ("session" | "tool" | "emotional" | "alert")
 * @param {string} eventData.emotionalLabel - Emotional label
 * @param {string} eventData.riskShift - Risk shift description
 * @param {string} eventData.messagePreview - Message preview (summary only, not raw)
 * @returns {Promise<{ok: boolean, eventId?: string, error?: string}>}
 */
export async function logClientEvent(clientId, eventData) {
  try {
    if (!clientId || !eventData) {
      return { ok: false, error: "Missing clientId or eventData" };
    }

    const { type, emotionalLabel, riskShift, messagePreview } = eventData;

    const eventsRef = collection(db, "clients", clientId, "events");
    const eventDoc = await addDoc(eventsRef, {
      type: type || "session",
      emotionalLabel: emotionalLabel || null,
      riskShift: riskShift || null,
      messagePreview: messagePreview || null,
      timestamp: new Date(),
    });

    // Update client's lastContactAt
    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, {
      lastContactAt: new Date(),
      updatedAt: new Date(),
    });

    logInfo("clientRegistry", "Client event logged", { clientId, eventId: eventDoc.id, type });
    return { ok: true, eventId: eventDoc.id };
  } catch (err) {
    logError("clientRegistry", err, { function: "logClientEvent", clientId });
    return { ok: false, error: err.message };
  }
}

/**
 * Get client events
 * @param {string} clientId - Client ID
 * @param {number} limitCount - Limit number of events
 * @returns {Promise<Array>}
 */
export async function getClientEvents(clientId, limitCount = 50) {
  try {
    if (!clientId) return [];

    const eventsRef = collection(db, "clients", clientId, "events");
    const q = query(
      eventsRef,
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      events.push({
        id: docSnap.id,
        type: data.type || "session",
        emotionalLabel: data.emotionalLabel || null,
        riskShift: data.riskShift || null,
        messagePreview: data.messagePreview || null,
        timestamp: data.timestamp?.toDate?.() || data.timestamp || new Date(),
      });
    });

    return events;
  } catch (err) {
    logError("clientRegistry", err, { function: "getClientEvents", clientId });
    return [];
  }
}

export default {
  listClients,
  createClient,
  getClient,
  updateClientRisk,
  logClientEvent,
  getClientEvents,
};

