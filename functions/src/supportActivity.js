const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { requireAdminScope } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const COLLECTION = "support_activity_events";
const FEATURES = new Set([
  "home", "assistance", "providers", "schedule", "sessions", "check_in",
  "practice", "guide", "profile", "settings", "admin", "account", "other",
]);
const EVENTS = new Set([
  "page_opened", "action_started", "action_succeeded", "action_failed",
  "connection_lost", "connection_restored", "runtime_error", "account_event",
  "search_results", "search_empty", "workspace_changed", "check_in_saved",
  "check_in_save_failed", "practice_added", "practice_opened", "practice_dismissed",
  "practice_action_failed", "session_request_sent", "session_request_failed",
  "session_request_accepted", "session_request_declined", "session_response_failed",
  "message_sent", "message_send_failed", "connection_request_sent",
  "connection_request_received", "connection_request_failed", "connection_request_accepted",
  "connection_request_declined", "connection_response_failed", "connection_ended", "session_request_received",
  "message_received",
]);
const SERVER_EVENTS = new Set([
  "connection_request_sent", "connection_request_received", "connection_request_accepted",
  "connection_request_declined", "connection_ended", "session_request_sent", "session_request_received",
  "session_request_accepted", "session_request_declined", "message_sent", "message_received",
]);
const WORKSPACES = new Set(["client", "practitioner", "giver", "admin"]);
const REQUIRED_FEATURE = new Map([
  ["workspace_changed", "account"],
  ["check_in_saved", "check_in"],
  ["check_in_save_failed", "check_in"],
  ["practice_added", "practice"],
  ["practice_opened", "practice"],
  ["practice_dismissed", "practice"],
  ["practice_action_failed", "practice"],
  ["session_request_sent", "sessions"],
  ["session_request_received", "sessions"],
  ["session_request_failed", "sessions"],
  ["session_request_accepted", "sessions"],
  ["session_request_declined", "sessions"],
  ["session_response_failed", "sessions"],
  ["message_sent", "sessions"],
  ["message_received", "sessions"],
  ["message_send_failed", "sessions"],
  ["connection_request_sent", "providers"],
  ["connection_request_received", "providers"],
  ["connection_request_failed", "providers"],
  ["connection_request_accepted", "providers"],
  ["connection_request_declined", "providers"],
  ["connection_ended", "providers"],
  ["connection_response_failed", "providers"],
]);
const RATE_LIMIT = new Map();

async function recordTrustedSupportActivity(events) {
  const records = Array.isArray(events) ? events : [events];
  const batch = db.batch();
  const seen = new Set();
  for (const event of records) {
    const uid = typeof event?.uid === "string" ? event.uid.trim() : "";
    const { feature, eventCode } = event || {};
    if (!/^[A-Za-z0-9:_-]{1,128}$/.test(uid) || !SERVER_EVENTS.has(eventCode)
      || !FEATURES.has(feature) || REQUIRED_FEATURE.get(eventCode) !== feature) continue;
    const uniqueKey = `${uid}:${feature}:${eventCode}`;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);
    const ref = db.collection(COLLECTION).doc();
    batch.set(ref, {
      uid,
      feature,
      eventCode,
      errorCode: "",
      workspace: "",
      source: "server",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
  if (!seen.size) return;
  try {
    await batch.commit();
  } catch (error) {
    // Support logging must never roll back or block the successful user action.
    console.error("[supportActivity] Trusted event write failed", { code: error?.code || "UNKNOWN" });
  }
}

function validCode(value) {
  return typeof value === "string" && /^[a-z0-9_/-]{1,64}$/i.test(value) ? value : "";
}

function enforceRateLimit(uid) {
  const now = Date.now();
  const current = RATE_LIMIT.get(uid);
  if (!current || now - current.startedAt >= 60_000) {
    RATE_LIMIT.set(uid, { startedAt: now, count: 1 });
    if (RATE_LIMIT.size > 2000) {
      for (const [key, value] of RATE_LIMIT) if (now - value.startedAt >= 60_000) RATE_LIMIT.delete(key);
    }
    return;
  }
  current.count += 1;
  if (current.count > 40) throw new HttpsError("resource-exhausted", "Activity logging is temporarily rate-limited.");
}

const recordSupportActivity = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to record support activity.");
  }
  const { feature, eventCode, errorCode = "", workspace = "" } = request.data || {};
  if (!FEATURES.has(feature) || !EVENTS.has(eventCode) || SERVER_EVENTS.has(eventCode)
    || (REQUIRED_FEATURE.has(eventCode) && REQUIRED_FEATURE.get(eventCode) !== feature)
    || (eventCode === "workspace_changed" && !WORKSPACES.has(workspace))
    || (eventCode !== "workspace_changed" && workspace)) {
    throw new HttpsError("invalid-argument", "This activity could not be recorded.");
  }
  enforceRateLimit(uid);
  const safeErrorCode = validCode(errorCode);
  try {
    await db.collection(COLLECTION).add({
      uid,
      feature,
      eventCode,
      errorCode: safeErrorCode,
      workspace: eventCode === "workspace_changed" ? workspace : "",
      source: "reported",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return { recorded: true };
  } catch (error) {
    console.error("[supportActivity] Event write failed", { code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Support activity could not be recorded.");
  }
});

const listSupportActivityForAdmin = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "support.activity.read");
  const uid = typeof request.data?.uid === "string" ? request.data.uid.trim() : "";
  if (!/^[A-Za-z0-9:_-]{1,128}$/.test(uid)) {
    throw new HttpsError("invalid-argument", "Choose an account before loading its support activity.");
  }
  const since = admin.firestore.Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const snapshot = await db.collection(COLLECTION)
      .where("uid", "==", uid)
      .where("createdAt", ">=", since)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    return {
      events: snapshot.docs.map((doc) => {
        const event = doc.data();
        return {
          id: doc.id,
          feature: FEATURES.has(event.feature) ? event.feature : "other",
          eventCode: EVENTS.has(event.eventCode) ? event.eventCode : "action_failed",
          errorCode: validCode(event.errorCode),
          workspace: event.eventCode === "workspace_changed" && WORKSPACES.has(event.workspace) ? event.workspace : "",
          source: event.source === "server" || event.source === "reported" ? event.source : "",
          createdAt: event.createdAt?.toDate?.()?.toISOString?.() || null,
        };
      }),
    };
  } catch (error) {
    console.error("[supportActivity] Admin read failed", { adminUid: request.auth.uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "Support activity could not be loaded. Try again.");
  }
});

module.exports = { recordSupportActivity, listSupportActivityForAdmin, recordTrustedSupportActivity };
