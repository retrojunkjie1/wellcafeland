// src/services/multimodalClient.js
// Frontend client for multimodal wellness engine (OpenAI chat, TTS, STT)

import { isDebugEnabled, logDebug } from "@/lib/debug";

import { resolveFunctionsBaseUrl } from "@/lib/functionsUrl";
import { observe, interpret, adapt, optimize } from "@/core/system/intelligenceEngine";
import { trackLatency, trackNetworkEvent } from "@/telemetry/telemetry";

function buildEndpoint(path) {
  const base = resolveFunctionsBaseUrl();
  return `${base.replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

const ENDPOINTS = {
  chat: () => buildEndpoint("/multimodalChat"),
  tts: () => buildEndpoint("/multimodalTts"),
  stt: () => buildEndpoint("/multimodalStt"),
};

/**
 * Unified Guide Engine - High-intelligence, emotionally-aware, multimodal guide
 * Trained for wellness, addiction recovery, spiritual stability, and trauma-informed dialogue
 * 
 * CANONICAL AI ENTRY POINT: All primary conversational AI flows use this function.
 * Endpoint: /multimodalChat
 * 
 * Agent Intent Mapping (modes → agent personalities):
 * - "default" → Living Guide (primary conversational companion)
 * - "breathing" → Breathwork Healer (focused breathwork guidance)
 * - "grounding" → Grounding Healer (sensory grounding support)
 * - "education" → Oracle (reflective, educational content)
 * - "self_surgeon" → Guided self-inquiry (deep introspection)
 * 
 * NOTE: Mode names are internal only. Never display raw mode values in UI.
 * 
 * @param {string} query - User's text query
 * @param {Object} options - Configuration options
 * @param {Array} options.messages - Message history array of {role, content}
 * @param {string} options.mode - "default" | "breathing" | "grounding" | "education" | "self_surgeon"
 * @param {string} options.audioInput - Optional audio input (base64 or Blob)
 * @param {string} options.imageInput - Optional image input (base64 or URL)
 * @returns {Promise<{ok: boolean, type?: string, content?: string, audio?: string, video?: string, error?: string, mode?: string, meta?: object}>}
 */
export async function guideEngine(query, options = {}) {
  const { messages = [], mode = "default", audioInput, imageInput } = options;
  
  // Build message history
  let messageHistory = [];
  
  if (Array.isArray(messages) && messages.length > 0) {
    messageHistory = [...messages];
    if (query && typeof query === "string" && query.trim()) {
      const lastMsg = messageHistory[messageHistory.length - 1];
      if (!lastMsg || lastMsg.content !== query.trim()) {
        messageHistory.push({
          role: "user",
          content: query.trim(),
        });
      }
    }
  } else if (query && typeof query === "string" && query.trim()) {
    messageHistory = [{
      role: "user",
      content: query.trim(),
    }];
  }
  
  if (messageHistory.length === 0) {
    return {
      ok: false,
      error: "No query or messages provided.",
    };
  }

  try {
    // Get user preferences (non-blocking)
    let preferences = null;
    try {
      const { getPreferenceFlagsSync } = await import("./profileService");
      preferences = getPreferenceFlagsSync();
    } catch {
      // Silently fail - use defaults
    }
    
    const endpoint = ENDPOINTS.chat();
    logDebug("Chat", {
      endpoint,
      functionsBaseUrl: resolveFunctionsBaseUrl(),
      envSet: !!import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
    });
    
    // Adjust mode based on preferences
    let adjustedMode = mode;
    if (preferences && preferences.preferredMode === "voice" && mode === "default") {
      adjustedMode = "voice";
    } else if (preferences && preferences.preferredMode === "video" && mode === "default") {
      adjustedMode = "video";
    }
    
    // Observe user message before sending (if intelligence engine available)
    try {
      observe({
        type: "chat",
        data: {
          text: query || (messageHistory[messageHistory.length - 1]?.content || ""),
          role: "user",
          mode: adjustedMode,
        },
      });
    } catch {
      // Intelligence engine not available, continue without it
    }

    // Get intelligence interpretation (if available)
    try {
      const { SystemMemory } = await import("@/core/system/systemMemory");
      
      const userText = query || (messageHistory[messageHistory.length - 1]?.content || "");
      const interpreted = interpret({
        type: "chat",
        data: { text: userText },
      });

      // Adapt based on interpretation
      if (interpreted) {
        const adapted = adapt(interpreted);
        
        // Adjust mode based on intelligence
        if (adapted.needsAudio && adjustedMode === "default") {
          adjustedMode = "voice";
        } else if (adapted.needsVideo && adjustedMode === "default") {
          adjustedMode = "video";
        }

        // Update system memory
        if (adapted.systemState) {
          SystemMemory.setSystemState(adapted.systemState);
        }
        if (adapted.recommendTool) {
          SystemMemory.setLastNeed(adapted.recommendTool);
        }
      }
    } catch {
      // Intelligence engine not available, continue without it
    }

    const requestBody = {
      messages: messageHistory,
      mode: adjustedMode,
      // Add preference hints for backend
      preferences: preferences ? {
        tone: preferences.preferredTone,
        pace: preferences.sessionPace,
      } : undefined,
    };
    
    // Add audio if provided
    if (audioInput) {
      if (audioInput instanceof Blob) {
        const audioData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioInput);
        });
        requestBody.audioInput = audioData;
        requestBody.audioMimeType = audioInput.type || "audio/webm";
      } else {
        requestBody.audioInput = audioInput;
      }
    }
    
    // Add image if provided
    if (imageInput) {
      if (imageInput instanceof Blob || imageInput instanceof File) {
        const imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageInput);
        });
        requestBody.imageInput = imageData;
        requestBody.imageMimeType = imageInput.type || "image/jpeg";
      } else {
        requestBody.imageInput = imageInput;
      }
    }
    
    // Safari-compatible timeout: use AbortController instead of AbortSignal.timeout()
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, 15000); // Reduced to 15s max
    
    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: timeoutController.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr.name === "AbortError") {
        return {
          ok: false,
          error: "Request timed out. Please try again.",
        };
      }
      throw fetchErr;
    }

    if (isDebugEnabled()) {
      logDebug("Chat", { responseStatus: res.status, statusText: res.statusText });
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const safe = errorText?.slice(0, 400) || "Unknown error";
      return {
        ok: false,
        status: res.status,
        error: `Server error (${res.status}). ${safe}`,
      };
    }

    const data = await res.json().catch((parseErr) => {
      console.error("[guideEngine] Failed to parse JSON response:", parseErr);
      return null;
    });
    
    if (isDebugEnabled() && data) {
      logDebug("Chat", { hasContent: !!data.content, hasAudio: !!data.audio, hasVideo: !!data.video });
    }
    
    if (!data) {
      console.error("[guideEngine] No data in response. Status:", res.status);
      return {
        ok: false,
        error: "Invalid response from server. Please try again.",
      };
    }

    // Optimize response based on system state (if intelligence engine available)
    let finalContent = data.content || data.text || data.reply || "";
    let optimization = {};
    let systemState = {};
    
    try {
      const { SystemMemory } = await import("@/core/system/systemMemory");
      
      systemState = SystemMemory.getSystemState();
      optimization = optimize({
        systemState,
        preferredMode: SystemMemory.getPreferredMode(),
      });

      // Adjust response based on optimization if available
      if (optimization.escalate) {
        if (optimization.recommendTool === "grounding" && !finalVideo) {
          finalVideo = "grounding"; // Signal to inject grounding video
        }
        if (optimization.recommendTool === "urge-surfing" && !finalAudio) {
          // Will be handled by audio generation below
        }
      }
    } catch {
      // Intelligence engine not available, continue without optimization
    }

    let finalType = data.type || "text";
    let finalAudio = data.audio || null;
    let finalVideo = data.video || null;

    // Return clean, unified response format
    return {
      ok: true,
      type: finalType,
      content: finalContent,
      audio: finalAudio,
      video: finalVideo,
      mode: data.mode || mode,
      meta: {
        ...(data.meta || {}),
        optimization,
        systemState,
      },
    };
  } catch (err) {
    const endpoint = ENDPOINTS.chat();
    logDebug("Chat", {
      error: err.message,
      errorName: err.name,
      endpoint,
      origin: typeof window !== "undefined" ? window.location.origin : null,
    });
    
    const isNetworkError = err.message?.includes("Failed to fetch") || 
                          err.message?.includes("NetworkError") ||
                          err.name === "AbortError" ||
                          err.name === "TypeError";
    
    // PHASE H: Soft messaging
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection and try again."
        : "Still here with you. Tap send to continue.",
    };
  }
}

/**
 * Send chat with multimodal support
 * 
 * CANONICAL AI ENTRY POINT: Primary function for multimodal chat interactions.
 * Endpoint: /multimodalChat
 * 
 * Use this for chat flows that need audio/video support.
 * For simple text conversations, use guideEngine() instead.
 * 
 * @param {Object} params - { messages: Array<{role, content}>, metadata?: Object, mode?: string, abortController?: AbortController, disconnectReason?: string }
 * @returns {Promise<{ok: boolean, type: string, text?: string, audioUrl?: string, videoUrl?: string, raw?: Object, disconnectReason?: string}>}
 */
// GOD-EYE V2: Track latency and network events
let networkRetryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const MAX_BACKOFF = 30000; // 30 seconds max

// Exponential backoff helper
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Network state tracking
let fetchFailureCount = 0;
const FAILURE_WINDOW = 30000;

// Check if actually offline vs slow
async function checkOnline() {
  if (!navigator.onLine) return false;
  // Quick connectivity check - use AbortController for Safari compatibility
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("/favicon.ico", { method: "HEAD", cache: "no-cache", signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export async function sendChatMultimodal({ messages = [], metadata = {}, mode = "chat", abortController = null, disconnectReason = null }) {
  // PHASE H: Mobile chat resilience
  // GOD-EYE V2: Network resilience
  // Defensive: Ensure messages is valid array
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      ok: false,
      type: "text",
      text: "No messages provided.",
    };
  }

  const endpoint = ENDPOINTS.chat();

  // PHASE H: iOS Safari visibility guard
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = isIOS || /Android/.test(navigator.userAgent);
  
  // PHASE H: Create AbortController if not provided, use mobile timeout
  // Defensive: Ensure AbortController is available (Safari compatibility)
  let controller;
  try {
    controller = abortController || new AbortController();
  } catch (err) {
    // Fallback if AbortController not available (very old browsers)
    console.warn("[sendChatMultimodal] AbortController not available, using fetch without abort");
    controller = null;
  }
  const timeoutDuration = Math.min(isMobile ? 8000 : 15000, 15000); // Cap at 15s max
  let timeoutId = null;
  let mobileTimeoutId = null;
  let lastChunkTime = Date.now();

  // PHASE H: Mobile timeout fallback - track last chunk time
  const resetChunkTimer = () => {
    lastChunkTime = Date.now();
    if (mobileTimeoutId) {
      clearTimeout(mobileTimeoutId);
      mobileTimeoutId = null;
    }
    if (isMobile && controller) {
      mobileTimeoutId = setTimeout(() => {
        const elapsed = Date.now() - lastChunkTime;
        if (elapsed >= 8000 && controller) {
          try {
            controller.abort();
            disconnectReason = "mobile_timeout";
          } catch (err) {
            console.warn("[sendChatMultimodal] Failed to abort controller:", err);
          }
        }
      }, 8000);
    }
  };

  // GOD-EYE V2: Track request start time
  const requestStart = Date.now();
  let attemptCount = 0;
  let lastError = null;

  // Retry loop with exponential backoff
  while (attemptCount < MAX_RETRIES) {
    attemptCount++;
    
    // GOD-EYE V2: Check if actually offline before retrying
    if (attemptCount > 1) {
      const isOnline = await checkOnline();
      if (!isOnline) {
        // Actually offline - don't retry
        return {
          ok: false,
          type: "text",
          text: "Still here with you. Tap send to continue.",
          disconnectReason: "offline",
        };
      }
      
      // Exponential backoff
      const delay = RETRY_DELAY_BASE * Math.pow(2, attemptCount - 2);
      await sleep(delay);
    }

    try {
      // PHASE H: Prevent false disconnects
      const fetchSignal = controller?.signal || null;
      
      // Create timeout for overall request
      if (controller) {
        timeoutId = setTimeout(() => {
          if (controller && !controller.signal.aborted) {
            try {
              controller.abort();
            } catch (err) {
              console.warn("[sendChatMultimodal] Failed to abort on timeout:", err);
            }
          }
        }, Math.min(timeoutDuration, 15000)); // Cap at 15s max
      }

      resetChunkTimer();

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          mode,
          metadata,
        }),
      };
      
      // Only add signal if AbortController is available
      if (fetchSignal) {
        fetchOptions.signal = fetchSignal;
      }

      const res = await fetch(endpoint, fetchOptions);
      
      // GOD-EYE SUPREME: Record success
      fetchFailureCount = 0;
      
      // GOD-EYE V2: Track latency on success
      const requestDuration = Date.now() - requestStart;
      try {
        trackLatency(requestDuration, endpoint);
        trackNetworkEvent("request_success", { duration: requestDuration, endpoint, retries: attemptCount - 1 });
      } catch {
        // Telemetry not critical
      }

      // Clear timeouts on success
      if (timeoutId) clearTimeout(timeoutId);
      if (mobileTimeoutId) clearTimeout(mobileTimeoutId);
      networkRetryCount = 0; // Reset on success

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        const safe = errorText?.slice(0, 400) || "Unknown error";
        return {
          ok: false,
          type: "text",
          status: res.status,
          text: `Server error (${res.status}). ${safe}`,
          disconnectReason: null,
        };
      }

      const data = await res.json().catch(() => null);
      if (!data) {
        return {
          ok: false,
          type: "text",
          text: "Invalid response from server. Please try again.",
          disconnectReason: null,
        };
      }

      // Convert base64 audio to blob URL if present
      let audioUrl = null;
      if (data.audio) {
        try {
          const audioBlob = base64ToBlob(data.audio, data.mimeType || "audio/mp3");
          audioUrl = URL.createObjectURL(audioBlob);
        } catch (err) {
          console.error("Failed to create audio URL:", err);
        }
      }

      return {
        ok: true,
        type: data.type || "text",
        text: data.content || data.text || null,
        audioUrl: audioUrl || null,
        videoUrl: data.video || null,
        raw: data,
        disconnectReason: null,
      };
    } catch (err) {
      // PHASE H: Prevent false disconnects - cleanup timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (mobileTimeoutId) clearTimeout(mobileTimeoutId);

      lastError = err;
      const isAborted = err.name === "AbortError";
      const isNetworkError = err.message?.includes("Failed to fetch") || 
                            err.message?.includes("NetworkError");
      
      // GOD-EYE SUPREME: Record failure for network state
      if (isNetworkError && !isAborted) {
        fetchFailureCount++;
        setTimeout(() => {
          fetchFailureCount = Math.max(0, fetchFailureCount - 1);
        }, FAILURE_WINDOW);
      }
      
      // GOD-EYE V2: Track network errors
      try {
        trackNetworkEvent("request_error", {
          level: "warn",
          error: err.message,
          endpoint,
          retries: attemptCount - 1,
          isAborted,
          isNetworkError,
          failureCount: fetchFailureCount,
        });
      } catch {
        // Telemetry not critical
      }

      // Retry logic - only retry network errors, not aborts
      // Exponential backoff with max cap
      if (isNetworkError && !isAborted && attemptCount < MAX_RETRIES) {
        const backoffDelay = Math.min(
          RETRY_DELAY_BASE * Math.pow(2, attemptCount - 1),
          MAX_BACKOFF
        );
        await sleep(backoffDelay);
        continue;
      }

      // Don't retry if aborted or non-network error
      break;
    }
  } // End retry loop

  // If we get here, all retries failed or non-retryable error
  const isAborted = lastError?.name === "AbortError";
  const isNetworkError = lastError?.message?.includes("Failed to fetch") || 
                        lastError?.message?.includes("NetworkError");
  
  // Determine connection state - ONLY use navigator.onLine for offline detection
  // Do NOT equate fetch timeout, CSP violation, App Check failure, or AI error with offline
  const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
  const isDegraded = fetchFailureCount >= 3;
  
  // Soft messaging - only show connection lost if truly offline
  let messageText;
  if (isOffline) {
    messageText = "Still here with you. Tap send to continue.";
  } else if (isAborted && (disconnectReason === "visibility" || disconnectReason === "mobile_timeout")) {
    messageText = "Still here with you. Tap send to continue.";
  } else {
    messageText = "Still here with you. Tap send to continue.";
  }

  // Track network status
  try {
    trackNetworkEvent("network_status", {
      level: isOffline ? "warn" : isDegraded ? "warn" : "info",
      state: isOffline ? "offline" : isDegraded ? "degraded" : "online",
      failureCount: fetchFailureCount,
    });
  } catch {
    // Telemetry not critical
  }

  return {
    ok: false,
    type: "text",
    text: messageText,
    disconnectReason: isAborted ? disconnectReason || "aborted" : 
                     isOffline ? "offline" :
                     isDegraded ? "degraded" :
                     isNetworkError ? "network_error" : "unknown",
  };
}

/**
 * Convert text to speech using OpenAI TTS
 * @param {string} text - Text to speak
 * @param {Object} options - { voice?: string }
 * @returns {Promise<{ok: boolean, audioUrl?: string, error?: string}>}
 */
export async function speakText(text, options = {}) {
  if (!text || !text.trim()) {
    return { ok: false, error: "No text provided" };
  }

  try {
    const ttsEndpoint = ENDPOINTS.tts();
    logDebug("TTS", { endpoint: ttsEndpoint, functionsBaseUrl: resolveFunctionsBaseUrl() });
    const res = await fetch(ttsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: options.voice || "alloy",
      }),
      signal: (() => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 15000);
        return controller.signal;
      })(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const safe = errorText?.slice(0, 400) || "Unknown error";
      return { 
        ok: false, 
        status: res.status,
        error: `Server error (${res.status}). ${safe}` 
      };
    }

    const data = await res.json();
    
    // Convert base64 to blob URL
    if (data.ok && data.audio) {
      try {
        const audioBlob = base64ToBlob(data.audio, data.mimeType || "audio/mp3");
        const audioUrl = URL.createObjectURL(audioBlob);
        return {
          ok: true,
          audioUrl,
        };
      } catch (err) {
        console.error("Failed to create audio blob:", err);
        return { ok: false, error: "Failed to process audio" };
      }
    }

    return { ok: false, error: "No audio data received" };
  } catch (err) {
    logDebug("TTS", { error: err.message, endpoint: ENDPOINTS.tts() });
    const isNetworkError = err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError");
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection."
        : "Audio generation failed",
    };
  }
}

/**
 * Transcribe audio to text using OpenAI Whisper
 * @param {Blob|string} audio - Audio blob or base64 string
 * @param {string} mimeType - MIME type (e.g., "audio/webm", "audio/mp3")
 * @returns {Promise<{ok: boolean, text?: string, error?: string}>}
 */
export async function transcribeAudio(audio, mimeType = "audio/webm") {
  if (!audio) {
    return { ok: false, error: "No audio provided" };
  }

  try {
    let audioData;
    let audioMimeType = mimeType;

    if (audio instanceof Blob) {
      audioData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audio);
      });
      audioMimeType = audio.type || mimeType;
    } else {
      audioData = audio;
    }

    // Safari-compatible timeout
    const sttEndpoint = ENDPOINTS.stt();
    logDebug("STT", { endpoint: sttEndpoint, functionsBaseUrl: resolveFunctionsBaseUrl() });
    const sttController = new AbortController();
    const sttTimeoutId = setTimeout(() => sttController.abort(), 30000);
    
    const res = await fetch(sttEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: audioData,
        mimeType: audioMimeType,
      }),
      signal: sttController.signal,
    });
    
    clearTimeout(sttTimeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const safe = errorText?.slice(0, 400) || "Unknown error";
      return {
        ok: false,
        status: res.status,
        error: `Server error (${res.status}). ${safe}`,
      };
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.ok) {
      return {
        ok: false,
        error: data?.error || "Invalid response from server",
      };
    }

    return {
      ok: true,
      text: data.text || "",
    };
  } catch (err) {
    logDebug("STT", { error: err.message, endpoint: ENDPOINTS.stt() });
    const isNetworkError = err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError");
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection."
        : "Transcription failed",
    };
  }
}

/**
 * Helper: Convert base64 to Blob
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * @deprecated LEGACY - Use guideEngine() or sendChatMultimodal() instead
 * 
 * This function is kept for backward compatibility but should NOT be used for new features.
 * It falls back to /aiSession (legacy endpoint) which is restricted to:
 * - Session templates (admin tools)
 * - Older tool integrations
 * 
 * Legacy AI – restricted scope. Not a personality, just a utility.
 */
export async function callWellnessChat({ messages, mode = "default" }) {
  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || "Help me with a short, gentle recovery reflection.";

  try {
    const endpoint = ENDPOINTS.chat();
    
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          mode,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.content) {
          return {
            ok: true,
            content: data.content,
            mode: data.mode || mode,
            meta: data.meta || {},
          };
        }
      }
    } catch (multimodalErr) {
      console.log("[callWellnessChat] Multimodal endpoint failed, trying fallback:", multimodalErr.message);
    }

    // Fallback to /api/aiSession via centralized client
    const { callAiSession } = await import("@/services/aiSessionClient");

    const fallbackData = await callAiSession({
      prompt: userPrompt,
      mode: "session",
      context: messages.length > 1
        ? messages.slice(0, -1).map((m) => `${m.role}: ${m.content}`).join("\n")
        : "",
    });
    const reply = 
      fallbackData?.reply ||
      fallbackData?.choices?.[0]?.message?.content ||
      fallbackData?.content ||
      fallbackData?.message ||
      "I'm here. Let's take this one breath at a time.";

    return {
      ok: true,
      content: reply,
      mode: mode,
      meta: {},
    };
  } catch (err) {
    console.error("Wellness chat request failed:", err);
    // PHASE H: Soft messaging
    return {
      ok: false,
      error: "Still here with you. Tap send to continue.",
    };
  }
}


/**
 * Detect emotion from text (Phase 14)
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} { emotionalState, intensity, tags }
 */
export async function detectEmotionFromText(text) {
  const { detectEmotionalState } = await import("./emotionSensor");
  return detectEmotionalState(text);
}

/**
 * Send voice session (Phase 14)
 * @param {Blob} audioBlob - Audio blob to transcribe and process
 * @returns {Promise<Object>}
 */
export async function sendVoiceSession(audioBlob) {
  try {
    if (!audioBlob) {
      return { ok: false, error: "No audio provided" };
    }

    const transcriptionResult = await transcribeAudio(audioBlob);
    if (!transcriptionResult.ok || !transcriptionResult.text) {
      return { 
        ok: false, 
        error: transcriptionResult.error || "Transcription failed",
        type: "voice-session",
      };
    }

    const transcript = transcriptionResult.text;
    const emotion = await detectEmotionFromText(transcript);
    const { detectRiskPhrases } = await import("./emotionSensor");
    const crisis = detectRiskPhrases(transcript);

    if (crisis) {
      const safetyMessage = "I'm really glad you reached out. If you're in immediate danger, please contact 988 or local emergency services. I'm here to listen, and we can talk through what you're feeling right now.";
      let audioUrl = null;
      try {
        const audioResult = await speakText(safetyMessage);
        if (audioResult.ok && audioResult.audioUrl) {
          audioUrl = audioResult.audioUrl;
        }
      } catch (err) {
        console.warn("Failed to generate safety audio:", err);
      }

      return {
        ok: true,
        type: "voice-session",
        text: safetyMessage,
        transcript,
        audioUrl,
        videoUrl: null,
        emotionalState: emotion.emotionalState,
        intensity: emotion.intensity,
        tags: emotion.tags,
        crisis: true,
      };
    }

    const aiResponse = await guideEngine(transcript, {
      mode: emotion.intensity >= 4 ? "audio" : "default",
      preferences: {
        tone: emotion.emotionalState === "anxious" ? "gentle" : "practical",
      },
    });

    if (!aiResponse.ok) {
      return {
        ok: false,
        error: aiResponse.error || "AI response failed",
        type: "voice-session",
        transcript,
        emotionalState: emotion.emotionalState,
        intensity: emotion.intensity,
        tags: emotion.tags,
      };
    }

    let audioUrl = null;
    if (aiResponse.audio || emotion.intensity >= 3) {
      try {
        const audioResult = await speakText(aiResponse.content);
        if (audioResult.ok && audioResult.audioUrl) {
          audioUrl = audioResult.audioUrl;
        }
      } catch (err) {
        console.warn("Failed to generate audio response:", err);
      }
    }

    let videoUrl = null;
    const lowerTranscript = transcript.toLowerCase();
    const needsVideo = lowerTranscript.includes("show me") || 
                      lowerTranscript.includes("demonstrate") ||
                      lowerTranscript.includes("visual") ||
                      lowerTranscript.includes("exercise") ||
                      lowerTranscript.includes("yoga") ||
                      lowerTranscript.includes("stretch") ||
                      emotion.emotionalState === "anxious" && emotion.intensity >= 4;

    if (needsVideo && aiResponse.video) {
      videoUrl = aiResponse.video;
    }

    return {
      ok: true,
      type: "voice-session",
      text: aiResponse.content,
      transcript,
      audioUrl: audioUrl || aiResponse.audio || null,
      videoUrl: videoUrl || aiResponse.video || null,
      emotionalState: emotion.emotionalState,
      intensity: emotion.intensity,
      tags: emotion.tags,
      crisis: false,
    };
  } catch (err) {
    console.error("sendVoiceSession error:", err);
    return {
      ok: false,
      error: err.message || "Voice session processing failed",
      type: "voice-session",
    };
  }
}
export default {
  guideEngine,
  sendChatMultimodal,
  speakText,
  transcribeAudio,
  callWellnessChat, // Deprecated
};
