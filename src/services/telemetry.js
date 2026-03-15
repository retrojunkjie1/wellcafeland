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
  const payload = {
    ...basePayload(),
    type: "event",
    event: {
      ...event,
      // Ensure event has required fields
      kind: event.kind || "unknown",
      timestamp: event.timestamp || new Date().toISOString(),
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
  await trackEvent({kind:"error",where,message});
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

