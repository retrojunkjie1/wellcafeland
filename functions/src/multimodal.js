// functions/src/multimodal.js
// Multimodal wellness engine (chat, TTS, STT)

const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("./firebaseAdminCompat.cjs");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { AI_REQUEST_LIMITS, consumeAIRequestQuota } = require("../aiRateLimiter");
const { recordAIQuotaBlock } = require("./securitySignals");
const { verifyHttpAppCheck } = require("./httpAppCheck");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ===== CONFIG =====
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5182",
  "https://wellnesscafe.net",
  "https://www.wellnesscafe.net",
  "https://wellnesscafe.app",
  "https://www.wellnesscafe.app",
  "https://wellnesscafelanding.web.app",
];

const WELLNESS_VOICE_INSTRUCTIONS = [
  "Speak as a grounded, compassionate person guiding one listener through a quiet wellness practice.",
  "Use a natural, human conversational cadence with relaxed phrasing, gentle warmth, subtle emotional variation, and an easy, steady pace.",
  "Keep the voice warm and full, with smooth, softly articulated s, sh, and t sounds; avoid a sharp hiss, excessive sibilance, brittle brightness, and exaggerated breath noise without muffling consonants.",
  "Sound present and reassuring, never robotic, breathy, theatrical, overly polished, or like a commercial announcer.",
  "Connect phrases smoothly. Use only brief natural pauses at punctuation, and avoid long gaps or stretched words.",
  "Pronounce names and resource acronyms clearly. Read the provided words faithfully; do not add advice, interpretation, or extra words.",
].join(" ");
const ALLOWED_TTS_VOICES = new Set(["marin", "cedar"]);
const MAX_SPEECH_CHARACTERS = 4096;
const MAX_AUDIO_BASE64_CHARACTERS = 8_000_000;
const MAX_CHAT_MESSAGES = 30;
const MAX_CHAT_PAYLOAD_CHARACTERS = 2_200_000;
const AUDIO_MIME_EXTENSIONS = Object.freeze({
  "audio/flac": ".flac",
  "audio/mp3": ".mp3",
  "audio/mp4": ".mp4",
  "audio/m4a": ".m4a",
  "audio/mpga": ".mpga",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "audio/webm": ".webm",
  "audio/x-m4a": ".m4a",
  "audio/x-wav": ".wav",
});

function resolveTranscriptionAudioType(mimeType) {
  const normalizedMimeType = typeof mimeType === "string" && mimeType.trim()
    ? mimeType.split(";")[0].trim().toLowerCase()
    : "audio/webm"; // Backward compatibility for clients predating MIME forwarding.
  const extension = AUDIO_MIME_EXTENSIONS[normalizedMimeType];
  return extension ? { mimeType: normalizedMimeType, extension } : null;
}

async function transcribeAudioPayload({ audio, mimeType }, openai) {
  if (typeof audio !== "string" || !audio) {
    return { status: 400, body: { error: "Missing audio" } };
  }
  if (audio.length > MAX_AUDIO_BASE64_CHARACTERS) {
    return { status: 413, body: { ok: false, code: "AUDIO_TOO_LARGE", error: "This recording is too large to process." } };
  }

  const audioType = resolveTranscriptionAudioType(mimeType);
  if (!audioType) {
    return { status: 415, body: { ok: false, code: "AUDIO_FORMAT_UNSUPPORTED", error: "This recording format can’t be transcribed. Please record again." } };
  }
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(audio)) {
    return { status: 400, body: { ok: false, code: "AUDIO_INVALID", error: "This recording could not be read. Please record again." } };
  }

  const buffer = Buffer.from(audio, "base64");
  if (!buffer.length) {
    return { status: 400, body: { ok: false, code: "AUDIO_INVALID", error: "This recording could not be read. Please record again." } };
  }

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "wellnesscafe-stt-"));
  const tmp = path.join(tempDir, `recording${audioType.extension}`);
  try {
    await fs.promises.writeFile(tmp, buffer);
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmp),
      model: "whisper-1",
      language: "en",
    });
    return { status: 200, body: { ok: true, text: transcript.text } };
  } finally {
    await fs.promises.unlink(tmp).catch(() => {});
    await fs.promises.rmdir(tempDir).catch(() => {});
  }
}

