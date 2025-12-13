// functions/src/multimodal.js
// Multimodal wellness engine (chat, TTS, STT)

const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ===== CONFIG =====
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5182",
  "https://wellnesscafe.net",
  "https://www.wellnesscafe.net",
];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.warn("OPENAI_API_KEY not set. Multimodal features disabled.");
}

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

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

    if (!openai) {
      return res.status(503).json({ error: "OpenAI not configured" });
    }

    try {
      const { messages = [], mode = "default", audioInput } = req.body;

      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      let history = [...messages];

      // ===== STT (if audio input) =====
      if (audioInput) {
        const buffer = Buffer.from(audioInput, "base64");
        const tmp = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
        fs.writeFileSync(tmp, buffer);

        const transcript = await openai.audio.transcriptions.create({
          file: fs.createReadStream(tmp),
          model: "whisper-1",
          language: "en",
        });

        fs.unlinkSync(tmp);

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
            model: "tts-1",
            voice: "alloy",
            input: reply,
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

    if (!openai) {
      return res.status(503).json({ error: "OpenAI not configured" });
    }

    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text" });

      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      const buf = Buffer.from(await speech.arrayBuffer());

      res.json({
        ok: true,
        audio: buf.toString("base64"),
        mimeType: "audio/mp3",
      });
    } catch (err) {
      logger.error("TTS error:", err);
      res.status(500).json({ error: "TTS failed" });
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

    if (!openai) {
      return res.status(503).json({ error: "OpenAI not configured" });
    }

    try {
      const { audio } = req.body;
      if (!audio) return res.status(400).json({ error: "Missing audio" });

      const buffer = Buffer.from(audio, "base64");
      const tmp = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
      fs.writeFileSync(tmp, buffer);

      const transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tmp),
        model: "whisper-1",
        language: "en",
      });

      fs.unlinkSync(tmp);

      res.json({ ok: true, text: transcript.text });
    } catch (err) {
      logger.error("STT error:", err);
      res.status(500).json({ error: "STT failed" });
    }
  }
);
