import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

const FEATURE_RULES = [
  [/^\/admin(?:\/|$)/, "admin"],
  [/^\/assistance(?:\/|$)|^\/recovery\/meetings(?:\/|$)/, "assistance"],
  [/^\/provider\/schedule(?:\/|$)/, "schedule"],
  [/^\/provider(?:\/|$)|^\/providers(?:\/|$)/, "providers"],
  [/^\/my-sessions(?:\/|$)|^\/sessions(?:\/|$)/, "sessions"],
  [/^\/check-in(?:\/|$)|^\/milestones(?:\/|$)/, "check_in"],
  [/^\/tools(?:\/|$)/, "practice"],
  [/^\/guide(?:\/|$)/, "guide"],
  [/^\/profile(?:\/|$)/, "profile"],
  [/^\/settings(?:\/|$)/, "settings"],
  [/^\/(?:home)?$/, "home"],
];
const SUPPORT_FEATURES = new Set([
  "home", "assistance", "providers", "schedule", "sessions", "check_in",
  "practice", "guide", "profile", "settings", "admin", "account", "other",
]);
const SUPPORT_EVENTS = new Set([
  "page_opened", "action_started", "action_succeeded", "action_failed",
  "connection_lost", "connection_restored", "runtime_error", "account_event",
  "search_results", "search_empty", "workspace_changed", "check_in_saved",
  "check_in_save_failed", "practice_added", "practice_opened", "practice_dismissed",
  "practice_action_failed", "session_request_sent", "session_request_failed",
  "session_request_accepted", "session_request_declined", "session_response_failed",
  "message_sent", "message_send_failed", "connection_request_sent",
  "connection_request_received", "connection_request_failed", "connection_request_accepted",
  "connection_request_declined", "connection_response_failed", "session_request_received",
  "message_received",
]);
const SERVER_ONLY_EVENTS = new Set([
  "connection_request_sent", "connection_request_received", "connection_request_accepted",
  "connection_request_declined", "session_request_sent", "session_request_received",
  "session_request_accepted", "session_request_declined", "message_sent", "message_received",
]);
const WORKSPACES = new Set(["client", "practitioner", "giver", "admin"]);
const REQUIRED_FEATURE = {
  workspace_changed: "account",
  check_in_saved: "check_in",
  check_in_save_failed: "check_in",
  practice_added: "practice",
  practice_opened: "practice",
  practice_dismissed: "practice",
  practice_action_failed: "practice",
  session_request_sent: "sessions",
  session_request_received: "sessions",
  session_request_failed: "sessions",
  session_request_accepted: "sessions",
  session_request_declined: "sessions",
  session_response_failed: "sessions",
  message_sent: "sessions",
  message_received: "sessions",
  message_send_failed: "sessions",
  connection_request_sent: "providers",
  connection_request_received: "providers",
  connection_request_failed: "providers",
  connection_request_accepted: "providers",
  connection_request_declined: "providers",
  connection_response_failed: "providers",
};

function currentFeature() {
  const path = typeof window === "undefined" ? "/" : window.location.pathname;
  return FEATURE_RULES.find(([pattern]) => pattern.test(path))?.[1] || "other";
}

function safeErrorCode(value) {
  if (typeof value !== "string") return "";
  const candidate = value.toLowerCase().replace(/[^a-z0-9/_-]/g, "").slice(0, 64);
  return /^(functions|auth|firestore|storage)\/[a-z0-9_-]+$/.test(candidate) ? candidate : "";
}

let eventsThisMinute = 0;
let eventWindowStartedAt = Date.now();
let lastTrackedPath = "";

function sendSupportEvent(eventCode, errorCode = "", context = {}) {
  if (!auth.currentUser || auth.currentUser.isAnonymous) return;
  const now = Date.now();
  if (now - eventWindowStartedAt >= 60_000) {
    eventsThisMinute = 0;
    eventWindowStartedAt = now;
  }
  if (eventsThisMinute >= 20) return;
  eventsThisMinute += 1;
  httpsCallable(functions, "recordSupportActivity", { timeout: 5000 })({
    feature: SUPPORT_FEATURES.has(context.feature) ? context.feature : currentFeature(),
    eventCode,
    errorCode: safeErrorCode(errorCode),
    ...(eventCode === "workspace_changed" && WORKSPACES.has(context.workspace) ? { workspace: context.workspace } : {}),
  }).catch(() => {
    // Troubleshooting activity must never interrupt the user's task.
  });
}