async function authorizeAICall(req, res, dependencies = {}) {
  const appCheckAccepted = await verifyHttpAppCheck(req, res, {
    verifyToken: dependencies.verifyAppCheckToken,
  });
  if (!appCheckAccepted) return null;

  const auth = dependencies.auth || admin.auth();
  const quota = dependencies.consumeQuota || consumeAIRequestQuota;
  const quotaDb = dependencies.db || db;
  const signalQuotaBlock = dependencies.recordAbuseSignal || recordAIQuotaBlock;
  const authorization = req.headers?.authorization || req.headers?.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) {
    res.status(401).json({ ok: false, code: "AUTH_REQUIRED", error: "Sign in to use this AI service." });
    return null;
  }

  let decoded;
  try {
    decoded = await auth.verifyIdToken(match[1]);
  } catch {
    res.status(401).json({ ok: false, code: "AUTH_INVALID", error: "Your session could not be verified. Please sign in again." });
    return null;
  }
  if (!decoded?.uid) {
    res.status(401).json({ ok: false, code: "AUTH_INVALID", error: "Your session could not be verified. Please sign in again." });
    return null;
  }

  try {
    const result = await quota({
      db: quotaDb,
      uid: decoded.uid,
      onAbuseSignal: (uid, now) => signalQuotaBlock({ firestore: quotaDb, uid, now }),
    });
    if (!result.allowed) {
      const retryAfterSeconds = Math.max(1, Number(result.retryAfterSeconds) || 1);
      res.set("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        ok: false,
        code: "RATE_LIMITED",
        error: "You've made several AI requests. Please try again shortly.",
        retryAfterSeconds,
        limits: AI_REQUEST_LIMITS,
      });
      return null;
    }
  } catch (error) {
    logger.error("AI request quota unavailable", { code: error?.code || "UNKNOWN" });
    res.status(503).json({ ok: false, code: "AI_RATE_LIMIT_UNAVAILABLE", error: "This AI service is temporarily unavailable. Please try again shortly." });
    return null;
  }

  return decoded.uid;
}

let _openai = null
function getOpenAI() {
  if (_openai) return _openai
  const key = (process.env.OPENAI_API_KEY || "").trim()
  if (!key) return null
  _openai = new OpenAI({ apiKey: key })
  return _openai
}

function classifyTtsProviderFailure(error) {
  const providerStatus = Number(error?.status) || 0;
  const providerCode = typeof error?.code === "string" ? error.code.slice(0, 80) : "UNKNOWN";
  const code = providerStatus === 401 || providerStatus === 403
    ? "TTS_PROVIDER_AUTH_FAILED"
    : providerStatus === 429
      ? "TTS_PROVIDER_RATE_LIMITED"
      : providerStatus >= 500
        ? "TTS_PROVIDER_UNAVAILABLE"
        : "TTS_PROVIDER_FAILED";
  return { providerStatus, providerCode, code };
}

// ===== SYSTEM PROMPT =====
const SYSTEM_PROMPT = `
You are a compassionate, trauma-informed wellness guide.
Be calm, non-judgmental, and supportive.
Never give medical advice or instructions for harm.
Encourage professional help during crisis.
`.trim();

// ===== HELPERS =====
function wantsAudio(text = "") {
  const t = text.toLowerCase();
  return ["speak", "audio", "read", "say it", "tell me"].some(k => t.includes(k));
}

function detectEmotionalNeeds(text = "") {
  const t = text.toLowerCase();
  return {
    panic: t.includes("panic") || t.includes("can't breathe"),
    urge: t.includes("craving") || t.includes("urge"),
  };
}

