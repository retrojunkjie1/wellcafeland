// functions/src/multimodal.js
// Multimodal wellness engine using OpenAI (chat, TTS, STT, video detection)

const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const OpenAI = require("openai");

// For Firebase Functions v2, secrets are accessed via process.env
// Set via: firebase functions:secrets:set OPENAI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.warn("OPENAI_API_KEY not set. Multimodal features will be disabled.");
}

const openai = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null;

// System prompt for trauma-informed, addiction-aware guidance
const SYSTEM_PROMPT = `You are a compassionate, trauma-informed wellness guide. Your role is to support people in recovery, healing, and wellness journeys.

Core principles:
- Be non-judgmental, warm, and present
- Use trauma-informed language (acknowledge impact, avoid re-traumatizing)
- Understand addiction and recovery patterns without diagnosing
- Never provide medical advice, diagnoses, or medication recommendations
- Always encourage professional help for crisis or medical issues
- Be spiritually open but never preachy or dogmatic
- Avoid shame-based language or spiritual bypassing
- Keep responses grounded, practical, and accessible

Safety guardrails:
- If user expresses active self-harm or harm-to-others: respond with de-escalation, encourage crisis resources, avoid giving instructions
- If user asks for medical advice: gently redirect to licensed professionals
- If user seems in crisis: acknowledge their pain, validate their experience, encourage reaching out to crisis hotlines

Your responses should feel like a wise, calm presence—someone who understands suffering and can guide without fixing or preaching.`;

// Mode-specific system prompts
const MODE_PROMPTS = {
  breathing: `Generate a structured breathing exercise plan. Return ONLY valid JSON in this exact format:
{
  "title": "Exercise name (e.g., '4-7-8 Breathing Reset')",
  "lengthSeconds": 180,
  "cycles": 6,
  "steps": [
    {"phase": "inhale", "seconds": 4, "text": "Gentle guidance for inhale phase"},
    {"phase": "hold", "seconds": 7, "text": "Gentle guidance for hold phase"},
    {"phase": "exhale", "seconds": 8, "text": "Gentle guidance for exhale phase"}
  ],
  "coachingScript": "A complete spoken script in second person, calm and grounding"
}

Keep scripts short, plain, and grounded. No spiritual bypassing.`,

  grounding: `Generate a structured 5-4-3-2-1 grounding exercise or body scan. Return ONLY valid JSON:
{
  "title": "Exercise name",
  "steps": [
    {"sense": "see", "count": 5, "prompt": "Name 5 things you can see..."},
    {"sense": "feel", "count": 4, "prompt": "Name 4 things you can feel..."},
    {"sense": "hear", "count": 3, "prompt": "Name 3 things you can hear..."},
    {"sense": "smell", "count": 2, "prompt": "Name 2 things you can smell..."},
    {"sense": "taste", "count": 1, "prompt": "Name 1 thing you can taste..."}
  ],
  "coachingScript": "Complete spoken guidance for the exercise"
}`,

  education: `Generate educational content about the requested topic. Return structured content:
{
  "title": "Topic title",
  "sections": [
    {"heading": "Section heading", "content": "Paragraph content"},
    {"heading": "Another section", "content": "More content"}
  ],
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "reflectionQuestions": ["Question 1", "Question 2"]
}

Keep content accessible, trauma-informed, and suitable for people in recovery.`,

  self_surgeon: `Generate a gentle self-inquiry script. Return ONLY valid JSON:
{
  "title": "Self-Inquiry Session",
  "questions": [
    {"text": "First gentle question", "pauseSeconds": 30},
    {"text": "Second question", "pauseSeconds": 45}
  ],
  "reflection": "Gentle closing reflection"
}

Questions should be open, non-leading, and safe. Allow space for whatever arises.`,
};

/**
 * Detect if user wants audio response
 */
function wantsAudio(userMessage) {
  const lower = userMessage.toLowerCase();
  return (
    lower.includes("speak") ||
    lower.includes("talk back") ||
    lower.includes("audio") ||
    lower.includes("say it") ||
    lower.includes("tell me") ||
    lower.includes("read it")
  );
}

/**
 * Detect if user wants video response
 */
function wantsVideo(userMessage) {
  const lower = userMessage.toLowerCase();
  return (
    lower.includes("show me") ||
    lower.includes("demonstrate") ||
    lower.includes("visual") ||
    lower.includes("exercise") ||
    lower.includes("yoga") ||
    lower.includes("stretch") ||
    lower.includes("breathing technique") ||
    lower.includes("breathing exercise") ||
    lower.includes("how to") ||
    lower.includes("guide me through")
  );
}

