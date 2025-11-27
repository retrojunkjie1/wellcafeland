// src/services/appointmentService.js
// Appointments/scheduling management

import { collection, addDoc, doc, getDoc, query, where, getDocs, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

/**
 * Create an appointment
 * @param {Object} data - { clientId, providerId, orgId, startAt, endAt, note }
 * @returns {Promise<{ok: boolean, appointmentId?: string, error?: string}>}
 */
export async function createAppointment({ clientId, providerId, orgId, startAt, endAt, note = null }) {
  try {
    if (!clientId || !providerId || !startAt || !endAt) {
      return { ok: false, error: "Missing required fields: clientId, providerId, startAt, endAt" };
    }

    if (!db) {
      return { ok: false, error: "Database not available" };
    }

    const appointmentsRef = collection(db, "appointments");
    const appointmentData = {
      clientId,
      providerId,
      orgId: orgId || null,
      startAt: startAt instanceof Date ? Timestamp.fromDate(startAt) : (typeof startAt === "string" ? Timestamp.fromDate(new Date(startAt)) : startAt),
      endAt: endAt instanceof Date ? Timestamp.fromDate(endAt) : (typeof endAt === "string" ? Timestamp.fromDate(new Date(endAt)) : endAt),
      status: "scheduled",
      note: note || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(appointmentsRef, appointmentData);

    logInfo("appointmentService", "Appointment created", { appointmentId: docRef.id, clientId, providerId });
    return { ok: true, appointmentId: docRef.id };
  } catch (err) {
    logError("appointmentService", err, { function: "createAppointment", clientId, providerId });
    return { ok: false, error: err.message };
  }
}

/**
 * List appointments for a provider
 * @param {string} providerId - Provider ID
 * @param {Object} options - { from, to }
 * @returns {Promise<Array>}
 */
export async function listAppointmentsForProvider(providerId, { from = null, to = null } = {}) {
  try {
    if (!providerId || !db) return [];

    const appointmentsRef = collection(db, "appointments");
    let q = query(appointmentsRef, where("providerId", "==", providerId));

    if (from) {
      const fromTimestamp = from instanceof Date ? Timestamp.fromDate(from) : (typeof from === "string" ? Timestamp.fromDate(new Date(from)) : from);
      q = query(appointmentsRef, where("providerId", "==", providerId), where("startAt", ">=", fromTimestamp));
    }

    if (to) {
      const toTimestamp = to instanceof Date ? Timestamp.fromDate(to) : (typeof to === "string" ? Timestamp.fromDate(new Date(to)) : to);
      q = query(appointmentsRef, where("providerId", "==", providerId), where("startAt", "<=", toTimestamp));
    }

    const snapshot = await getDocs(q);
    const appointments = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      appointments.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        startAt: data.startAt?.toDate?.() || data.startAt || null,
        endAt: data.endAt?.toDate?.() || data.endAt || null,
        status: data.status || "scheduled",
        note: data.note || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    // Sort by startAt
    appointments.sort((a, b) => {
      const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
      const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
      return aTime - bTime;
    });

    return appointments;
  } catch (err) {
    logError("appointmentService", err, { function: "listAppointmentsForProvider", providerId });
    return [];
  }
}

/**
 * List appointments for a client
 * @param {string} clientId - Client ID
 * @param {Object} options - { from, to }
 * @returns {Promise<Array>}
 */
export async function listAppointmentsForClient(clientId, { from = null, to = null } = {}) {
  try {
    if (!clientId || !db) return [];

    const appointmentsRef = collection(db, "appointments");
    let q = query(appointmentsRef, where("clientId", "==", clientId));

    if (from) {
      const fromTimestamp = from instanceof Date ? Timestamp.fromDate(from) : (typeof from === "string" ? Timestamp.fromDate(new Date(from)) : from);
      q = query(appointmentsRef, where("clientId", "==", clientId), where("startAt", ">=", fromTimestamp));
    }

    if (to) {
      const toTimestamp = to instanceof Date ? Timestamp.fromDate(to) : (typeof to === "string" ? Timestamp.fromDate(new Date(to)) : to);
      q = query(appointmentsRef, where("clientId", "==", clientId), where("startAt", "<=", toTimestamp));
    }

    const snapshot = await getDocs(q);
    const appointments = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      appointments.push({
        id: docSnap.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        startAt: data.startAt?.toDate?.() || data.startAt || null,
        endAt: data.endAt?.toDate?.() || data.endAt || null,
        status: data.status || "scheduled",
        note: data.note || null,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      });
    });

    // Sort by startAt
    appointments.sort((a, b) => {
      const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
      const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
      return aTime - bTime;
    });

    return appointments;
  } catch (err) {
    logError("appointmentService", err, { function: "listAppointmentsForClient", clientId });
    return [];
  }
}

/**
 * Update an appointment
 * @param {string} id - Appointment ID
 * @param {Object} data - Partial update data
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateAppointment(id, data) {
  try {
    if (!id || !db) {
      return { ok: false, error: "Missing appointmentId or database not available" };
    }

    const appointmentRef = doc(db, "appointments", id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // Convert Date objects to Timestamps if present
    if (updateData.startAt instanceof Date) {
      updateData.startAt = Timestamp.fromDate(updateData.startAt);
    } else if (typeof updateData.startAt === "string") {
      updateData.startAt = Timestamp.fromDate(new Date(updateData.startAt));
    }

    if (updateData.endAt instanceof Date) {
      updateData.endAt = Timestamp.fromDate(updateData.endAt);
    } else if (typeof updateData.endAt === "string") {
      updateData.endAt = Timestamp.fromDate(new Date(updateData.endAt));
    }

    await updateDoc(appointmentRef, updateData);

    logInfo("appointmentService", "Appointment updated", { appointmentId: id });
    return { ok: true };
  } catch (err) {
    logError("appointmentService", err, { function: "updateAppointment", id });
    return { ok: false, error: err.message };
  }
}

export default {
  createAppointment,
  listAppointmentsForProvider,
  listAppointmentsForClient,
  updateAppointment,
};

