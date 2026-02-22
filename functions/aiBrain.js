// functions/aiBrain.js
// OpenAI GPT-4o-mini provider for aiSession (runSimpleChat, callOpenAIJSON, generateSession, handleAgent)

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { setCorsHeaders } = require("./corsHelper");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const OPENAI_MODEL = "gpt-4o-mini";
const CHAT_TEMPERATURE = 0.3;
const CHAT_MAX_TOKENS = 500;
const OPENAI_TIMEOUT_MS = 25000;
const JSON_TEMPERATURE = 0.35;
const JSON_MAX_TOKENS = 900;

const PLACEHOLDER_PATTERNS = [
  "sk-placeholder",
  "your-api-key-here",
  "your_api_key_here",
  "xxx",
];

function isPlaceholderKey(val) {
  if (!val || typeof val !== "string") return true;
  const v = val.trim();
  if (v.length < 10) return true;
  const lower = v.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

/**
 * Resolve OpenAI API key from env and config.
 * Emulator reads functions/.env; restart emulators after updating .env
 * @returns {{ key: string|null, source: string }}
 */
function getResolvedOpenAIKey() {
  const fromEnv = (process.env.OPENAI_API_KEY || "").trim();
  if (fromEnv && !isPlaceholderKey(fromEnv)) return { key: fromEnv, source: "OPENAI_API_KEY" };
  try {
    const cfg = functions.config().openai || {};
    const fromKey = (cfg.key || "").trim();
    if (fromKey && !isPlaceholderKey(fromKey)) return { key: fromKey, source: "openai.key" };
  } catch (e) {
    // best-effort
  }
  return { key: null, source: "none" };
}

function maskKeyForLog(key) {
  if (!key || key.length < 4) return "****";
  return `****${key.slice(-4)}`;
}

function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

// Conservative intent gate: keywords + patterns with confidence
const DIRECTORY_STRONG_PHRASES = [
  /\bhelp me find\b/i, /\blooking for\b/i, /\bfind (a|some|resources?)\b/i,
  /\bneed (a|some) (housing|grant|program|resource|treatment)\b/i,
  /\bsupport (group|program)\b/i, /\bsober (living|home)\b/i,
];
const DIRECTORY_KEYWORDS = [
  /\bfind\b/i, /\bresource/i, /\bhousing\b/i, /\bgrant/i, /\bprogram\b/i,
  /\bdirectory\b/i, /\btreatment\b/i, /\bhotline\b/i, /\bassistance\b/i,
  /\bneed (a|some)\b/i,
];
const DIRECTORY_CONFIDENCE_THRESHOLD = 0.55;

function evaluateDirectoryIntent(text) {
  if (!text || typeof text !== "string") return { confidence: 0, queryHint: "" };
  const t = text.trim();
  if (t.length < 4) return { confidence: 0, queryHint: t };
  let score = 0;
  if (DIRECTORY_STRONG_PHRASES.some((p) => p.test(t))) score += 0.5;
  const keywordMatches = DIRECTORY_KEYWORDS.filter((p) => p.test(t)).length;
  score += Math.min(0.5, keywordMatches * 0.15);
  const confidence = Math.min(1, score);
  const queryHint = t.slice(0, 120);
  return { confidence, queryHint };
}

function toSafeResource(r) {
  return {
    title: (r.title || "").slice(0, 200),
    type: (r.type || "resource").slice(0, 80),
    verified: !!r.verified,
    location: (r.location || "").slice(0, 120) || undefined,
    contact: r.contact && typeof r.contact === "object"
      ? { url: (r.contact.url || "").slice(0, 256), phone: (r.contact.phone || "").slice(0, 32) }
      : undefined,
  };
}

async function queryResourcesForContext(queryText, limit = 8) {
  try {
    const snap = await db.collection("resources")
      .orderBy("updatedAt", "desc")
      .limit(limit * 2)
      .get();
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    const q = (queryText || "").toLowerCase().trim();
    const filtered = q.length > 2
      ? items.filter((r) =>
          (r.title || "").toLowerCase().includes(q) ||
          (r.type || "").toLowerCase().includes(q) ||
          (Array.isArray(r.tags) && r.tags.some((t) => String(t).toLowerCase().includes(q))))
      : items;
    return filtered.slice(0, limit).map(toSafeResource);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[aiSession] resources query error:", err.message);
    }
    return [];
  }
}