/**
 * Detect emotional/spiritual needs
 */
function detectEmotionalNeeds(userMessage) {
  const lower = userMessage.toLowerCase();
  const needs = {
    panic: lower.includes("panic") || lower.includes("overwhelmed") || lower.includes("can't breathe") || lower.includes("freaking out"),
    urge: lower.includes("craving") || lower.includes("urge") || lower.includes("want to use") || lower.includes("tempted"),
    overwhelm: lower.includes("overwhelmed") || lower.includes("too much") || lower.includes("can't handle") || lower.includes("drowning"),
    crisis: lower.includes("crisis") || lower.includes("emergency") || lower.includes("help me") || lower.includes("suicide"),
  };
  return needs;
}

/**
 * Generate video URL based on intent
 * For now, return placeholder URLs - in production, these would be hosted videos
 */
function getVideoUrlForIntent(intent, mode) {
  // Placeholder video URLs - in production, these would be actual hosted videos
  const videoMap = {
    breathing: "https://example.com/videos/breathing-guide.mp4",
    grounding: "https://example.com/videos/grounding-visualization.mp4",
    yoga: "https://example.com/videos/gentle-yoga.mp4",
    stretch: "https://example.com/videos/stretching-guide.mp4",
    exercise: "https://example.com/videos/wellness-exercise.mp4",
  };
  
  return videoMap[mode] || videoMap[intent] || null;
}

/**
 * POST /multimodalChat
 * Wellness chat with mode-specific behavior and multimodal detection
 */
exports.chat = onRequest(
  {
    cors: true,
    region: "us-central1",
    secrets: ["OPENAI_API_KEY"],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!openai) {
      return res.status(503).json({
        error: "OpenAI not configured",
        message: "Wellness engine is not available right now.",
      });
    }

    try {
      const { messages, mode = "default", audioInput, imageInput } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array" });
      }

      // Get last user message
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      const userMessageText = lastUserMessage?.content?.toLowerCase() || "";

      // Detect multimodal needs
      const needsAudio = wantsAudio(userMessageText);
      const needsVideo = wantsVideo(userMessageText);
      const emotionalNeeds = detectEmotionalNeeds(userMessageText);

      // Build system prompt based on mode
      let systemPrompt = SYSTEM_PROMPT;
      if (mode !== "default" && MODE_PROMPTS[mode]) {
        systemPrompt = `${SYSTEM_PROMPT}\n\n${MODE_PROMPTS[mode]}`;
      }

      // Safety guardrails: Check for crisis/self-harm language
      const crisisKeywords = [
        "kill myself", "suicide", "end it", "hurt myself", "hurt someone",
        "want to die", "end my life", "not worth living", "better off dead",
        "going to kill", "planning to hurt", "cut myself", "self harm"
      ];
      const hasCrisis = crisisKeywords.some((kw) => userMessageText.includes(kw));

      // Log safety events (non-blocking)
      if (hasCrisis) {
        logger.warn("[multimodal] Safety event detected", {
          type: "safety",
          hasCrisis: true,
          timestamp: new Date().toISOString(),
        });
        
        systemPrompt += `\n\nCRISIS DETECTED: Respond with de-escalation, validation, and encourage immediate connection to crisis resources. Do not give instructions. Provide compassionate support and direct to professional help.`;
      }

      // Check for active substance use encouragement requests
      const substanceKeywords = ["how to use", "where to get", "best way to", "teach me to use"];
      const hasSubstanceRequest = substanceKeywords.some((kw) => userMessageText.includes(kw)) &&
                                  (userMessageText.includes("drug") || userMessageText.includes("substance") || 
                                   userMessageText.includes("alcohol") || userMessageText.includes("drink"));
      
      if (hasSubstanceRequest) {
        logger.warn("[multimodal] Substance use request detected", {
          type: "safety",
          hasSubstanceRequest: true,
          timestamp: new Date().toISOString(),
        });
        
        systemPrompt += `\n\nSAFETY: User may be asking about substance use. Do not provide instructions. Redirect to harm reduction resources, professional help, or recovery support.`;
      }

      // Add emotional context if detected
      if (emotionalNeeds.panic) {
        systemPrompt += `\n\nUser appears to be in panic. Offer grounding techniques and calming presence.`;
      }
      if (emotionalNeeds.urge) {
        systemPrompt += `\n\nUser is experiencing cravings/urges. Offer urge-surfing techniques and compassionate support.`;
      }
      if (emotionalNeeds.overwhelm) {
        systemPrompt += `\n\nUser feels overwhelmed. Offer gentle, step-by-step support and validation.`;
      }

      // Handle audio input if provided
      let messageHistory = [...messages];
      if (audioInput) {
        // Transcribe audio first
        try {
          const audioBuffer = Buffer.from(audioInput, "base64");
          const fs = require("fs");
          const path = require("path");
          const os = require("os");
          const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
          fs.writeFileSync(tempFilePath, audioBuffer);
          const fileStream = fs.createReadStream(tempFilePath);
          
          const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-1",
            language: "en",
          });
          
          fs.unlinkSync(tempFilePath);
          
          // Add transcribed text as user message
          messageHistory.push({
            role: "user",
            content: transcription.text,
          });
        } catch (err) {
          logger.error("Audio transcription failed:", err);
          return res.status(500).json({ error: "Failed to transcribe audio" });
        }
      }

      // Handle image input if provided
      if (imageInput) {
        // For now, just add a note - vision models can be added later
        messageHistory.push({
          role: "user",
          content: "[Image provided]",
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messageHistory,
        ],
        temperature: mode === "default" ? 0.7 : 0.5,
        max_tokens: mode === "default" ? 500 : 1000,
      });

      const reply = completion.choices[0]?.message?.content || "";

      // Parse JSON if mode requires structured output
      let content = reply;
      let meta = {};

      if (mode !== "default") {
        try {
          const jsonMatch = reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            content = JSON.parse(jsonMatch[0]);
            meta = { parsed: true };
          } else {
            content = reply;
            meta = { parsed: false, raw: reply };
          }
        } catch (err) {
          logger.warn("Failed to parse structured response:", err);
          content = reply;
          meta = { parsed: false, raw: reply };
        }
      }

      // Determine response type
      let responseType = "text";
      let audioBase64 = null;
      let videoUrl = null;

      // Generate audio if requested
      if (needsAudio || emotionalNeeds.overwhelm || emotionalNeeds.panic) {
        try {
          const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy", // Calm, neutral voice
            input: typeof content === "string" ? content : JSON.stringify(content),
          });
          const buffer = Buffer.from(await mp3.arrayBuffer());
          audioBase64 = buffer.toString("base64");
          responseType = "audio";
        } catch (err) {
          logger.warn("TTS generation failed:", err);
        }
      }

      // Generate video URL if requested
      if (needsVideo) {
        videoUrl = getVideoUrlForIntent(mode, mode);
        if (videoUrl) {
          responseType = "video";
        }
      }

      // Return normalized response
      const response = {
        ok: true,
        type: responseType,
        content: typeof content === "string" ? content : JSON.stringify(content),
        mode,
        meta,
      };

      if (audioBase64) {
        response.audio = audioBase64;
        response.audioMimeType = "audio/mp3";
      }

      if (videoUrl) {
        response.video = videoUrl;
      }

      res.json(response);
    } catch (err) {
      logger.error("Chat error:", err);
      res.status(500).json({
        error: "Internal server error",
        message: "I couldn't process that request. Please try again.",
      });
    }
  }
);

