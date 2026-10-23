// src/services/healthService.js
// Health check service for monitoring system status
// Used only in admin/provider context

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";
import { getAppCheckHeaders } from "@/services/appCheckHeaders";

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds

/**
 * Check Firestore connectivity
 */
export async function checkFirestore() {
  if (!db) {
    return { ok: false, error: "Firestore not configured", latencyMs: null };
  }

  const startTime = Date.now();
  try {
    const testDoc = doc(db, "_health", "check");
    await Promise.race([
      getDoc(testDoc),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), HEALTH_CHECK_TIMEOUT)
      ),
    ]);
    
    const latencyMs = Date.now() - startTime;
    return { ok: true, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logError("healthService", err, { check: "firestore" });
    return { 
      ok: false, 
      error: err.message || "Firestore check failed",
      latencyMs,
    };
  }
}

/**
 * Check Firebase Functions connectivity
 */
export async function checkFunctions() {
  const { buildApiUrl } = await import("@/services/apiBase");
  const endpoint = buildApiUrl("/globalResourceSearch");

  const startTime = Date.now();
  try {
    const response = await Promise.race([
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAppCheckHeaders() },
        body: JSON.stringify({ query: "health check" }),
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), HEALTH_CHECK_TIMEOUT)
      ),
    ]);

    const latencyMs = Date.now() - startTime;

    // The Function response also tells us whether its upstream search provider
    // returned live data or a saved-pathway fallback.
    const payload = response.status === 200 ? await response.json().catch(() => null) : null;
    const functionReachable = response.status === 400 || response.status === 200;
    const fallback = payload?.provider === "fallback" || payload?.meta?.fallback === true;
    const resourceSearch = response.status === 200
      ? {
          ok: payload?.ok === true && !fallback,
          latencyMs,
          ...((payload?.ok !== true || fallback) && {
            warning: payload?.message || "Live search is unavailable; saved support pathways may still be shown.",
          }),
        }
      : null;
    if (functionReachable) {
      return { ok: true, latencyMs, resourceSearch };
    }
    
    return { 
      ok: false, 
      error: `Functions returned status ${response.status}`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logError("healthService", err, { check: "functions" });
    return { 
      ok: false, 
      error: err.message || "Functions check failed",
      latencyMs,
    };
  }
}

/**
 * Check OpenAI connectivity (via Functions)
 */
export async function checkOpenAI() {
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || 
                      "https://us-central1-wellnesscafelanding.cloudfunctions.net";
  
  const startTime = Date.now();
  try {
    // Check multimodal endpoint (lightweight check)
    const response = await Promise.race([
      fetch(`${functionsUrl}/multimodalChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...await getAppCheckHeaders() },
        body: JSON.stringify({
          messages: [{ role: "user", content: "test" }],
          mode: "default",
        }),
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), HEALTH_CHECK_TIMEOUT)
      ),
    ]);

    const latencyMs = Date.now() - startTime;
    
    // 400/401/503 are expected for test calls, but mean service is reachable
    if (response.status === 400 || response.status === 401 || response.status === 503) {
      return { ok: true, latencyMs, warning: "Service reachable but may need configuration" };
    }
    
    if (response.ok) {
      return { ok: true, latencyMs };
    }
    
    return { 
      ok: false, 
      error: `OpenAI endpoint returned status ${response.status}`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logError("healthService", err, { check: "openai" });
    return { 
      ok: false, 
      error: err.message || "OpenAI check failed",
      latencyMs,
    };
  }
}

/**
 * Run all health checks
 */
export async function runAllHealthChecks() {
  logInfo("healthService", "Running all health checks");
  
  const [firestore, functions, openai] = await Promise.all([
    checkFirestore(),
    checkFunctions(),
    checkOpenAI(),
  ]);
  // Reuse the Function connectivity response so the admin panel makes one
  // upstream probe, not a second quota-consuming request.
  const rapidapi = functions.resourceSearch || {
    ok: false,
    error: "Live search status could not be confirmed through Firebase Functions.",
    latencyMs: null,
  };

  const allHealthy = firestore.ok && functions.ok && rapidapi.ok && openai.ok;
  
  return {
    healthy: allHealthy,
    checks: {
      firestore,
      functions,
      rapidapi,
      openai,
    },
    timestamp: new Date().toISOString(),
  };
}

export default {
  checkFirestore,
  checkFunctions,
  checkOpenAI,
  runAllHealthChecks,
};