/** Record a named, privacy-safe support step. Caller content is never forwarded. */
export function trackSupportAction(feature, eventCode, errorCode = "", workspace = "") {
  if (!SUPPORT_FEATURES.has(feature) || !SUPPORT_EVENTS.has(eventCode)) return;
  if (SERVER_ONLY_EVENTS.has(eventCode)) return;
  if (REQUIRED_FEATURE[eventCode] && REQUIRED_FEATURE[eventCode] !== feature) return;
  if (eventCode !== "workspace_changed" && workspace) return;
  if (eventCode === "workspace_changed" && !WORKSPACES.has(workspace)) return;
  sendSupportEvent(eventCode, errorCode, { feature, workspace });
}

// Compatibility entry point for existing app instrumentation. Only a small,
// fixed vocabulary is retained; caller-provided metadata is never transmitted.
export function logTelemetry(type, metadata = {}) {
  if (type === "function_call") {
    if (metadata?.success === true) sendSupportEvent("action_succeeded");
    else if (metadata?.authenticated === true && metadata?.hasToken === true) sendSupportEvent("action_started");
    else if (metadata?.error || metadata?.level === "error") sendSupportEvent("action_failed", metadata?.errorCode);
    return;
  }
  if (type === "directory_search") {
    sendSupportEvent(metadata?.hasResults === true ? "search_results" : "search_empty");
    return;
  }
  if (type === "admin_access") {
    sendSupportEvent("account_event");
    return;
  }
  if (type === "user_created" || type === "auth") {
    sendSupportEvent("account_event");
    return;
  }
  if (type === "ui") {
    sendSupportEvent("page_opened");
    return;
  }
  if (type === "tool") {
    sendSupportEvent("action_succeeded");
    return;
  }
  if (type === "crash") {
    sendSupportEvent("runtime_error");
    return;
  }
  if (type === "network") {
    if (metadata?.action === "offline") sendSupportEvent("connection_lost");
    else if (metadata?.action === "online") sendSupportEvent("connection_restored");
    else if (metadata?.action === "network_status" && metadata?.state === "offline") sendSupportEvent("connection_lost");
    else if (metadata?.action === "network_status" && metadata?.state === "online") sendSupportEvent("connection_restored");
    else if (metadata?.action === "request_error") sendSupportEvent("action_failed", metadata?.errorCode);
  }
}

export function trackRouteChange(path = typeof window === "undefined" ? "/" : window.location.pathname) {
  if (path === lastTrackedPath) return;
  lastTrackedPath = path;
  sendSupportEvent("page_opened");
}

export function trackToolOpen() {
  sendSupportEvent("action_started");
}

export function trackToolClose() {
  sendSupportEvent("action_succeeded");
}

export function trackAuthStateChange() {
  sendSupportEvent("account_event");
}

export function trackError(error) {
  sendSupportEvent("runtime_error", error?.code);
}

export function trackNetworkEvent(type, metadata = {}) {
  if (type === "offline" || (type === "network_status" && metadata?.state === "offline")) sendSupportEvent("connection_lost");
  else if (type === "online" || (type === "network_status" && metadata?.state === "online")) sendSupportEvent("connection_restored");
  else if (type === "request_error") sendSupportEvent("action_failed", metadata?.errorCode);
}

const requestTimings = [];
export function trackLatency(duration) {
  if (Number.isFinite(duration)) {
    requestTimings.push({ duration, timestamp: Date.now() });
    if (requestTimings.length > 100) requestTimings.shift();
    if (duration > 3000) sendSupportEvent("action_failed");
  }
}

export function getMedianLatency() {
  if (requestTimings.length === 0) return null;
  const sorted = requestTimings.map(({ duration }) => duration).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
