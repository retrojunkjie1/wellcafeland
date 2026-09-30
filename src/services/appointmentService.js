// src/services/appointmentService.js
// Appointments/scheduling management

import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";
import { trackSupportAction } from "@/telemetry/telemetry";

async function invokeAppointmentFunction(name, data) {
  const call = httpsCallable(functions, name);
  const response = await call(data);
  return response.data || {};
}

/**
 * Create an appointment
 * @param {Object} data - { clientId, providerId, orgId, startAt, endAt, note }
 * @returns {Promise<{ok: boolean, appointmentId?: string, error?: string}>}
 */
export async function createAppointment({ clientId, providerId, orgId, startAt, endAt, note = null, sessionFormat = "in-person", meetingLink = "" }) {
  try {
    if (!clientId || !providerId || !startAt || !endAt) {
      return { ok: false, error: "Missing required fields: clientId, providerId, startAt, endAt" };
    }

    const response = await invokeAppointmentFunction("createProviderAppointment", {
      clientId, providerId, orgId: orgId || null, startAt, endAt, note: note || "", sessionFormat, meetingLink,
    });
    return { ok: true, appointmentId: response.appointmentId };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not save this appointment. Please try again." };
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
    if (!providerId) return [];
    const response = await invokeAppointmentFunction("listProviderAppointments", { from, to });
    return response.appointments || [];
  } catch (err) {
    console.error("Could not load practitioner appointments:", err);
    throw err;
  }
}

export async function listAppointmentsForProviderClient(clientId, { from = null, to = null } = {}) {
  try {
    if (!clientId) return [];
    const response = await invokeAppointmentFunction("listAppointmentsForProviderClient", { clientId, from, to });
    return response.appointments || [];
  } catch (err) {
    console.error("Could not load appointments for practitioner client:", err);
    throw err;
  }
}

export async function listMyConnectedPractitioners() {
  const response = await invokeAppointmentFunction("listMyConnectedPractitioners", {});
  return response.practitioners || [];
}

export async function getMyProviderAvailability() {
  const response = await invokeAppointmentFunction("getMyProviderAvailability", {});
  return response;
}

export async function saveMyProviderAvailability({ timezone, weeklyHours }) {
  try {
    const response = await invokeAppointmentFunction("saveMyProviderAvailability", { timezone, weeklyHours });
    return { ok: true, ...response };
  } catch (err) {
    return { ok: false, error: err?.message || "Your appointment hours could not be saved. Please try again." };
  }
}

export async function getConnectedPractitionerAvailability(providerId, durationMinutes = 45) {
  const response = await invokeAppointmentFunction("getConnectedPractitionerAvailability", { providerId, durationMinutes });
  return response;
}

export async function listMyAppointmentRequests() {
  const response = await invokeAppointmentFunction("listMyAppointmentRequests", {});
  return response.requests || [];
}

export async function requestProviderAppointment({ providerId, requestedStartAt, requestedEndAt, note = "" }) {
  try {
    const response = await invokeAppointmentFunction("requestProviderAppointment", {
      providerId,
      requestedStartAt,
      requestedEndAt,
      note,
    });
    return { ok: true, requestId: response.requestId, status: response.status };
  } catch (err) {
    trackSupportAction("sessions", "session_request_failed", err?.code);
    return { ok: false, error: err?.message || "Your session request couldn’t be sent. Please try again." };
  }
}

export async function listProviderAppointmentRequests() {
  const response = await invokeAppointmentFunction("listProviderAppointmentRequests", {});
  return response.requests || [];
}

export async function respondToProviderAppointmentRequest(requestId, decision, responseMessage = "", sessionDetails = {}) {
  try {
    const response = await invokeAppointmentFunction("respondToProviderAppointmentRequest", { requestId, decision, responseMessage, ...sessionDetails });
    return { ok: true, status: response.status, appointmentId: response.appointmentId };
  } catch (err) {
    trackSupportAction("sessions", "session_response_failed", err?.code);
    return { ok: false, error: err?.message || "Your response couldn’t be saved. Please try again." };
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
    if (!clientId) return [];
    const response = await invokeAppointmentFunction("listMyUpcomingAppointments", { from, to });
    return response.appointments || [];
  } catch (err) {
    console.error("Could not load client appointments:", err);
    throw err;
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
    if (!id || !data || !Object.keys(data).length) return { ok: false, error: "Choose an appointment change to save." };
    await invokeAppointmentFunction("updateProviderAppointment", { appointmentId: id, ...data });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "The appointment could not be updated. Please try again." };
  }
}

export async function confirmMyAppointment(id) {
  try {
    if (!id) return { ok: false, error: "Choose an appointment to confirm." };
    const response = await invokeAppointmentFunction("respondToMyAppointment", { appointmentId: id });
    return { ok: true, status: response.status };
  } catch (err) {
    return { ok: false, error: err?.message || "This appointment could not be confirmed. Please try again." };
  }
}

export async function requestAppointmentTimeChange(id, message = "") {
  try {
    if (!id) return { ok: false, error: "Choose an appointment first." };
    const response = await invokeAppointmentFunction("requestAppointmentChange", { appointmentId: id, message });
    return { ok: true, status: response.status };
  } catch (err) {
    return { ok: false, error: err?.message || "Your request could not be sent. Please try again." };
  }
}

export async function respondToAppointmentTimeChange(id, responseMessage = "") {
  try {
    if (!id) return { ok: false, error: "Choose an appointment first." };
    const response = await invokeAppointmentFunction("respondToAppointmentChangeRequest", {
      appointmentId: id,
      decision: "decline",
      responseMessage,
    });
    return { ok: true, status: response.status };
  } catch (err) {
    return { ok: false, error: err?.message || "The request response could not be saved." };
  }
}

/** Request a short-lived room token for a confirmed WellnessCafe video appointment. */
export async function requestAppointmentVideoToken(appointmentId) {
  if (!appointmentId || typeof appointmentId !== "string") {
    throw new Error("Choose a valid appointment before joining.");
  }
  const response = await invokeAppointmentFunction("createAppointmentVideoToken", { appointmentId });
  if (!response.serverUrl || !response.participantToken) {
    throw new Error("The private session room could not be prepared. Please try again.");
  }
  return response;
}

export default {
  createAppointment,
  listAppointmentsForProvider,
  listAppointmentsForProviderClient,
  listMyConnectedPractitioners,
  getMyProviderAvailability,
  saveMyProviderAvailability,
  getConnectedPractitionerAvailability,
  listMyAppointmentRequests,
  requestProviderAppointment,
  listProviderAppointmentRequests,
  respondToProviderAppointmentRequest,
  listAppointmentsForClient,
  updateAppointment,
  confirmMyAppointment,
  requestAppointmentTimeChange,
  respondToAppointmentTimeChange,
  requestAppointmentVideoToken,
};
