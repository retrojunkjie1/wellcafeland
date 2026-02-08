// functions/aiBrain.js

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

const FIREWORKS_MODEL_SESSION =
  process.env.FIREWORKS_MODEL_SESSION || "deepseek-v3p1";

/**
 * Small helper: safe JSON parse
 */
function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Call Fireworks chat endpoint and ask for JSON back
 */
async function callFireworksJSON(systemMessage, userMessage) {
  if (!FIREWORKS_API_KEY) {
    throw new Error("FIREWORKS_API_KEY is not set");
  }

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: FIREWORKS_MODEL_SESSION,
        temperature: 0.35,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fireworks error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content =
    data.choices?.[0]?.message?.content ??
    data.choices?.[0]?.message?.[0]?.content ??
    "{}";

  return safeJsonParse(content, {});
}

/**
 * Basic chat mode for backwards compatibility
 */
async function runSimpleChat(prompt, context = "") {
  const systemMessage =
    "You are WellnessCafe OS. Speak like a calm, grounded recovery guide. " +
    "Use simple language. No technical jargon. Short paragraphs.";

  const userMessage = context
    ? `Context:\n${context}\n\nUser:\n${prompt}`
    : prompt;

  const res = await fetch(
    "https://api.fireworks.ai/inference/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIREWORKS_API_KEY}`,
      },
      body: JSON.stringify({
        model: FIREWORKS_MODEL_SESSION,
        temperature: 0.45,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fireworks chat error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  return { reply: content.trim() };
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
 * Generate a custom session with Fireworks and store it.
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

  const raw = await callFireworksJSON(systemMessage, userMessage);

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
  // Simple CORS for your frontend
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
    
    // Structured logging
    console.log("[aiSession]", {
      correlationId,
      userId,
      mode: body.mode || "default",
      toolIntent: body.mode || body.metadata?.toolIntent || null,
      schemaVersion: body.schemaVersion || "legacy",
    });

    const mode = body.mode || "session";
    
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

    // TOOL ROUTING: Handle tool-specific modes
    const toolModes = ["breathing", "grounding", "self_surgeon", "urge-surfing", "journaling", "body-scan", "meditation", "education"];
    if (toolModes.includes(mode)) {
      // Normalize mode to tool ID (handle self_surgeon → self-surgeon)
      const toolIdMap = {
        "self_surgeon": "self-surgeon",
        "urge-surfing": "urge-surfing",
        "body-scan": "body-scan",
      };
      const toolId = toolIdMap[mode] || mode;
      
      const prompt =
        body.prompt ||
        body.message ||
        body.text ||
        (body.messages && body.messages.length > 0 && body.messages[body.messages.length - 1]?.content) ||
        "Help me with a short, gentle recovery reflection.";

      const context = body.context || "";

      try {
        const result = await runSimpleChat(prompt, context);
        
        // Validate tool exists in registry (server-side truth-gate)
        const validTools = ["breathing", "grounding", "body-scan", "journaling", "self-surgeon", "urge-surfing", "meditation", "education"];
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
          // NO tool on error (Truth-Gate: don't promise tool if we failed)
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

    const context = body.context || "";

    try {
      const result = await runSimpleChat(prompt, context);
      
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
    console.error("[aiSession] Top-level error:", {
      correlationId: req.body?.correlationId || "unknown",
      error: err.message,
      stack: err.stack,
    });
    
    // ALWAYS return JSON, never HTML or undefined
    return res.status(500).json({
      ok: false,
      correlationId: req.body?.correlationId || "unknown",
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

  try {
    const result = await callFireworksJSON(systemPrompt, fullUserPrompt);

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
      error: err.message || "Agent execution failed",
    });
  }
}

module.exports = {
  handleSession,
  handleMedia,
};