// =====================================================
// POST /multimodalChat  (MAIN CHAT ENDPOINT)
// =====================================================
exports.chat = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!await authorizeAICall(req, res)) return;

    const openai = getOpenAI()
    if (!openai) {
      logger.warn("OPENAI_API_KEY not set. Multimodal features disabled.")
      return res.status(503).json({ error: "OpenAI not configured" })
    }

    try {
      const { messages = [], mode = "default", audioInput } = req.body;

      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }
      if (messages.length > MAX_CHAT_MESSAGES || JSON.stringify(messages).length > MAX_CHAT_PAYLOAD_CHARACTERS) {
        return res.status(413).json({ ok: false, code: "AI_REQUEST_TOO_LARGE", error: "This message is too large. Shorten it and try again." });
      }
      if (audioInput && (typeof audioInput !== "string" || audioInput.length > MAX_AUDIO_BASE64_CHARACTERS)) {
        return res.status(413).json({ ok: false, code: "AUDIO_TOO_LARGE", error: "This recording is too large to process." });
      }

      let history = [...messages];

      // ===== STT (if audio input) =====
      if (audioInput) {
        const buffer = Buffer.from(audioInput, "base64");
        const tmp = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
        let transcript;
        try {
          await fs.promises.writeFile(tmp, buffer);
          transcript = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tmp),
            model: "whisper-1",
            language: "en",
          });
        } finally {
          await fs.promises.unlink(tmp).catch(() => {});
        }

        history.push({ role: "user", content: transcript.text });
      }

      const lastUser = history.filter(m => m.role === "user").pop();
      const userText = lastUser?.content || "";

      const needsAudio = wantsAudio(userText);
      const emotional = detectEmotionalNeeds(userText);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
        temperature: 0.7,
        max_tokens: 600,
      });

      const reply = completion.choices[0]?.message?.content || "";

      let response = {
        ok: true,
        type: "text",
        content: reply,
        mode,
      };

      // ===== TTS (if requested or panic) =====
      if (needsAudio || emotional.panic) {
        try {
          const speech = await openai.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "marin",
            input: reply.slice(0, MAX_SPEECH_CHARACTERS),
            instructions: WELLNESS_VOICE_INSTRUCTIONS,
            speed: 0.96,
          });

          const buf = Buffer.from(await speech.arrayBuffer());
          response.type = "audio";
          response.audio = buf.toString("base64");
          response.audioMimeType = "audio/mp3";
        } catch (e) {
          logger.warn("TTS failed", e);
        }
      }

      return res.json(response);
    } catch (err) {
      logger.error("multimodalChat error:", err);
      return res.status(500).json({
        error: "Internal server error",
        message: "Unable to process request",
      });
    }
  }
);

// ✅ ALIAS — THIS IS THE CRITICAL FIX
exports.multimodalChat = exports.chat;

// =====================================================
// POST /tts
// =====================================================
exports.tts = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!await authorizeAICall(req, res)) return;

    const openai = getOpenAI()
    if (!openai) {
      logger.warn("OPENAI_API_KEY not set. Multimodal features disabled.")
      return res.status(503).json({
        ok: false,
        code: "TTS_NOT_CONFIGURED",
        error: "Voice playback is unavailable right now. You can still read the reply.",
      })
    }

    try {
      const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
      const requestedVoice = typeof req.body?.voice === "string" ? req.body.voice.trim().toLowerCase() : "";
      if (!text) return res.status(400).json({ error: "Missing text" });
      if (text.length > MAX_SPEECH_CHARACTERS) {
        return res.status(413).json({ error: "Text is too long for a single voice response" });
      }

      const speech = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: ALLOWED_TTS_VOICES.has(requestedVoice) ? requestedVoice : "marin",
        input: text,
        instructions: WELLNESS_VOICE_INSTRUCTIONS,
        speed: 0.96,
      });

      const buf = Buffer.from(await speech.arrayBuffer());

      res.json({
        ok: true,
        audio: buf.toString("base64"),
        mimeType: "audio/mp3",
      });
    } catch (err) {
      // Keep provider errors useful for operations without logging request text or
      // returning provider details to the client.
      const { providerStatus, providerCode, code } = classifyTtsProviderFailure(err);
      logger.error("TTS provider request failed", { providerStatus, providerCode, code });
      res.status(502).json({
        ok: false,
        code,
        error: "Voice playback is temporarily unavailable. You can still read the reply.",
      });
    }
  }
);

// =====================================================
// POST /stt
// =====================================================
exports.stt = onRequest(
  {
    region: "us-central1",
    cors: ALLOWED_ORIGINS,
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!await authorizeAICall(req, res)) return;

    const openai = getOpenAI()
    if (!openai) {
      logger.warn("OPENAI_API_KEY not set. Multimodal features disabled.")
      return res.status(503).json({ error: "OpenAI not configured" })
    }

    try {
      const result = await transcribeAudioPayload(req.body || {}, openai);
      return res.status(result.status).json(result.body);
    } catch (err) {
      logger.error("STT error:", err);
      res.status(500).json({ error: "STT failed" });
    }
  }
);

exports.__test = {
  authorizeAICall,
  classifyTtsProviderFailure,
  resolveTranscriptionAudioType,
  transcribeAudioPayload,
  MAX_AUDIO_BASE64_CHARACTERS,
  MAX_CHAT_MESSAGES,
  MAX_CHAT_PAYLOAD_CHARACTERS,
};
