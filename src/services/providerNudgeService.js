// src/services/providerNudgeService.js
// Provider-initiated nudges for clients

import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Send a nudge to a client
 * @param {string} clientId - Client ID
 * @param {string} type - Nudge type ("check-in" | "grounding" | "urge-surf" | "journal-prompt")
 * @param {string} providerId - Provider ID
 * @returns {Promise<{ok: boolean, nudgeId?: string, error?: string}>}
 */
export async function sendNudge(clientId, type, providerId) {
  try {
    if (!clientId || !type || !providerId) {
      return { ok: false, error: "Missing required parameters" };
    }

    const validTypes = ["check-in", "grounding", "urge-surf", "journal-prompt"];
    if (!validTypes.includes(type)) {
      return { ok: false, error: "Invalid nudge type" };
    }

    const nudgesRef = collection(db, "clients", clientId, "nudges");
    const nudgeDoc = await addDoc(nudgesRef, {
      type,
      createdByProviderId: providerId,
      createdAt: new Date(),
      delivered: false,
    });

    logInfo("providerNudgeService", "Nudge sent", { clientId, nudgeId: nudgeDoc.id, type, providerId });
    return { ok: true, nudgeId: nudgeDoc.id };
  } catch (err) {
    logError("providerNudgeService", err, { function: "sendNudge", clientId, type });
    return { ok: false, error: err.message };
  }
}

/**
 * List nudges for a client
 * @param {string} clientId - Client ID
 * @param {boolean} undeliveredOnly - Only return undelivered nudges
 * @returns {Promise<Array>}
 */
export async function listNudges(clientId, undeliveredOnly = false) {
  try {
    if (!clientId) return [];

    const nudgesRef = collection(db, "clients", clientId, "nudges");
    let q = query(nudgesRef);

    if (undeliveredOnly) {
      q = query(nudgesRef, where("delivered", "==", false));
    }

    const snapshot = await getDocs(q);
    const nudges = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      nudges.push({
        id: docSnap.id,
        type: data.type || "check-in",
        createdByProviderId: data.createdByProviderId || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        delivered: data.delivered || false,
      });
    });

    // Sort by createdAt (most recent first)
    nudges.sort((a, b) => {
      const aTime = a.createdAt?.getTime?.() || a.createdAt || 0;
      const bTime = b.createdAt?.getTime?.() || b.createdAt || 0;
      return bTime - aTime;
    });

    return nudges;
  } catch (err) {
    logError("providerNudgeService", err, { function: "listNudges", clientId });
    return [];
  }
}

/**
 * Mark a nudge as delivered
 * @param {string} clientId - Client ID
 * @param {string} nudgeId - Nudge ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function markNudgeDelivered(clientId, nudgeId) {
  try {
    if (!clientId || !nudgeId) {
      return { ok: false, error: "Missing clientId or nudgeId" };
    }

    const nudgeRef = doc(db, "clients", clientId, "nudges", nudgeId);
    await updateDoc(nudgeRef, {
      delivered: true,
      deliveredAt: new Date(),
    });

    logInfo("providerNudgeService", "Nudge marked as delivered", { clientId, nudgeId });
    return { ok: true };
  } catch (err) {
    logError("providerNudgeService", err, { function: "markNudgeDelivered", clientId, nudgeId });
    return { ok: false, error: err.message };
  }
}

export default {
  sendNudge,
  listNudges,
  markNudgeDelivered,
};

