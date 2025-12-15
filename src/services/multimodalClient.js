// src/services/multimodalClient.js
// Frontend client for multimodal wellness engine (OpenAI chat, TTS, STT)

// Phase 61B: Endpoint resolution helpers
function resolveFunctionsBaseUrl() {
  const env = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  if (env && typeof env === "string" && env.trim()) return env.trim();

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocalhost) {
    const projectId = "wellnesscafelanding";
    const region = "us-central1";
    return `http://localhost:5001/${projectId}/${region}`;
  }

  return "https://us-central1-wellnesscafelanding.cloudfunctions.net";
}

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
    
    // Debug: Log resolved endpoint
    console.log("[guideEngine] Resolved endpoint:", endpoint);
    console.log("[guideEngine] VITE_FIREBASE_FUNCTIONS_URL:", import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "(not set, using default)");
    
    // Adjust mode based on preferences
    let adjustedMode = mode;
    if (preferences && preferences.preferredMode === "voice" && mode === "default") {
      adjustedMode = "voice";
    } else if (preferences && preferences.preferredMode === "video" && mode === "default") {
      adjustedMode = "video";
    }
    
    // Observe user message before sending (if intelligence engine available)
    try {
      const { observe } = await import("@/core/system/intelligenceEngine");
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
      const { interpret, adapt } = await import("@/core/system/intelligenceEngine");
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
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000),
    });

    // Debug: Log response status and headers
    console.log("[guideEngine] Response status:", res.status, res.statusText);
    console.log("[guideEngine] Response headers:", Object.fromEntries(res.headers.entries()));

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
    
    // Debug: Log response body (trimmed to 300 chars)
    if (data) {
      const dataStr = JSON.stringify(data);
      const trimmedData = dataStr.length > 300 ? dataStr.substring(0, 300) + "..." : dataStr;
      console.log("[guideEngine] Response body (trimmed):", trimmedData);
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
      const { optimize } = await import("@/core/system/intelligenceEngine");
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
    // Debug: Comprehensive error logging
    const endpoint = ENDPOINTS.chat();
    
    console.error("[guideEngine] Request failed:", {
      error: err,
      message: err.message,
      name: err.name,
      stack: err.stack,
      endpoint: endpoint,
      envVar: import.meta.env.VITE_FIREBASE_FUNCTIONS_URL || "(not set)",
    });
    
    const isNetworkError = err.message?.includes("Failed to fetch") || 
                          err.message?.includes("NetworkError") ||
                          err.name === "AbortError" ||
                          err.name === "TypeError";
    
    // Additional debug for CORS issues
    if (err.message?.includes("Failed to fetch") || err.message?.includes("CORS")) {
      console.error("[guideEngine] CORS/Network issue detected. Endpoint:", endpoint);
      console.error("[guideEngine] Check if endpoint allows origin:", window.location.origin);
    }
    
    return {
      ok: false,
      error: isNetworkError
        ? "Network connection failed. Please check your internet connection and try again."
        : "Connection lost. I'm still here with you. Try again when you're ready.",
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
 * @param {Object} params - { messages: Array<{role, content}>, metadata?: Object, mode?: string }
 * @returns {Promise<{ok: boolean, type: string, text?: string, audioUrl?: string, videoUrl?: string, raw?: Object}>}
 */
export async function sendChatMultimodal({ messages = [], metadata = {}, mode = "chat" }) {
  if (!messages || messages.length === 0) {
    return {
      ok: false,
      type: "text",
      text: "No messages provided.",
    };
  }

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
        metadata,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      const safe = errorText?.slice(0, 400) || "Unknown error";
      return {
        ok: false,
        type: "text",
        status: res.status,
        text: `Server error (${res.status}). ${safe}`,
      };
    }

    const data = await res.json().catch(() => null);
    if (!data) {
      return {
        ok: false,
        type: "text",
        text: "Invalid response from server. Please try again.",
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
    };
  } catch (err) {
    console.error("[sendChatMultimodal] Request failed:", err);
    const isNetworkError = err.message?.includes("Failed to fetch") || 
                          err.message?.includes("NetworkError") ||
                          err.name === "AbortError";
    return {
      ok: false,
      type: "text",
      text: isNetworkError
        ? "Network connection failed. Please check your internet connection and try again."
        : "Connection lost. I'm still here with you. Try again when you're ready.",
    };
  }
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
    const res = await fetch(ENDPOINTS.tts(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        voice: options.voice || "alloy",
      }),
      signal: AbortSignal.timeout(15000),
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
    console.error("TTS request failed:", err);
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

    const res = await fetch(ENDPOINTS.stt(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: audioData,
        mimeType: audioMimeType,
      }),
      signal: AbortSignal.timeout(30000),
    });

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
    console.error("STT request failed:", err);
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

    // Fallback to /aiSession (v1 function)
    const fallbackUrl = import.meta.env.DEV 
      ? "/aiSession"
      : "https://us-central1-wellnesscafelanding.cloudfunctions.net/aiSession";
    
    const fallbackRes = await fetch(fallbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        mode: "session",
        context: messages.length > 1 
          ? messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join("\n")
          : "",
      }),
    });

    if (!fallbackRes.ok) {
      return {
        ok: false,
        error: "I couldn't reach the wellness engine right now. Please try again in a moment.",
      };
    }

    const fallbackData = await fallbackRes.json().catch(() => null);
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
    return {
      ok: false,
      error: "Connection lost. I'm still here with you. Try again when you're ready.",
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
