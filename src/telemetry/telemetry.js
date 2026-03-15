// src/telemetry/telemetry.js
// Client telemetry pipeline - NO CSP breakage, rate-limited, non-blocking

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";

let eventBuffer = [];
let lastFlushTime = 0;
const FLUSH_INTERVAL = 1000; // 1 second
const MAX_BUFFER_SIZE = 10;
let flushTimerId = null;
let isOnline = navigator.onLine;

// Track online/offline state
window.addEventListener("online", () => {
  isOnline = true;
  flushBuffer();
});
window.addEventListener("offline", () => {
  isOnline = false;
});

// Generate simple fingerprint for telemetry
function getFingerprint() {
  try {
    const stored = sessionStorage.getItem("wc_telemetry_fingerprint");
    if (stored) return stored;
    const fp = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("wc_telemetry_fingerprint", fp);
    return fp;
  } catch {
    return `fp_${Date.now()}`;
  }
}

const fingerprint = getFingerprint();

// Rate-limited flush to Firestore
async function flushBuffer() {
  if (!isOnline || eventBuffer.length === 0) return;
  
  const now = Date.now();
  if (now - lastFlushTime < FLUSH_INTERVAL) {
    scheduleFlush();
    return;
  }

  const toFlush = eventBuffer.splice(0, MAX_BUFFER_SIZE);
  lastFlushTime = now;

  try {
    const auth = getAuth();
    const user = auth?.currentUser;
    
    const batch = toFlush.map((event) => ({
      ...event,
      createdAt: serverTimestamp(),
      uid: user?.uid || null,
      email: user?.email || null,
      fingerprint,
    }));

    await Promise.all(
      batch.map((event) => addDoc(collection(db, "telemetry_events"), event))
    );

    if (eventBuffer.length > 0) {
      scheduleFlush();
    }
  } catch (err) {
    // Silently fail - telemetry should never break the app
    console.debug("[Telemetry] Failed to flush:", err);
    // Re-add events to buffer for retry
    eventBuffer.unshift(...toFlush);
  }
}

function scheduleFlush() {
  if (flushTimerId) return;
  flushTimerId = setTimeout(() => {
    flushTimerId = null;
    flushBuffer();
  }, FLUSH_INTERVAL);
}

// Main telemetry function
export function logTelemetry(type, metadata = {}) {
  const event = {
    level: metadata.level || "info",
    source: "client",
    type,
    metadata: {
      ...metadata,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.pathname,
      referrer: document.referrer || null,
    },
  };

  eventBuffer.push(event);

  if (eventBuffer.length >= MAX_BUFFER_SIZE) {
    flushBuffer();
  } else {
    scheduleFlush();
  }
}

// Route change tracking
let lastRoute = window.location.pathname;
export function trackRouteChange(newRoute) {
  if (newRoute !== lastRoute) {
    logTelemetry("ui", {
      level: "info",
      action: "route_change",
      from: lastRoute,
      to: newRoute,
    });
    lastRoute = newRoute;
  }
}

// Tool open/close tracking
export function trackToolOpen(toolId) {
  logTelemetry("tool", {
    level: "info",
    action: "tool_open",
    toolId,
  });
}

export function trackToolClose(toolId, duration = null) {
  logTelemetry("tool", {
    level: "info",
    action: "tool_close",
    toolId,
    duration,
  });
}

// Auth state tracking
export function trackAuthStateChange(state, metadata = {}) {
  logTelemetry("auth", {
    level: "info",
    action: "state_change",
    state,
    ...metadata,
  });
}

// Error tracking
export function trackError(error, context = {}) {
  logTelemetry("crash", {
    level: "error",
    error: {
      message: error?.message || String(error),
      stack: error?.stack?.substring(0, 500) || null,
      name: error?.name || "Unknown",
    },
    ...context,
  });
}

// Network tracking
export function trackNetworkEvent(type, metadata = {}) {
  logTelemetry("network", {
    level: metadata.level || "info",
    action: type,
    ...metadata,
  });
}

// Latency tracking
let requestTimings = [];
export function trackLatency(duration, endpoint) {
  requestTimings.push({ duration, endpoint, timestamp: Date.now() });
  // Keep last 100
  if (requestTimings.length > 100) {
    requestTimings.shift();
  }

  // Log if spike detected (> 3s)
  if (duration > 3000) {
    logTelemetry("network", {
      level: "warn",
      action: "latency_spike",
      duration,
      endpoint,
    });
  }
}

export function getMedianLatency() {
  if (requestTimings.length === 0) return null;
  const sorted = [...requestTimings].sort((a, b) => a.duration - b.duration);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid].duration;
}

// Offline/online tracking
let lastOnlineState = navigator.onLine;
window.addEventListener("online", () => {
  if (!lastOnlineState) {
    logTelemetry("network", {
      level: "info",
      action: "online",
    });
    lastOnlineState = true;
  }
});

window.addEventListener("offline", () => {
  if (lastOnlineState) {
    logTelemetry("network", {
      level: "warn",
      action: "offline",
    });
    lastOnlineState = false;
  }
});

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (eventBuffer.length > 0) {
      // Use sendBeacon if available for final flush
      try {
        const data = JSON.stringify(eventBuffer.slice(0, 10));
        navigator.sendBeacon?.("/api/telemetry", data);
      } catch {
        // Ignore
      }
    }
  });
}

// Initialize route tracking
if (typeof window !== "undefined") {
  trackRouteChange(window.location.pathname);
}

// Runtime tracking (user_runtime/{uid})
let runtimeUpdateQueue = {};
let lastRuntimeUpdate = 0;
const RUNTIME_UPDATE_INTERVAL = 5000; // 5 seconds

export async function setRuntimePatch(patch) {
  try {
    const auth = getAuth();
    const user = auth?.currentUser;
    if (!user?.uid || !db) return;

    const now = Date.now();
    if (now - lastRuntimeUpdate < RUNTIME_UPDATE_INTERVAL) {
      // Merge into queue, will flush later
      runtimeUpdateQueue = { ...runtimeUpdateQueue, ...patch };
      scheduleRuntimeFlush();
      return;
    }

    // Flush immediately
    runtimeUpdateQueue = { ...runtimeUpdateQueue, ...patch };
    await flushRuntime();
  } catch (err) {
    // Silently fail - runtime tracking not critical
    console.debug("[Telemetry] Failed to update runtime:", err);
  }
}

async function flushRuntime() {
  if (Object.keys(runtimeUpdateQueue).length === 0) return;

  try {
    const auth = getAuth();
    const user = auth?.currentUser;
    if (!user?.uid || !db) return;

    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    await setDoc(
      doc(db, "user_runtime", user.uid),
      {
        ...runtimeUpdateQueue,
        lastActiveAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    lastRuntimeUpdate = Date.now();
    runtimeUpdateQueue = {};
  } catch (err) {
    console.debug("[Telemetry] Failed to flush runtime:", err);
  }
}

let runtimeFlushTimer = null;
function scheduleRuntimeFlush() {
  if (runtimeFlushTimer) return;
  runtimeFlushTimer = setTimeout(() => {
    runtimeFlushTimer = null;
    flushRuntime();
  }, RUNTIME_UPDATE_INTERVAL);
}

// Initialize telemetry
export function initTelemetry({ auth, db: dbInstance }) {
  // Store references if needed for future use
  if (dbInstance) {
    // db is already imported at top level
  }
}

