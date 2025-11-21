// functions/index.js

const functions = require("firebase-functions");
const aiBrain = require("./aiBrain");

exports.aiSession = functions.https.onRequest(aiBrain.handleSession);
exports.aiMedia = functions.https.onRequest(aiBrain.handleMedia);

// ---------------------------
// TEMPLATES (STATIC SAMPLES)
// ---------------------------
async function handleTemplates(req, res) {
  // TEMP: Until you add Firestore storage, we return a static sample list.
  const templates = [
    {
      id: "grounding-10",
      title: "10-minute grounding reset",
      summary: "A quick grounding practice to settle your nervous system.",
      category: "Grounding",
      durationMinutes: 10,
    },
    {
      id: "cravings-fast",
      title: "Cravings wave-surf",
      summary: "Ride the wave instead of fighting it.",
      category: "Cravings / urges",
      durationMinutes: 7,
    },
  ];

  return res.json({ templates });
}

// ---------------------------
// TEMPLATE DETAIL
// ---------------------------
async function handleTemplateDetail(req, res, body) {
  const id = body.templateId;

  // For now return a simple placeholder.
  // Later we will store real sessions in Firestore.
  const session = {
    id,
    title: "Sample Session Detail",
    summary: "A practice to help you return to your body and settle.",
    durationMinutes: 10,
    category: "Grounding",

    opening:
      "Find a comfortable position. Let your shoulders drop. Take one slow breath.",

    body: [
      "Notice your feet on the floor.",
      "Feel your hands resting gently.",
      "Let your jaw unclench.",
      "Stay with one breath in… and one breath out.",
    ],

    closing:
      "When you're ready, take one final slow breath and return to the room.",
  };

  return res.json({ template: session });
}

// ---------------------------
// GENERATE CUSTOM SESSION
// ---------------------------
async function handleGenerateSession(req, res, body) {
  const { category, tone, minutes, notes } = body;

  // Build prompt for AI Brain
  const prompt = `
You are WellnessCafe OS.

Create a ${minutes}-minute support session.

CATEGORY: ${category}
TONE: ${tone}
USER NOTES: ${notes || "none"}

Return JSON only:

{
  "opening": "...",
  "body": ["step 1", "step 2", ...],
  "closing": "..."
}
  `;

  // Send to AI Brain
  const ai = await aiBrain({
    mode: "session_generation",
    prompt,
  });

  if (!ai || !ai.text) {
    return res.status(500).json({
      error: "AI did not return a session",
    });
  }

  // Try to parse AI output as JSON
  let session;
  try {
    session = JSON.parse(ai.text);
  } catch {
    // fallback: wrap raw text
    session = { opening: ai.text };
  }

  return res.json({ session });
}

