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
 * Main HTTP handler for /aiSession
 */
async function handleSession(req, res) {
  // Simple CORS for your frontend
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? safeJsonParse(req.body, {}) : req.body || {};
    const userId = body.userId || "unknown";

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
      const session = await generateSession({ ...body, userId });
      return res.status(200).json({ session });
    }

    // (Future) MODE: template_detail, admin_list, admin_save can be added here

    // DEFAULT: simple chat / generic AI reply (backwards compatible)
    const prompt =
      body.prompt ||
      body.message ||
      body.text ||
      "Help me with a short, gentle recovery reflection.";

    const context = body.context || "";

    const result = await runSimpleChat(prompt, context);

    return res.status(200).json(result);
  } catch (err) {
    console.error("aiSession error:", err);
    return res.status(500).json({
      error: "AI session error",
      message: err.message || "Unknown error",
    });
  }
}

/**
 * Stub for media. You already have this wired; keep or extend as needed.
 */
async function handleMedia(req, res) {
  res.status(501).json({ error: "aiMedia not implemented yet" });
}

module.exports = {
  handleSession,
  handleMedia,
};
