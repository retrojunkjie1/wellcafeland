// src/services/assignmentService.js
// Client-provider assignments

import { collection, addDoc, query, where, getDocs, updateDoc, serverTimestamp, doc } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Assign a provider to a client
 * @param {Object} data - { clientId, providerId, orgId, relationshipType, createdBy }
 * @returns {Promise<{ok: boolean, assignmentId?: string, error?: string}>}
 */
export async function assignProviderToClient({ clientId, providerId, orgId, relationshipType = "primary", createdBy }) {
  try {
    if (!clientId || !providerId) {
      return { ok: false, error: "Missing required fields: clientId, providerId" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    // Check if assignment already exists
    const assignmentsRef = collection(db, "clientProviderAssignments");
    const existingQuery = query(
      assignmentsRef,
      where("clientId", "==", clientId),
      where("providerId", "==", providerId),
      where("status", "==", "active")
    );
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
      return { ok: true, assignmentId: existing.docs[0].id, alreadyExists: true };
    }

    const assignmentData = {
      clientId,
      providerId,
      orgId: orgId || null,
      relationshipType: relationshipType || "primary",
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: createdBy || null,
    };

    const docRef = await addDoc(assignmentsRef, assignmentData);

    logInfo("assignmentService", "Provider assigned to client", { assignmentId: docRef.id, clientId, providerId });
    return { ok: true, assignmentId: docRef.id };
  } catch (err) {
    logError("assignmentService", err, { function: "assignProviderToClient", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * Unassign a provider from a client
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function unassignProvider(assignmentId) {
  try {
    if (!assignmentId || !db) {
      return { ok: false, error: "Missing assignmentId or database not available" };
    }

    const assignmentRef = doc(db, "clientProviderAssignments", assignmentId);
    await updateDoc(assignmentRef, {
      status: "inactive",
      updatedAt: serverTimestamp(),
    });

    logInfo("assignmentService", "Provider unassigned", { assignmentId });
    return { ok: true };
  } catch (err) {
    logError("assignmentService", err, { function: "unassignProvider", assignmentId });
    return { ok: false, error: err.message };
  }
}

/**
 * List assignments for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>}
 */
export async function listAssignmentsForProvider(providerId) {
  try {
    if (!providerId || !db) return [];

    const assignmentsRef = collection(db, "clientProviderAssignments");
    const q = query(assignmentsRef, where("providerId", "==", providerId), where("status", "==", "active"));
    const snapshot = await getDocs(q);

    const assignments = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      assignments.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        relationshipType: data.relationshipType || "primary",
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        createdBy: data.createdBy || null,
      });
    });

    return assignments;
  } catch (err) {
    logError("assignmentService", err, { function: "listAssignmentsForProvider", providerId });
    return [];
  }
}

/**
 * List assignments for a client
 * @param {string} clientId - Client ID
 * @returns {Promise<Array>}
 */
export async function listAssignmentsForClient(clientId) {
  try {
    if (!clientId || !db) return [];

    const assignmentsRef = collection(db, "clientProviderAssignments");
    const q = query(assignmentsRef, where("clientId", "==", clientId), where("status", "==", "active"));
    const snapshot = await getDocs(q);

    const assignments = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      assignments.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        relationshipType: data.relationshipType || "primary",
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        createdBy: data.createdBy || null,
      });
    });

    return assignments;
  } catch (err) {
    logError("assignmentService", err, { function: "listAssignmentsForClient", clientId });
    return [];
  }
}

export default {
  assignProviderToClient,
  unassignProvider,
  listAssignmentsForProvider,
  listAssignmentsForClient,
};

