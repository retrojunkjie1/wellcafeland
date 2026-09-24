/** * Firebase Functions Entry Point * Mixed v1 + v2 SAFE CONFIG */
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions/v1"); // v1 (Gen1 namespace)
const axios = require("axios");

// ---------------------------
// Imports
// ---------------------------
// Milestones (v2)
const { onClientUpdate } = require("./milestones/onClientUpdate");
// Multimodal Wellness Engine (v2)
const { chat, tts, stt } = require("./multimodal");
// Global Resource Search (v2) - exported directly with secrets from globalResourceSearch.js
const { globalResourceSearch } = require("./globalResourceSearch");
const { buildClinicalPlan } = require("./buildClinicalPlan");
// Link Preview (v2)
const { linkPreview } = require("./linkPreview");
// Legacy AI Brain (v1 – REQUIRED)
const aiBrain = require("../aiBrain");
const { setCorsHeaders } = require("../corsHelper");

// ---------------------------
// v2 FUNCTIONS (CORRECT)
// ---------------------------

exports.onClientUpdate = onClientUpdate;

exports.multimodalChat = onRequest(
  {
    region: "us-central1",
    cors: [
      "http://localhost:5173",
      "http://localhost:5182",
      "https://wellnesscafe.net",
      "https://www.wellnesscafe.net",
      "https://wellnesscafelanding.web.app",
    ],
    secrets: ["OPENAI_API_KEY"],
  },
  chat
);

exports.multimodalTts = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: ["OPENAI_API_KEY"],
  },
  tts
);

exports.multimodalStt = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: ["OPENAI_API_KEY"],
  },
  stt
);

exports.globalResourceSearch = globalResourceSearch;

exports.buildClinicalPlan = buildClinicalPlan;

exports.linkPreview = linkPreview;

// ---------------------------
// v1 LEGACY FUNCTIONS (SAFE)
// ---------------------------
// NOTE: aiSession stays Gen1 to avoid blocked in-place Gen1→Gen2 upgrades. Use aiSessionV2 for Gen2 experiments.
exports.aiSession = functions.region("us-central1").https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  return aiBrain.handleSession(req, res);
});
exports.aiMedia = functions.region("us-central1").https.onRequest(aiBrain.handleMedia);

// ---------------------------
// v1 GLOBAL RESOURCE SEARCH (LEGACY)
// ---------------------------

exports.globalResourceSearchV1 = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { query } = body;
    if (!query) {
      return res.status(400).json({ ok: false, error: "Missing query" });
    }
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "RapidAPI not configured" });
    }
    const response = await axios.get(
      "https://real-time-web-search.p.rapidapi.com/search",
      {
        params: { q: query, limit: 10 },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "real-time-web-search.p.rapidapi.com",
        },
        timeout: 15000,
      }
    );
    return res.json({
      ok: true,
      results: response.data?.data || [],
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "Search failed",
    });
  }
});
