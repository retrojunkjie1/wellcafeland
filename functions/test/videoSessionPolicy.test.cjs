const test = require("node:test");
const assert = require("node:assert/strict");
const { deriveVideoRoomAccess, JOIN_EARLY_MS, JOIN_LATE_MS } = require("../src/videoSessionPolicy");
const { __test } = require("../src/videoSessions");

const now = Date.parse("2026-09-27T18:00:00.000Z");
const appointment = {
  clientId: "client-123",
  providerId: "provider-456",
  status: "confirmed",
  sessionFormat: "wellnesscafe-video",
  startAt: new Date(now + 5 * 60 * 1000),
  endAt: new Date(now + 50 * 60 * 1000),
};

test("only confirmed appointment participants receive opaque room identities", () => {
  const client = deriveVideoRoomAccess({ appointment, appointmentId: "appointment-1", uid: "client-123", now });
  const practitioner = deriveVideoRoomAccess({ appointment, appointmentId: "appointment-1", uid: "provider-456", now });
  assert.equal(client.ok, true);
  assert.equal(practitioner.ok, true);
  assert.equal(client.role, "client");
  assert.equal(practitioner.role, "practitioner");
  assert.equal(client.roomName, practitioner.roomName);
  assert.notEqual(client.participantIdentity, practitioner.participantIdentity);
  assert.equal(client.roomName.includes("appointment-1"), false);
  assert.equal(client.participantIdentity.includes("client-123"), false);
});

test("rejects nonparticipants, unconfirmed bookings, and external-link sessions", () => {
  assert.equal(deriveVideoRoomAccess({ appointment, appointmentId: "a", uid: "stranger", now }).reason, "not-participant");
  assert.equal(deriveVideoRoomAccess({ appointment: { ...appointment, status: "scheduled" }, appointmentId: "a", uid: "client-123", now }).reason, "not-confirmed");
  assert.equal(deriveVideoRoomAccess({ appointment: { ...appointment, sessionFormat: "video" }, appointmentId: "a", uid: "client-123", now }).reason, "not-in-app-video");
});

test("opens 10 minutes before start and closes 20 minutes after end", () => {
  assert.equal(deriveVideoRoomAccess({ appointment: { ...appointment, startAt: new Date(now + JOIN_EARLY_MS) }, appointmentId: "a", uid: "client-123", now }).ok, true);
  assert.equal(deriveVideoRoomAccess({ appointment: { ...appointment, startAt: new Date(now + JOIN_EARLY_MS + 1) }, appointmentId: "a", uid: "client-123", now }).reason, "outside-join-window");
  const endedAppointment = { ...appointment, startAt: new Date(now - 60 * 60 * 1000) };
  assert.equal(deriveVideoRoomAccess({ appointment: { ...endedAppointment, endAt: new Date(now - JOIN_LATE_MS) }, appointmentId: "a", uid: "client-123", now }).ok, true);
  assert.equal(deriveVideoRoomAccess({ appointment: { ...endedAppointment, endAt: new Date(now - JOIN_LATE_MS - 1) }, appointmentId: "a", uid: "client-123", now }).reason, "outside-join-window");
});

test("mints a short-lived, room-scoped token with only camera and microphone publishing", async () => {
  const token = await __test.createParticipantToken({ apiKey: "test-key", apiSecret: "test-secret", roomName: "wc-room-123", participantIdentity: "client-opaque", role: "client" });
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  assert.equal(payload.sub, "client-opaque");
  assert.equal(payload.name, "Client");
  assert.equal(payload.video.room, "wc-room-123");
  assert.equal(payload.video.roomJoin, true);
  assert.equal(payload.video.canPublish, true);
  assert.deepEqual(payload.video.canPublishSources, ["camera", "microphone"]);
  assert.equal(payload.video.canPublishData, false);
  assert.ok(payload.exp - payload.nbf <= 300);
});

test("accepts only secure video server URLs, with localhost allowed in emulator", () => {
  assert.equal(__test.validServerUrl("wss://video.wellnesscafe.example"), true);
  assert.equal(__test.validServerUrl("ws://127.0.0.1:7880", true), true);
  assert.equal(__test.validServerUrl("ws://video.wellnesscafe.example", false), false);
  assert.equal(__test.validServerUrl("https://video.wellnesscafe.example", false), false);
});
