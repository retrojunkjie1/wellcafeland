// src/services/healthService.js
// Health check service for monitoring system status
// Used only in admin/provider context

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { logError, logInfo } from "./logService";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "health check" }),
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), HEALTH_CHECK_TIMEOUT)
      ),
    ]);

    const latencyMs = Date.now() - startTime;
    
    // Even if it returns an error, if we got a response, the service is reachable
    if (response.status === 400 || response.status === 200) {
      return { ok: true, latencyMs };
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
 * Check RapidAPI connectivity
 */
export async function checkRapidAPI() {
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const rapidApiHost = import.meta.env.VITE_RAPIDAPI_HOST || 
                      "real-time-web-search.p.rapidapi.com";
  const searchUrl = import.meta.env.VITE_RAPIDAPI_SEARCH_URL ||
                    "https://real-time-web-search.p.rapidapi.com/search";

  if (!rapidApiKey) {
    return { ok: false, error: "RapidAPI key not configured", latencyMs: null };
  }

  const startTime = Date.now();
  try {
    const response = await Promise.race([
      fetch(`${searchUrl}?q=test&limit=1`, {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": rapidApiHost,
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), HEALTH_CHECK_TIMEOUT)
      ),
    ]);

    const latencyMs = Date.now() - startTime;
    
    if (response.ok || response.status === 429) {
      // 429 means rate limited but service is up
      return { ok: true, latencyMs, warning: "Rate limited" };
    }
    
    return { 
      ok: false, 
      error: `RapidAPI returned status ${response.status}`,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logError("healthService", err, { check: "rapidapi" });
    return { 
      ok: false, 
      error: err.message || "RapidAPI check failed",
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
        headers: { "Content-Type": "application/json" },
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
  
  const [firestore, functions, rapidapi, openai] = await Promise.all([
    checkFirestore(),
    checkFunctions(),
    checkRapidAPI(),
    checkOpenAI(),
  ]);

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
  checkRapidAPI,
  checkOpenAI,
  runAllHealthChecks,
};