function mapOpenAIError(status, correlationId) {
  const err = new Error(status === 401 ? "Invalid API key" : status === 429 ? "Rate limited" : "AI provider error");
  err.code = status === 401 ? "AI_PROVIDER_UNAUTHORIZED" : status === 429 ? "RATE_LIMITED" : "AI_PROVIDER_ERROR";
  err.correlationId = correlationId;
  return err;
}

/**
 * Call OpenAI chat completions (text response)
 */
async function runSimpleChat(prompt, context = "", correlationId = "") {
  const { key: apiKey } = getResolvedOpenAIKey();
  if (!apiKey) {
    throw new Error("AI provider not configured");
  }

  const systemMessage =
    "You are WellnessCafe OS. Speak like a calm, grounded recovery guide. " +
    "Use simple language. No technical jargon. Short paragraphs.";

  const userMessage = context ? `Context:\n${context}\n\nUser:\n${prompt}` : prompt;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: CHAT_TEMPERATURE,
      max_tokens: CHAT_MAX_TOKENS,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    if (res.status === 401) throw mapOpenAIError(401, correlationId);
    if (res.status === 429) throw mapOpenAIError(429, correlationId);
    if (res.status >= 500 && res.status < 600) throw mapOpenAIError(res.status, correlationId);
    const err = new Error(`OpenAI error ${res.status}: ${text}`);
    err.code = "AI_PROVIDER_ERROR";
    err.correlationId = correlationId;
    throw err;
  }

  const data = safeJsonParse(text, {});
  const content = data?.choices?.[0]?.message?.content || "";
  return { reply: content.trim() };
}

/**
 * Call OpenAI chat completions with JSON response format
 */
async function callOpenAIJSON(systemMessage, userMessage, correlationId = "") {
  const { key: apiKey } = getResolvedOpenAIKey();
  if (!apiKey) {
    throw new Error("AI provider not configured");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: JSON_TEMPERATURE,
      max_tokens: JSON_MAX_TOKENS,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    if (res.status === 401) throw mapOpenAIError(401, correlationId);
    if (res.status === 429) throw mapOpenAIError(429, correlationId);
    if (res.status >= 500 && res.status < 600) throw mapOpenAIError(res.status, correlationId);
    const err = new Error(`OpenAI error ${res.status}: ${text}`);
    err.code = "AI_PROVIDER_ERROR";
    err.correlationId = correlationId;
    throw err;
  }

  const data = safeJsonParse(text, {});
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  return safeJsonParse(content, {});
}

/**
 * SEED TEMPLATES — used if Firestore has none yet.
 * You can edit/extend these later from Admin.
 */
const SEED_TEMPLATES = [
  {
    id: "grounding-10",
    title: "10-minute grounding after a hard day",
    category: "Grounding",
    intentLabel: "grounding",
    summary:
      "A short reset to help you land back in your body after stress, conflict, or group.",
    durationMinutes: 10,
  },
  {
    id: "cravings-urge-surf",
    title: "Ride the craving wave without acting",
    category: "Cravings / urges",
    intentLabel: "cravings",
    summary:
      "Use this when urges hit. It walks you through noticing the wave, breathing through it, and letting it pass.",
    durationMinutes: 8,
  },
  {
    id: "sleep-soft-landing",
    title: "Slow your mind before sleep",
    category: "Night / sleep reset",
    intentLabel: "sleep",
    summary:
      "A gentle wind-down when your thoughts are loud at night and you need something steady to hold on to.",
    durationMinutes: 12,
  },
  {
    id: "spiritual-reset-neutral",
    title: "Spiritual reset without heavy religion",
    category: "Spiritual reset",
    intentLabel: "spiritual_reset",
    summary:
      "A neutral, grounded check-in for your spirit, without forcing any belief system.",
    durationMinutes: 10,
  },
];

/**
 * List templates from Firestore, or seed if none exist.
 */
