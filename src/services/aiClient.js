// src/services/aiClient.js
// Robust AI network client with retries, timeout, offline detection
// Chat UI entry found at: src/components/os/ChatPanel.jsx (used by src/apps/chat/ChatPage.jsx)

import { getCorrelationId } from "@/utils/correlation";
import { logDebug, isDebugEnabled } from "@/lib/debug";
import { updateChatDiagnostics } from "@/lib/chatDiagnostics";
import { resolveFunctionsBaseUrl } from "@/lib/functionsUrl";

/**
 * @typedef {Object} AIClientResult
 * @property {boolean} ok - Whether the request succeeded
 * @property {string} [text] - Response text content
 * @property {string} [error] - Error message if failed
 * @property {number} [status] - HTTP status code
 * @property {Object} [meta] - Additional metadata
 * @property {string} [correlationId] - Request correlation ID
 */

const DEBUG = import.meta.env.DEV;

// Structured logging helper
function logRequest(level, correlationId, data) {
  const logData = {
    correlationId,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  if (DEBUG) {
    console[level]("[AIClient]", logData);
  }
  
  // In production, could send to telemetry
  try {
    if (import.meta.env.PROD && typeof window !== "undefined" && window.__wc_telemetry) {
      window.__wc_telemetry.log({
        event: "ai_client_request",
        level,
        ...logData,
      });
    }
  } catch {
    // Non-blocking
  }
}

const BASE_URL = resolveFunctionsBaseUrl();

if (import.meta.env.DEV && typeof window !== "undefined") {
  logDebug("AIClient", { BASE_URL, hostname: window.location.hostname });
}

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const MAX_BACKOFF = 30000;
const TIMEOUT_MS = 15000; // 15s max

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkOnline() {
  if (typeof navigator === "undefined") return true;
  if (!navigator.onLine) return false;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("/favicon.ico", { 
      method: "HEAD", 
      cache: "no-cache", 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Call AI endpoint with retries and offline detection
 * @param {string} endpoint - API endpoint path (e.g., "aiSession")
 * @param {Object} body - Request body
 * @param {AbortController} [abortController] - Optional abort controller
 * @returns {Promise<AIClientResult>}
 */
export async function callAI(endpoint, body = {}, abortController = null) {
  // Generate correlation ID for this request
  const correlationId = getCorrelationId();
  
  // Map endpoint to actual function name
  const endpointMap = {
    "multimodalChat": "aiSession",
    "aiSession": "aiSession",
    "chat": "aiSession",
  };
  const actualEndpoint = endpointMap[endpoint] || endpoint;
  const url = `${BASE_URL.replace(/\/+$/, "")}/${actualEndpoint}`;
  
  logDebug("Chat", {
    projectId: "wellnesscafelanding",
    functionsBaseUrl: BASE_URL,
    chatEndpoint: url,
    actualEndpoint,
  });
  
  // Structured logging
  logRequest("log", correlationId, {
    action: "request_start",
    endpoint: actualEndpoint,
    url,
    bodyKeys: Object.keys(body || {}),
    toolIntent: body.mode || body.metadata?.toolIntent || null,
  });
  
  // CRITICAL: Fail hard if production is pointing to localhost
  if (import.meta.env.PROD && (url.includes("localhost") || url.includes("127.0.0.1"))) {
    const error = "CRITICAL: Production build is pointing to localhost. Check VITE_FIREBASE_FUNCTIONS_URL.";
    console.error("[AIClient]", error, { url, env: import.meta.env.MODE });
    logRequest("error", correlationId, {
      action: "config_error",
      error: "localhost_in_production",
      url,
    });
    return {
      ok: false,
      error: "Configuration error. Please contact support.",
      status: 500,
      correlationId,
    };
  }

  let attemptCount = 0;
  let lastError = null;
  let timeoutId = null;

  // Check offline before retry
  while (attemptCount < MAX_RETRIES) {
    attemptCount++;

    if (attemptCount > 1) {
      const isOnline = await checkOnline();
      if (!isOnline) {
        return {
          ok: false,
          error: "Offline. Please check your connection.",
          status: 0,
        };
      }

      const delay = Math.min(
        RETRY_DELAY_BASE * Math.pow(2, attemptCount - 2),
        MAX_BACKOFF
      );
      await sleep(delay);
    }

    try {
      // Create timeout controller
      const timeoutController = new AbortController();
      timeoutId = setTimeout(() => {
        timeoutController.abort();
      }, TIMEOUT_MS);

      // Combine abort signals
      const combinedSignal = abortController 
        ? (() => {
            const ac = new AbortController();
            abortController.signal.addEventListener("abort", () => ac.abort());
            timeoutController.signal.addEventListener("abort", () => ac.abort());
            return ac.signal;
          })()
        : timeoutController.signal;

      const requestBody = {
        ...body,
        correlationId, // Include correlation ID in request
        schemaVersion: "1.0",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: combinedSignal,
      });

      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      // Single read: body stream consumed once
      const responseText = await response.text().catch(() => "");

      // DEV + wc_debug: verbose error output (no secrets)
      if (import.meta.env.DEV && isDebugEnabled()) {
        logDebug("AIClient", {
          url,
          status: response.status,
          responsePreview: (responseText || "").slice(0, 300),
        });
      }

      const contentType = response.headers.get("content-type") || "";

      logRequest("log", correlationId, {
        action: "response_received",
        status: response.status,
        statusText: response.statusText,
        contentType,
      });

      if (!response.ok) {
        let errorText = "Unknown error";
        if (contentType.includes("application/json") && responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorText = errorData.error || errorData.message || JSON.stringify(errorData).slice(0, 200);
          } catch {
            errorText = responseText.slice(0, 400);
          }
        } else if (responseText) {
          errorText = responseText.includes("<html") || responseText.includes("<!DOCTYPE")
            ? "Server returned HTML error page (check function deployment)"
            : responseText.slice(0, 400);
        }
        const safe = errorText?.slice(0, 400) || "Unknown error";

        logRequest("error", correlationId, {
          action: "response_error",
          status: response.status,
          error: safe,
          contentType,
        });

        if (response.status >= 400 && response.status < 500 &&
            response.status !== 408 && response.status !== 429) {
          return {
            ok: false,
            error: "Server returned an error (4xx). Tap Retry to try again.",
            errorReason: "4xx",
            status: response.status,
            correlationId,
          };
        }

        lastError = new Error(`Server error (${response.status}). ${safe}`);
        if (attemptCount < MAX_RETRIES) continue;
      }

      if (!contentType.includes("application/json")) {
        logRequest("error", correlationId, {
          action: "invalid_response_type",
          contentType,
          responsePreview: (responseText || "").slice(0, 200),
        });
        const reason = response.status >= 500 ? "5xx" : response.status >= 400 ? "4xx" : "server_error";
        return {
          ok: false,
          error: response.status >= 500 ? "Server is having trouble (5xx). Tap Retry to try again." : "Server returned an error. Tap Retry to try again.",
          errorReason: reason,
          status: response.status,
          correlationId,
        };
      }

      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (parseErr) {
        logRequest("error", correlationId, {
          action: "json_parse_error",
          error: parseErr.message,
        });
        return {
          ok: false,
          error: "Invalid response from server. Tap Retry to try again.",
          errorReason: "parse_error",
          status: response.status,
          correlationId,
        };
      }

      if (!data) {
        logRequest("error", correlationId, {
          action: "empty_response",
        });
        return {
          ok: false,
          error: "Empty response from server. Tap Retry to try again.",
          errorReason: "empty",
          status: response.status,
          correlationId,
        };
      }

      // Validate response schema
      if (!data.ok && !data.reply && !data.content && !data.text && !data.message) {
        logRequest("warn", correlationId, {
          action: "unexpected_schema",
          receivedKeys: Object.keys(data),
        });
      }

      // Standardize response extraction (support both new schema and legacy)
      const text = data.message?.text || data.content || data.text || data.reply || "";
      const tool = data.tool || (data.meta?.toolRoute ? { name: data.meta.toolRoute } : null);
      
      // Extract correlation ID from response
      const responseCorrelationId = data.correlationId || correlationId;

      logRequest("log", correlationId, {
        action: "response_success",
        hasText: !!text,
        hasTool: !!tool,
        toolName: tool?.name || null,
      });

      const result = {
        ok: data.ok !== false, // Default to true if not explicitly false
        text,
        tool, // Tool invocation data (null if no tool)
        meta: {
          ...(data.meta || {}),
          correlationId: responseCorrelationId,
          // Preserve tool routing from backend (legacy support)
          toolRoute: tool?.name || data.toolRoute || data.meta?.toolRoute || null,
          toolId: tool?.name || data.toolId || data.meta?.toolId || null,
        },
        status: response.status,
        correlationId: responseCorrelationId,
      };
      
      logRequest("log", responseCorrelationId, {
        action: "response_parsed",
        ok: result.ok,
        hasText: !!result.text,
        hasTool: !!result.tool,
        toolName: result.tool?.name || null,
      });

      try {
        const toolRoute = result.tool?.name || result.meta?.toolRoute || null;
        updateChatDiagnostics({
          status: "ok",
          correlationId: responseCorrelationId,
          toolRoute: toolRoute || null,
          error: null,
        });
      } catch {
        /* non-blocking */
      }

      return result;

    } catch (err) {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastError = err;

      const isNetworkError = err.message?.includes("Failed to fetch") || 
                            err.message?.includes("NetworkError") ||
                            err.name === "AbortError";

      if (isNetworkError && err.name !== "AbortError" && attemptCount < MAX_RETRIES) {
        continue;
      }

      // Don't retry if aborted or non-network error
      break;
    }
  }

  // All retries exhausted or non-retryable error — user-safe copy with specific reason
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  const isAborted = lastError?.name === "AbortError";
  const isNetwork = lastError?.message?.includes("Failed to fetch") || lastError?.message?.includes("NetworkError");
  const errorMsg = isOffline
    ? "Offline. Please check your connection. Tap Retry when back online."
    : isAborted
      ? "Request timed out. Tap Retry to try again."
      : isNetwork
        ? "Connection error. Tap Retry to try again."
        : "Something went wrong. Tap Retry to try again.";

  try {
    updateChatDiagnostics({
      status: "error",
      correlationId,
      toolRoute: null,
      error: errorMsg,
    });
  } catch {
    /* non-blocking */
  }

  return {
    ok: false,
    error: errorMsg,
    errorReason: isOffline ? "offline" : isAborted ? "timeout" : isNetwork ? "network" : "unknown",
    status: 0,
  };
}

/**
 * Runtime check: resolved Functions base URL + reason (for diagnostics)
 * @returns {{ url: string, reason: string, mode: string }}
 */
export function getResolvedFunctionsBaseUrl() {
  const env = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  if (env && typeof env === "string" && env.trim()) {
    return { url: env.trim(), reason: "env", mode: import.meta.env.MODE };
  }
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const host = window.location.hostname;
    return {
      url: `http://${host}:5001/wellnesscafelanding/us-central1`,
      reason: "dev_lan",
      mode: "development",
    };
  }
  return {
    url: "https://us-central1-wellnesscafelanding.cloudfunctions.net",
    reason: "production",
    mode: import.meta.env.MODE,
  };
}

/**
 * Health check endpoint
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

