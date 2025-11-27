// functions/src/index.js

/**
 * Firebase Functions Entry Point
 * Exports all Cloud Functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions");
const axios = require("axios");

// Import milestone engine
const { onClientUpdate } = require("./milestones/onClientUpdate");

// Import multimodal wellness engine
const { chat, tts, stt } = require("./multimodal");

// Import global resource search (v2 version)
const { globalResourceSearch: globalResourceSearchV2 } = require("./globalResourceSearch");

// Import legacy AI Brain functions (v1 - required for /aiSession and /aiMedia endpoints)
const aiBrain = require("../aiBrain");

// Export milestone function
exports.onClientUpdate = onClientUpdate;

// Export multimodal functions
exports.multimodalChat = chat;
exports.multimodalTts = tts;
exports.multimodalStt = stt;

// Export global resource search - use v2 version (with axios and proper secrets handling)
exports.globalResourceSearch = globalResourceSearchV2;

// Export legacy AI Brain functions (v1 - required for frontend /aiSession and /aiMedia endpoints)
// These are used extensively throughout the frontend and must be exported
exports.aiSession = functions.https.onRequest(aiBrain.handleSession);
exports.aiMedia = functions.https.onRequest(aiBrain.handleMedia);

// Also export v1 version for compatibility
// Note: v1 functions access secrets via process.env after firebase functions:secrets:set

// ---------------------------
// GLOBAL RESOURCE SEARCH (RapidAPI) - V1 API with axios
// ---------------------------

/**
 * Normalize search query based on domain, region, category
 * (mirrors frontend logic in src/services/resourceSearch.js)
 */
function normalizeSearchQueryServer(query, domain, region, category) {
  if (!query) return "";
  let searchQuery = String(query).trim();

  const domainTerms = {
    housing: "sober living recovery housing transitional housing",
    government_assistance: "government assistance addiction recovery SAMHSA programs",
    assistance: "government assistance addiction recovery SAMHSA programs",
    grants: "grants for addiction treatment recovery grants funding",
    programs: "addiction recovery programs IOP PHP rehab support groups",
    providers: "recovery therapists addiction counselors",
    hotlines: "crisis hotline suicide prevention addiction helpline",
  };

  const domainContext = domainTerms[domain] || "";
  if (domainContext && !searchQuery.toLowerCase().includes(domainContext.split(" ")[0])) {
    searchQuery = `${searchQuery} ${domainContext}`;
  }

  if (region && region !== "All regions" && region !== "Nationwide" && region !== "") {
    searchQuery = `${searchQuery} ${region}`;
  }

  if (category && category !== "All categories" && category !== "") {
    searchQuery = `${searchQuery} ${category}`;
  }

  return searchQuery.trim();
}

/**
 * Map RapidAPI results into a normalized shape.
 * This is similar to src/services/searchService.js.
 */
function mapRapidResults(raw) {
  if (!Array.isArray(raw)) return [];

  return raw.map((item, index) => {
    const url = item.url || item.link || item.uri || item.href || "";
    const title = item.title || item.name || item.headline || item.text || "Untitled result";
    const description = item.snippet || item.description || item.abstract || item.summary || item.body || "";

    let source = "web";
    try {
      if (url) {
        const u = new URL(url);
        source = u.hostname.replace("www.", "");
      }
    } catch (e) {
      // ignore invalid URL
    }

    return {
      id: url || `result-${Date.now()}-${index}`,
      title,
      description,
      url,
      link: url,
      source,
      snippet: description,
    };
  });
}

/**
 * CORS helper for this function.
 */
function setCorsHeaders(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * globalResourceSearchV1
 *
 * Backend endpoint hit by src/services/resourceSearch.js
 * URL: https://us-central1-wellnesscafelanding.cloudfunctions.net/globalResourceSearchV1
 *
 * Body: { query, domain, region, category }
 * 
 * Note: For v1 functions, secrets are accessed via process.env after being set with:
 * firebase functions:secrets:set RAPIDAPI_KEY
 */
exports.globalResourceSearchV1 = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { query, domain, region, category } = body;

      if (!query || !String(query).trim()) {
        return res.status(400).json({
          ok: false,
          error: "Missing query",
          results: [],
        });
      }

      const normalizedQuery = normalizeSearchQueryServer(
        query,
        domain || "",
        region || "",
        category || ""
      );

      const apiKey = process.env.RAPIDAPI_KEY;
      if (!apiKey) {
        console.error("[globalResourceSearchV1] Missing RAPIDAPI_KEY secret");
        return res.status(500).json({
          ok: false,
          error: "Search engine is not configured.",
          results: [],
        });
      }

      const searchURL = "https://real-time-web-search.p.rapidapi.com/search";
      const host = "real-time-web-search.p.rapidapi.com";

      console.log("[globalResourceSearchV1] Query:", {
        original: query,
        normalized: normalizedQuery,
        domain,
        region,
        category,
      });

      const response = await axios.get(searchURL, {
        params: {
          q: normalizedQuery,
          limit: 10,
        },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": host,
        },
        timeout: 15000,
      });

      let raw = [];
      if (Array.isArray(response?.data)) {
        raw = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        raw = response.data.data;
      } else if (Array.isArray(response?.data?.results)) {
        raw = response.data.results;
      } else if (Array.isArray(response?.data?.items)) {
        raw = response.data.items;
      } else if (response?.data && typeof response.data === "object") {
        raw = [response.data];
      }

      console.log("[globalResourceSearchV1] Raw length:", raw.length);
      const results = mapRapidResults(raw);

      return res.json({
        ok: true,
        results,
        query: normalizedQuery,
      });
    } catch (err) {
      console.error("[globalResourceSearchV1] Error:", {
        message: err.message,
        code: err.code,
        response: err.response
          ? {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
            }
          : null,
      });

      let errorMessage = "Search failed";
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = "API authentication failed. Please check RapidAPI configuration.";
        } else if (err.response.status === 429) {
          errorMessage = "Too many requests. Please try again in a moment.";
        } else if (err.response.status >= 500) {
          errorMessage = "Search service is temporarily unavailable. Please try again later.";
        } else {
          errorMessage =
            (err.response.data && err.response.data.message) ||
            `Search failed with status ${err.response.status}`;
        }
      } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        errorMessage = "Search request timed out. Please try again.";
      } else if (err.message?.includes("Network Error") || err.code === "ERR_NETWORK") {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || "Search failed";
      }

      return res.status(500).json({
        ok: false,
        error: errorMessage,
        results: [],
      });
    }
  });

// Legacy AI Brain function (if exists)
// const { aiBrain } = require("./aiBrain");
// exports.aiSession = onRequest({ region: "us-central1" }, aiBrain);