async function listTemplates(intent) {
  try {
    const col = db.collection("sessionTemplates");
    let query = col.where("active", "==", true).limit(50);

    if (intent) {
      query = query.where("intentLabel", "==", intent);
    }

    const snap = await query.get();

    if (snap.empty) {
      return SEED_TEMPLATES;
    }

    const out = [];
    snap.forEach((doc) => {
      out.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return out;
  } catch (err) {
    console.error("listTemplates error:", err);
    return SEED_TEMPLATES;
  }
}

/**
 * Generate a custom session with OpenAI and store it.
 */
async function generateSession(payload = {}) {
  const supportType =
    payload.supportType ||
    payload.need ||
    payload.topic ||
    "Grounding after a stressful moment";

  const tone =
    payload.tone ||
    payload.feel ||
    "calm, steady, non-judgmental and trauma-informed";

  const minutes =
    Number(payload.minutes || payload.durationMinutes || 10) || 10;

  const note =
    payload.note ||
    payload.context ||
    payload.freeText ||
    "User did not add extra context.";

  const systemMessage =
    "You are WellnessCafe OS, writing a short, trauma-informed session script " +
    "for someone in recovery. No religion, no shaming, no lecturing. " +
    "Speak gently, like a grounded peer counselor. " +
    "Respond ONLY with valid JSON using this shape:\n" +
    "{\n" +
    '  "title": string,\n' +
    '  "summary": string,\n' +
    '  "durationMinutes": number,\n' +
    '  "category": string,\n' +
    '  "steps": [\n' +
    '    { "title": string, "body": string }\n' +
    "  ]\n" +
    "}";

  const userMessage =
    `Support type: ${supportType}\n` +
    `Desired tone: ${tone}\n` +
    `Time available: ~${minutes} minutes\n` +
    `Extra context from user:\n${note}`;

  const correlationId = payload.correlationId || "";
  const raw = await callOpenAIJSON(systemMessage, userMessage, correlationId);

  const userId = payload.userId || "unknown";
  
  const session = {
    userId,
    title: raw.title || `${supportType} (${minutes} min)`,
    summary:
      raw.summary ||
      "A short, guided practice to help you slow down, breathe, and stay in your body.",
    durationMinutes: raw.durationMinutes || minutes,
    category: raw.category || supportType,
    steps: Array.isArray(raw.steps) ? raw.steps : [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: "ai_generate",
  };

  // Store in Firestore as a draft session
  const ref = await db.collection("sessions").add(session);
  
  // Update user's lastSession
  if (userId && userId !== "unknown") {
    try {
      await db.collection("users").doc(userId).set({
        lastSession: session,
        lastSessionAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error("Failed to update user lastSession:", err);
    }
  }

  return { id: ref.id, ...session };
}

/**
 * Format session object as readable text
 */
function formatSessionAsText(session) {
  let text = "";
  
  if (session.title) {
    text += `${session.title}\n\n`;
  }
  
  if (session.summary) {
    text += `${session.summary}\n\n`;
  }
  
  if (session.steps && Array.isArray(session.steps)) {
    session.steps.forEach((step, idx) => {
      if (step.title) {
        text += `${idx + 1}. ${step.title}\n`;
      }
      if (step.body) {
        text += `${step.body}\n\n`;
      }
    });
  }
  
  return text.trim() || "Session generated successfully.";
}

/**
 * Main HTTP handler for /aiSession
 */
async function handleSession(req, res) {
  setCorsHeaders(req, res);
  res.set("Content-Type", "application/json"); // ALWAYS return JSON (standardized)

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ 
      ok: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed" },
      correlationId: req.body?.correlationId || "unknown",
    });
  }

  try {
    const body = typeof req.body === "string" ? safeJsonParse(req.body, {}) : req.body || {};
    const userId = body.userId || "unknown";
    const correlationId = body.correlationId || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const { key: apiKey, source: keySource } = getResolvedOpenAIKey();
    if (process.env.NODE_ENV !== "production") {
      console.log("[aiSession] openai_key", { present: !!apiKey, source: keySource, masked: apiKey ? maskKeyForLog(apiKey) : undefined });
    }
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: { code: "AI_PROVIDER_NOT_CONFIGURED", message: "AI provider not configured" },
        correlationId,
      });
    }

    const mode = body.mode || "session"

    // SAFETY GATE: Block dangerous tool requests (self-harm, surgery, medical procedures)
    const DANGEROUS_TOOL_PATTERN = /(self-surgeon|self_surgeon|surgery|procedure|incision|stitch|remove at home)/i
    if (DANGEROUS_TOOL_PATTERN.test(mode)) {
      return res.status(200).json({
        ok: true,
        correlationId,
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          text: "I'm here with you. What you're describing sounds like it needs professional medical care. If this is urgent, please reach out to emergency services or a healthcare provider. I can help you find resources or support while you take that step.",
          meta: {},
        },
        tool: null,
      })
    }

    // Handle telemetry mode
    if (mode === "telemetry") {
      const event = body.event || {};
      try {
        await db.collection("telemetry").add({
          userId,
          event,
          ts: admin.firestore.FieldValue.serverTimestamp(),
        });
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error("Telemetry save error:", err);
        return res.status(200).json({ ok: true }); // Don't fail the request
      }
    }

    // MODE: templates  → list AI-ready templates
    if (mode === "templates") {
      const intent = body.intent || body.category || null;
      const templates = await listTemplates(intent);
      return res.status(200).json({ templates });
    }

    // MODE: generate_session → build a custom flow
    if (mode === "generate_session") {
      const correlationId = body.correlationId || `srv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Validate payload
      const supportType = body.supportType || body.category || "Grounding";
      const feel = body.tone || body.feel || "calm, steady, non-judgmental";
      const duration = Number(body.minutes || body.durationMinutes || 10) || 10;
      const notes = body.note || body.notes || body.context || "";
      
      // Structured logging
      console.log("[generate_session]", {
        correlationId,
        userId,
        supportType,
        feel,
        duration,
        hasNotes: !!notes,
      });
      
      try {
        const session = await generateSession({
          supportType,
          tone: feel,
          minutes: duration,
          note: notes,
          userId,
          correlationId,
        });
        
        // Format session content as text for message.text
        const sessionText = formatSessionAsText(session);
        
        // STANDARDIZED RESPONSE SCHEMA
        return res.status(200).json({
          ok: true,
          correlationId,
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            text: sessionText,
            meta: {
              sessionId: session.id,
              title: session.title,
              durationMinutes: session.durationMinutes,
              category: session.category,
            },
          },
          tool: null,
          // Also include session object for backward compatibility
          session,
        });
      } catch (err) {
        if (err.code === "AI_PROVIDER_UNAUTHORIZED") {
          return res.status(401).json({
            ok: false,
            error: { code: "AI_PROVIDER_UNAUTHORIZED", message: "Invalid API key" },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
            tool: null,
          });
        }
        if (err.code === "RATE_LIMITED") {
          res.set("Retry-After", "60");
          return res.status(429).json({
            ok: false,
            error: { code: "RATE_LIMITED", message: "Rate limited. Please retry in a moment." },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "I'm a bit overloaded. Please try again in a moment." },
            tool: null,
          });
        }
        if (err.code === "AI_PROVIDER_ERROR") {
          return res.status(502).json({
            ok: false,
            error: { code: "AI_PROVIDER_ERROR", message: "AI provider error" },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
            tool: null,
          });
        }
        console.error("[generate_session] Error:", {
          correlationId,
          error: err.message,
          stack: err.stack,
        });

        // Return safe response WITHOUT session (circuit-breaker)
        return res.status(500).json({
          ok: false,
          correlationId,
          error: {
            code: "SESSION_GENERATION_ERROR",
            message: err.message || "Failed to generate session",
          },
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            text: "I'm having trouble building your session right now. Please try again in a moment.",
          },
          tool: null,
        });
      }
    }

    // MODE: agent → run specific AI agent (Seer, Oracle, Overseer, Sentinel)
    if (mode === "agent") {
      return await handleAgent(req, res, { ...body, userId });
    }

    // (Future) MODE: template_detail, admin_list, admin_save can be added here

    // TOOL ROUTING: Handle tool-specific modes (self-surgeon removed — safety)
    const toolModes = ["breathing", "grounding", "urge-surfing", "journaling", "body-scan", "meditation", "education"]
    if (toolModes.includes(mode)) {
      const toolIdMap = {
        "urge-surfing": "urge-surfing",
        "body-scan": "body-scan",
      }
      const toolId = toolIdMap[mode] || mode

      // Safety gate: block any toolRequested matching dangerous patterns (model or client)
      if (DANGEROUS_TOOL_PATTERN.test(toolId)) {
        return res.status(200).json({
          ok: true,
          correlationId,
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            text: "I'm here with you. What you're describing sounds like it needs professional medical care. If this is urgent, please reach out to emergency services or a healthcare provider. I can help you find resources or support while you take that step.",
            meta: {},
          },
          tool: null,
        })
      }
      
      const prompt =
        body.prompt ||
        body.message ||
        body.text ||
        (body.messages && body.messages.length > 0 && body.messages[body.messages.length - 1]?.content) ||
        "Help me with a short, gentle recovery reflection.";

      const context = body.context || "";

      try {
        const result = await runSimpleChat(prompt, context, correlationId);

        // Validate tool exists in registry (server-side truth-gate; self-surgeon removed)
        const validTools = ["breathing", "grounding", "body-scan", "journaling", "urge-surfing", "meditation", "education"]
        const normalizedToolId = toolIdMap[toolId] || toolId;
        const toolExists = validTools.includes(normalizedToolId);
        
        // STANDARDIZED RESPONSE SCHEMA
        const response = {
          ok: true,
          correlationId,
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            text: result.reply || result.content || "I'm here. Let's take this one breath at a time.",
            meta: result.meta || {},
          },
          // Only include tool if it exists (Truth-Gate)
          tool: toolExists ? {
            name: normalizedToolId,
            action: "open",
            params: {},
          } : null,
        };
        
        console.log("[aiSession] Tool-mode response", {
          correlationId,
          toolRequested: toolId,
          toolExists,
          toolIncluded: !!response.tool,
        });
        
        return res.status(200).json(response);
      } catch (chatErr) {
        if (chatErr.code === "AI_PROVIDER_UNAUTHORIZED") {
          return res.status(401).json({
            ok: false,
            error: { code: "AI_PROVIDER_UNAUTHORIZED", message: "Invalid API key" },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
            tool: null,
          });
        }
        if (chatErr.code === "RATE_LIMITED") {
          res.set("Retry-After", "60");
          return res.status(429).json({
            ok: false,
            error: { code: "RATE_LIMITED", message: "Rate limited. Please retry in a moment." },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "I'm a bit overloaded. Please try again in a moment." },
            tool: null,
          });
        }
        if (chatErr.code === "AI_PROVIDER_ERROR") {
          return res.status(502).json({
            ok: false,
            error: { code: "AI_PROVIDER_ERROR", message: "AI provider error" },
            correlationId,
            message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
            tool: null,
          });
        }
        console.error("[aiSession] Tool-mode chat error:", {
          correlationId,
          error: chatErr.message,
          stack: chatErr.stack,
        });

        // Return safe response WITHOUT tool (circuit-breaker: don't route to broken tool)
        return res.status(500).json({
          ok: false,
          correlationId,
          error: {
            code: "CHAT_ERROR",
            message: "Failed to generate response",
          },
          message: {
            id: `msg_${Date.now()}`,
            role: "assistant",
            text: "I'm having trouble right now. Please try again in a moment.",
          },
          tool: null,
        });
      }
    }

    // DEFAULT: simple chat / generic AI reply (backwards compatible)
    const prompt =
      body.prompt ||
      body.message ||
      body.text ||
      (body.messages && body.messages.length > 0 && body.messages[body.messages.length - 1]?.content) ||
      "Help me with a short, gentle recovery reflection.";

    let context = body.context || "";

    // Intent: directory_lookup — conservative gate; only query if confidence >= threshold
    const { confidence: dirConf, queryHint } = evaluateDirectoryIntent(prompt);
    if (dirConf > 0 && dirConf < DIRECTORY_CONFIDENCE_THRESHOLD) {
      return res.status(200).json({
        ok: true,
        correlationId,
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          text: "I'd like to help you find resources. What kind of support are you looking for—housing, grants, treatment programs, or something else?",
          meta: { directoryIntent: "clarifying" },
        },
        tool: null,
      });
    }
    if (dirConf >= DIRECTORY_CONFIDENCE_THRESHOLD) {
      const resources = await queryResourcesForContext(queryHint, 8);
      if (resources.length > 0) {
        const resourceBlob = resources.map((r) =>
          `- ${r.title} (${r.type})${r.verified ? " [verified]" : ""}${r.contact?.url ? ` — ${r.contact.url}` : ""}`
        ).join("\n");
        context = (context ? context + "\n\n" : "") +
          `[LIVE RESOURCES — use only these; never invent resources]\n${resourceBlob}\n\n` +
          "Mention matching resources briefly. If none match, say so calmly and ask one targeted follow-up (e.g. region or type of help).";
      } else {
        context = (context ? context + "\n\n" : "") +
          "[No resources found in directory.] Do not invent resources. Say: 'I couldn't find matching resources.' Then ask exactly one targeted follow-up (e.g. 'What region are you in?' or 'What type of help—housing, grants, or treatment?').";
      }
    }

    try {
      const result = await runSimpleChat(prompt, context, correlationId);

      // STANDARDIZED RESPONSE SCHEMA (default chat mode)
      return res.status(200).json({
        ok: true,
        correlationId,
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          text: result.reply || result.content || "I'm here. Let's take this one breath at a time.",
          meta: result.meta || {},
        },
        tool: null, // No tool in default chat mode
      });
    } catch (chatErr) {
      if (chatErr.code === "AI_PROVIDER_UNAUTHORIZED") {
        return res.status(401).json({
          ok: false,
          error: { code: "AI_PROVIDER_UNAUTHORIZED", message: "Invalid API key" },
          correlationId,
          message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
          tool: null,
        });
      }
      if (chatErr.code === "RATE_LIMITED") {
        res.set("Retry-After", "60");
        return res.status(429).json({
          ok: false,
          error: { code: "RATE_LIMITED", message: "Rate limited. Please retry in a moment." },
          correlationId,
          message: { id: `msg_${Date.now()}`, role: "assistant", text: "I'm a bit overloaded. Please try again in a moment." },
          tool: null,
        });
      }
      if (chatErr.code === "AI_PROVIDER_ERROR") {
        return res.status(502).json({
          ok: false,
          error: { code: "AI_PROVIDER_ERROR", message: "AI provider error" },
          correlationId,
          message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
          tool: null,
        });
      }
      console.error("[aiSession] Simple chat error:", {
        correlationId,
        error: chatErr.message,
        stack: chatErr.stack,
      });

      return res.status(500).json({
        ok: false,
        correlationId,
        error: {
          code: "CHAT_ERROR",
          message: chatErr.message || "Failed to generate response",
        },
        message: {
          id: `msg_${Date.now()}`,
          role: "assistant",
          text: "I'm having trouble right now. Please try again in a moment.",
        },
        tool: null,
      });
    }
  } catch (err) {
    const topCorrelationId = (req.body && typeof req.body === "object" && req.body?.correlationId) || "unknown";
    if (err.message === "AI provider not configured") {
      return res.status(500).json({
        ok: false,
        error: { code: "AI_PROVIDER_NOT_CONFIGURED", message: "AI provider not configured" },
        correlationId: topCorrelationId,
      });
    }
    if (err.code === "AI_PROVIDER_UNAUTHORIZED") {
      return res.status(401).json({
        ok: false,
        error: { code: "AI_PROVIDER_UNAUTHORIZED", message: "Invalid API key" },
        correlationId: topCorrelationId,
        message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
        tool: null,
      });
    }
    if (err.code === "RATE_LIMITED") {
      res.set("Retry-After", "60");
      return res.status(429).json({
        ok: false,
        error: { code: "RATE_LIMITED", message: "Rate limited. Please retry in a moment." },
        correlationId: topCorrelationId,
        message: { id: `msg_${Date.now()}`, role: "assistant", text: "I'm a bit overloaded. Please try again in a moment." },
        tool: null,
      });
    }
    if (err.code === "AI_PROVIDER_ERROR") {
      return res.status(502).json({
        ok: false,
        error: { code: "AI_PROVIDER_ERROR", message: "AI provider error" },
        correlationId: topCorrelationId,
        message: { id: `msg_${Date.now()}`, role: "assistant", text: "AI temporarily unavailable. Please try again in a moment." },
        tool: null,
      });
    }
    console.error("[aiSession] Top-level error:", {
      correlationId: topCorrelationId,
      error: err.message,
      stack: err.stack,
    });

    // ALWAYS return JSON, never HTML or undefined
    return res.status(500).json({
      ok: false,
      correlationId: topCorrelationId,
      error: {
        code: "INTERNAL_ERROR",
        message: err.message || "Unknown error",
      },
      message: {
        id: `msg_${Date.now()}`,
        role: "assistant",
        text: "I'm having trouble right now. Please try again in a moment.",
      },
      tool: null,
    });
  }
}

/**
 * Stub for media. You already have this wired; keep or extend as needed.
 */
async function handleMedia(req, res) {
  res.status(501).json({ error: "aiMedia not implemented yet" });
}

/**
 * Handle agent execution requests
 */
async function handleAgent(req, res, body) {
  const agent = body.agent || "seer";
  const userId = body.userId || "unknown";

  // Agent-specific system prompts
  const agentPrompts = {
    seer: `You are The Seer, an AI agent that observes patterns in how people use WellnessCafe OS.
Your role: Analyze telemetry data and identify trends, usage patterns, and insights.
Be concise, data-driven, and focus on actionable observations.
Respond with a JSON object: { "summary": "your pattern analysis", "insights": ["insight1", "insight2"] }`,

    oracle: `You are The Oracle, an AI agent that provides deep wisdom by fusing memory with questions.
Your role: Connect user context with long-term memory to offer profound, trauma-informed guidance.
Be wise, compassionate, and grounded. Speak like a trusted counselor.
Respond with a JSON object: { "summary": "your guidance", "wisdom": "deeper insight" }`,

    overseer: `You are The Overseer, an AI agent that orchestrates actions and creates structured plans.
Your role: Turn insights into clear, actionable next-right-step plans and session orchestrations.
Be practical, structured, and focused on creating helpful session plans.
Respond with a JSON object: { "summary": "your plan", "steps": ["step1", "step2"], "session": {...} }`,

    sentinel: `You are The Sentinel, an AI agent that monitors for risk and flags alerts.
Your role: Watch for triggers, escalation signals, and crisis indicators in user behavior.
Be vigilant, protective, and clear about risk levels.
Respond with a JSON object: { "summary": "risk assessment", "alerts": ["alert1"], "riskLevel": "low|medium|high" }`,
  };

  const systemPrompt = agentPrompts[agent] || agentPrompts.seer;
  const userPrompt = body.question || body.prompt || "Analyze the current state.";

  // Build context from payload
  let context = "";
  if (body.telemetry) {
    context += `Telemetry data: ${JSON.stringify(body.telemetry)}\n\n`;
  }
  if (body.memory) {
    context += `Memory context: ${JSON.stringify(body.memory)}\n\n`;
  }
  if (body.state) {
    context += `State snapshot: ${JSON.stringify(body.state)}\n\n`;
  }
  if (body.goal) {
    context += `Goal: ${body.goal}\n\n`;
  }
  if (body.thresholds) {
    context += `Risk thresholds: ${JSON.stringify(body.thresholds)}\n\n`;
  }

  const fullUserPrompt = context ? `${context}${userPrompt}` : userPrompt;
  const correlationId = body.correlationId || "";

  try {
    const result = await callOpenAIJSON(systemPrompt, fullUserPrompt, correlationId);

    // Store agent execution in Firestore
    try {
      await db.collection("agentExecutions").add({
        userId,
        agent,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        success: true,
        responseTime: 0, // Would need to track this
        result: result,
      });
    } catch (err) {
      console.error("Failed to store agent execution:", err);
    }

    return res.status(200).json({
      agent,
      success: true,
      result: result,
    });
  } catch (err) {
    if (err.code === "AI_PROVIDER_UNAUTHORIZED") {
      return res.status(401).json({
        agent,
        success: false,
        error: { code: "AI_PROVIDER_UNAUTHORIZED", message: "Invalid API key" },
        correlationId: body.correlationId || "",
      });
    }
    if (err.code === "RATE_LIMITED") {
      res.set("Retry-After", "60");
      return res.status(429).json({
        agent,
        success: false,
        error: { code: "RATE_LIMITED", message: "Rate limited. Please retry in a moment." },
        correlationId: body.correlationId || "",
      });
    }
    if (err.code === "AI_PROVIDER_ERROR") {
      return res.status(502).json({
        agent,
        success: false,
        error: { code: "AI_PROVIDER_ERROR", message: "AI provider error" },
        correlationId: body.correlationId || "",
      });
    }
    console.error(`Agent ${agent} execution error:`, err);

    // Store failed execution
    try {
      await db.collection("agentExecutions").add({
        userId,
        agent,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        success: false,
        error: err.message,
      });
    } catch (storeErr) {
      console.error("Failed to store agent execution error:", storeErr);
    }

    return res.status(500).json({
      agent,
      success: false,
      error: { code: "AGENT_ERROR", message: err.message || "Agent execution failed" },
    });
  }
}

module.exports = {
  handleSession,
  handleMedia,
};
