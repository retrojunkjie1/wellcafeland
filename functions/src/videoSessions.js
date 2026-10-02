const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { AccessToken, TrackSource } = require("livekit-server-sdk");
const { deriveVideoRoomAccess } = require("./videoSessionPolicy");
const { requireVerifiedAccount } = require("./accountAccess");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const LIVEKIT_API_KEY = defineSecret("LIVEKIT_API_KEY");
const LIVEKIT_API_SECRET = defineSecret("LIVEKIT_API_SECRET");
const REGION = "us-central1";

function validServerUrl(value, allowLocal = false) {
  try {
    const url = new URL(value);
    return url.protocol === "wss:" || (allowLocal && url.protocol === "ws:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
    return false;
  }
}

async function createParticipantToken({ apiKey, apiSecret, roomName, participantIdentity, role }) {
  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: role === "practitioner" ? "Practitioner" : "Client",
    ttl: "5m",
  });
  accessToken.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: false,
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
  });
  return accessToken.toJwt();
}

exports.createAppointmentVideoToken = onCall({
  region: REGION,
  secrets: [LIVEKIT_API_KEY, LIVEKIT_API_SECRET],
  enforceAppCheck: true,
}, async (request) => {
  const uid = requireVerifiedAccount(request, "join your WellnessCafe session");

  const appointmentId = typeof request.data?.appointmentId === "string" ? request.data.appointmentId.trim() : "";
  if (!appointmentId || appointmentId.length > 128 || appointmentId.includes("/")) {
    throw new HttpsError("invalid-argument", "Choose a valid appointment.");
  }

  const appointmentRef = db.collection("appointments").doc(appointmentId);
  const appointmentSnapshot = await appointmentRef.get();
  if (!appointmentSnapshot.exists) throw new HttpsError("not-found", "This appointment could not be found.");
  const appointment = appointmentSnapshot.data();
  const access = deriveVideoRoomAccess({ appointment, appointmentId, uid });
  if (!access.ok) {
    if (access.reason === "not-participant") throw new HttpsError("permission-denied", "Only the client and practitioner on this appointment can join.");
    if (access.reason === "not-in-app-video") throw new HttpsError("failed-precondition", "This appointment is not set up for an in-app WellnessCafe video room.");
    if (access.reason === "not-confirmed") throw new HttpsError("failed-precondition", "Both people must confirm the appointment before joining.");
    if (access.reason === "outside-join-window") throw new HttpsError("failed-precondition", "The room opens 10 minutes before the appointment and closes shortly after it ends.");
    throw new HttpsError("failed-precondition", "The appointment details are incomplete, so this room cannot open.");
  }

  const connection = await db.collection("clientProviderAssignments")
    .where("providerId", "==", appointment.providerId)
    .where("clientId", "==", appointment.clientId)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (connection.empty) throw new HttpsError("permission-denied", "The practitioner connection for this appointment is no longer active.");

  const serverUrl = process.env.LIVEKIT_URL || "";
  const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";
  const apiKey = LIVEKIT_API_KEY.value();
  const apiSecret = LIVEKIT_API_SECRET.value();
  if (!validServerUrl(serverUrl, isEmulator) || !apiKey || !apiSecret) {
    throw new HttpsError("failed-precondition", "WellnessCafe video rooms are not configured for this environment yet.");
  }

  const participantToken = await createParticipantToken({
    apiKey,
    apiSecret,
    roomName: access.roomName,
    participantIdentity: access.participantIdentity,
    role: access.role,
  });
  return {
    serverUrl,
    participantToken,
    role: access.role,
    tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
});

exports.__test = { createParticipantToken, validServerUrl };
