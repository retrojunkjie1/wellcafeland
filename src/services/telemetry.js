// src/services/telemetry.js

// PHASE H: Enhanced Analytics
// - User behavior analytics and insights
// - Conversion funnel tracking
// - A/B testing infrastructure
// - Real-time analytics dashboard

import { getAnonymousUserId } from "../lib/userId";
import { auth } from "../firebase";
import { logError } from "@/lib/logger";
import { callAiSession } from "@/services/aiSessionClient";

// in-memory buffer so Admin can see something even before backend wiring
const telemetryBuffer = [];

const TELEMETRY_PAGE_IDS = new Set([
  "home", "provider_client_detail", "session_template_detail", "tools", "session_viewer",
  "session_composer", "provider_dashboard", "sessions_templates", "session_preview",
  "daily-practice", "recovery", "support_hub", "profile", "admin_sessions", "agents",
  "overseer_console",
]);

const TELEMETRY_ACTION_IDS = new Set([
  "tool_usage", "session_started", "session_viewer_begin", "session_viewer_repeat",
  "session_viewer_done", "session_viewer_share", "session_viewer_copy_link",
  "tool_visualization_start", "tool_affirmations_generate", "tool_acuwellness_complete",
  "recovery_repeat_last_from_recovery", "recovery_open_sessions",
  "recovery_open_composer_from_recommendation", "tool_open_in_chat", "tool_card_click",
  "admin_session_edit_click", "admin_session_delete_click", "admin_session_duplicate_click",
  "overseer_test_agent", "overseer_refresh_registry", "overseer_toggle_agent",
  "overseer_reset_agent",
]);

const sanitizeEvent = (event = {}) => {
  if (event.kind === "page_view" && TELEMETRY_PAGE_IDS.has(event.path)) {
    return { kind: "page_view", path: event.path };
  }
  if (event.kind === "action" && TELEMETRY_ACTION_IDS.has(event.actionId)) {
    if (event.actionId === "tool_usage") {
      const rawToolId = event.meta?.toolId;
      const toolId = typeof rawToolId === "string" && /^[a-z0-9][a-z0-9._-]{0,79}$/i.test(rawToolId)
        ? rawToolId.toLowerCase()
        : "other";
      const rawDuration = Number(event.meta?.durationMs);
      const durationMs = Number.isFinite(rawDuration) && rawDuration >= 0
        ? Math.min(86_400_000, Math.round(rawDuration))
        : 0;
      return { kind: "action", actionId: "tool_usage", meta: { toolId, durationMs } };
    }
    return { kind: "action", actionId: event.actionId };
  }
  return null;
};

const basePayload = () => {
  const userId = auth?.currentUser?.uid || getAnonymousUserId();
  return {
    source: "wellnesscafe-os",
    clientId: userId, // For provider mode compatibility
    userId, // Keep for backward compatibility
    timestamp: new Date().toISOString(),
    ts: new Date().toISOString(), // Keep for backward compatibility
  };
};

const safeFetch = async (body) => {
  try {
    await callAiSession(body);
  } catch (err) {
    // don't ever crash the UI because telemetry failed
    logError("telemetry", err, {
      file: "telemetry.js",
      function: "safeFetch",
    });
  }
};

export const trackEvent = async (event) => {
  const safeEvent = sanitizeEvent(event);
  if (!safeEvent) return;
  const payload = {
    ...basePayload(),
    type: "event",
    event: {
      ...safeEvent,
      timestamp: new Date().toISOString(),
    },
  };
  
  telemetryBuffer.push(payload);
  if (telemetryBuffer.length > 200) {
    telemetryBuffer.shift();
  }
  
  await safeFetch({ mode: "telemetry", event: payload });
};

export const trackPageView = async (path)=>{
  await trackEvent({kind:"page_view",path});
};

export const trackAction = async (actionId,meta)=>{
  await trackEvent({kind:"action",actionId,meta});
};

export const trackError = async (where,message)=>{
  // Runtime errors use the closed-vocabulary support-activity channel. Never
  // persist free-form exception text through this legacy analytics endpoint.
  void where;
  void message;
};

// simple snapshot so Admin console can read live counts
export const getTelemetrySnapshot = ()=>{
  const total=telemetryBuffer.length;
  const byKind={};
  telemetryBuffer.forEach((e)=>{
    const k=e.event?.kind||"unknown";
    byKind[k]=(byKind[k]||0)+1;
  });
  return{
    totalEvents:total,
    byKind,
    lastEvent:telemetryBuffer[total-1]||null
  };
};