/**
 * POST /multimodalTts
 * Text-to-speech using OpenAI
 */
exports.tts = onRequest(
  {
    cors: true,
    region: "us-central1",
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
      const { text, voice = "alloy" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Invalid text" });
      }

      const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
      const selectedVoice = validVoices.includes(voice) ? voice : "alloy";

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64 = buffer.toString("base64");

      res.json({
        ok: true,
        type: "audio",
        audio: base64,
        audioUrl: `data:audio/mp3;base64,${base64}`, // Also provide data URL
        mimeType: "audio/mp3",
      });
    } catch (err) {
      logger.error("TTS error:", err);
      res.status(500).json({ error: "Failed to generate audio" });
    }
  }
);

/**
 * POST /multimodalStt
 * Speech-to-text using OpenAI Whisper
 */
exports.stt = onRequest(
  {
    cors: true,
    region: "us-central1",
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
      const { audio, mimeType = "audio/webm" } = req.body;

      if (!audio) {
        return res.status(400).json({ error: "Invalid audio data" });
      }

      const audioBuffer = Buffer.from(audio, "base64");
      const fs = require("fs");
      const path = require("path");
      const os = require("os");
      
      const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
      fs.writeFileSync(tempFilePath, audioBuffer);
      const fileStream = fs.createReadStream(tempFilePath);
      
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
        language: "en",
      });

      fs.unlinkSync(tempFilePath);

      res.json({
        ok: true,
        type: "text",
        text: transcription.text,
      });
    } catch (err) {
      logger.error("STT error:", err);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  }
);
