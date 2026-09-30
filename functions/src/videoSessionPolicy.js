const crypto = require("node:crypto");

const JOIN_EARLY_MS = 10 * 60 * 1000;
const JOIN_LATE_MS = 20 * 60 * 1000;

function millis(value) {
  if (value && typeof value.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return Date.parse(value);
  return NaN;
}

function deriveVideoRoomAccess({ appointment, appointmentId, uid, now = Date.now() }) {
  if (!appointment || typeof appointment !== "object") return { ok: false, reason: "not-found" };
  if (!uid || ![appointment.clientId, appointment.providerId].includes(uid)) return { ok: false, reason: "not-participant" };
  if (appointment.sessionFormat !== "wellnesscafe-video") return { ok: false, reason: "not-in-app-video" };
  if (appointment.status !== "confirmed") return { ok: false, reason: "not-confirmed" };

  const start = millis(appointment.startAt);
  const end = millis(appointment.endAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return { ok: false, reason: "invalid-time" };
  if (now < start - JOIN_EARLY_MS || now > end + JOIN_LATE_MS) return { ok: false, reason: "outside-join-window" };

  const role = uid === appointment.providerId ? "practitioner" : "client";
  const roomId = crypto.createHash("sha256").update(`wellnesscafe:${appointmentId}`).digest("hex").slice(0, 32);
  const participantId = crypto.createHash("sha256").update(`${appointmentId}:${uid}`).digest("hex").slice(0, 32);
  return { ok: true, role, roomName: `wc-${roomId}`, participantIdentity: `${role}-${participantId}` };
}

module.exports = { deriveVideoRoomAccess, JOIN_EARLY_MS, JOIN_LATE_MS };
