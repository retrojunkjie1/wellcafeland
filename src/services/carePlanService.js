// src/services/carePlanService.js
// Care plans management

import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Create a care plan
 * @param {Object} data - { clientId, providerId, orgId, title, items }
 * @returns {Promise<{ok: boolean, planId?: string, error?: string}>}
 */
export async function createCarePlan({ clientId, providerId, orgId, title, items = [] }) {
  try {
    if (!clientId || !providerId || !title) {
      return { ok: false, error: "Missing required fields: clientId, providerId, title" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const plansRef = collection(db, "carePlans");
    const planData = {
      clientId,
      providerId,
      orgId: orgId || null,
      title: title.trim(),
      items: Array.isArray(items) ? items : [],
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(plansRef, planData);

    logInfo("carePlanService", "Care plan created", { planId: docRef.id, clientId, providerId });
    return { ok: true, planId: docRef.id };
  } catch (err) {
    logError("carePlanService", err, { function: "createCarePlan", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * Update a care plan
 * @param {string} planId - Plan ID
 * @param {Object} data - Partial update data
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateCarePlan(planId, data) {
  try {
    if (!planId || !db) {
      return { ok: false, error: "Missing planId or database not available" };
    }

    const planRef = doc(db, "carePlans", planId);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(planRef, updateData);

    logInfo("carePlanService", "Care plan updated", { planId });
    return { ok: true };
  } catch (err) {
    logError("carePlanService", err, { function: "updateCarePlan", planId });
    return { ok: false, error: err.message };
  }
}

/**
 * List care plans for a client
 * @param {string} clientId - Client ID
 * @param {string} providerId - Provider ID (optional, filter by provider)
 * @returns {Promise<Array>}
 */
export async function listCarePlansForClient(clientId, providerId = null) {
  try {
    if (!clientId || !db) return [];

    const plansRef = collection(db, "carePlans");
    let q = query(plansRef, where("clientId", "==", clientId));

    if (providerId) {
      q = query(plansRef, where("clientId", "==", clientId), where("providerId", "==", providerId));
    }

    const snapshot = await getDocs(q);
    const plans = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      plans.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        title: data.title || "",
        items: data.items || [],
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    return plans;
  } catch (err) {
    logError("carePlanService", err, { function: "listCarePlansForClient", clientId, providerId });
    return [];
  }
}

/**
 * Get a single care plan
 * @param {string} planId - Plan ID
 * @returns {Promise<Object|null>}
 */
export async function getCarePlan(planId) {
  try {
    if (!planId || !db) return null;

    const planRef = doc(db, "carePlans", planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) return null;

    const data = planDoc.data();
    return {
      id: planDoc.id,
      clientId: data.clientId,
      providerId: data.providerId,
      orgId: data.orgId || null,
      title: data.title || "",
      items: data.items || [],
      status: data.status || "active",
      createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
    };
  } catch (err) {
    logError("carePlanService", err, { function: "getCarePlan", planId });
    return null;
  }
}

export default {
  createCarePlan,
  updateCarePlan,
  listCarePlansForClient,
  getCarePlan,
};

