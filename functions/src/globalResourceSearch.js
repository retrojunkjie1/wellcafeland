// functions/src/globalResourceSearch.js
// Global Resource Search using RapidAPI real-time web search

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const axios = require("axios");

// Define secret for RapidAPI key (set via: firebase functions:secrets:set RAPIDAPI_KEY)
const RAPIDAPI_KEY_SECRET = defineSecret("RAPIDAPI_KEY");
const RAPIDAPI_HOST = "real-time-web-search.p.rapidapi.com";
const RAPIDAPI_URL = "https://real-time-web-search.p.rapidapi.com/search";

/**
 * Normalize search query based on domain
 */
function normalizeSearchQuery(query, domain, region, category) {
  let searchQuery = query.trim();

  // Domain-specific enhancements
  const domainTerms = {
    housing: "sober living recovery housing transitional housing",
    government_assistance: "government assistance addiction recovery SAMHSA programs",
    assistance: "government assistance addiction recovery SAMHSA programs",
    grants: "grants for addiction treatment recovery grants funding",
    programs: "addiction recovery programs IOP PHP rehab support groups",
    providers: "recovery therapists addiction counselors",
    hotlines: "crisis hotline suicide prevention addiction helpline",
  };

  // Add domain context if not already present
  const domainContext = domainTerms[domain] || "";
  if (domainContext && !searchQuery.toLowerCase().includes(domainContext.split(" ")[0])) {
    searchQuery = `${searchQuery} ${domainContext}`;
  }

  // Add region if provided
  if (region && region !== "All regions" && region !== "Nationwide" && region !== "") {
    searchQuery = `${searchQuery} ${region}`;
  }

  // Add category if provided
  if (category && category !== "All categories" && category !== "") {
    searchQuery = `${searchQuery} ${category}`;
  }

  return searchQuery.trim();
}

/**
 * Normalize RapidAPI response to consistent format
 */
function normalizeResults(rawResults) {
  if (!Array.isArray(rawResults)) {
    return [];
  }

  return rawResults.map((item, index) => {
    // Extract domain from URL for source
    let source = "Web";
    try {
      if (item.url || item.link || item.uri) {
        const url = new URL(item.url || item.link || item.uri);
        source = url.hostname.replace("www.", "");
      }
    } catch (e) {
      // Invalid URL, use default
    }

    return {
      id: item.url || item.link || item.uri || `result-${Date.now()}-${index}`,
      title: item.title || item.name || item.headline || "Untitled Resource",
      description: item.snippet || item.description || item.abstract || "",
      url: item.url || item.link || item.uri || "",
      source,
      snippet: item.snippet || item.description || item.abstract || "",
    };
  });
}

/**
 * POST /globalResourceSearch
 * Search for resources using RapidAPI real-time web search
 */
exports.globalResourceSearch = onRequest(
  {
    cors: true,
    region: "us-central1",
    secrets: [RAPIDAPI_KEY_SECRET],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const RAPIDAPI_KEY = RAPIDAPI_KEY_SECRET.value();

    if (!RAPIDAPI_KEY) {
      return res.status(503).json({
        ok: false,
        error: "Search service is not configured. Please contact support.",
        details: "RAPIDAPI_KEY not set",
      });
    }

    try {
      const { query, domain, region, category } = req.body;

      if (!query || !query.trim()) {
        return res.status(400).json({
          ok: false,
          error: "Query is required",
        });
      }

      // Normalize the search query
      const normalizedQuery = normalizeSearchQuery(query, domain || "", region || "", category || "");

      // Build RapidAPI request using axios
      logger.info("[globalResourceSearch] Query:", {
        original: query,
        normalized: normalizedQuery,
        domain,
        region,
        category,
      });

      const response = await axios.get(RAPIDAPI_URL, {
        params: {
          q: normalizedQuery,
          limit: 10,
        },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
        timeout: 15000,
      });

      const data = response.data;

      // Normalize results - handle different response formats
      let rawResults = [];
      if (Array.isArray(data)) {
        rawResults = data;
      } else if (Array.isArray(data?.data)) {
        rawResults = data.data;
      } else if (Array.isArray(data?.results)) {
        rawResults = data.results;
      } else if (Array.isArray(data?.items)) {
        rawResults = data.items;
      } else if (data && typeof data === "object") {
        // Try to find any array in the response
        const findArray = (obj) => {
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
              const found = findArray(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        const foundArray = findArray(data);
        if (foundArray) {
          rawResults = foundArray;
        } else if (data.url || data.title) {
          // Single result object
          rawResults = [data];
        }
      }

      logger.info("[globalResourceSearch] Raw results length:", rawResults.length);
      const normalizedResults = normalizeResults(rawResults);

      return res.json({
        ok: true,
        results: normalizedResults,
        query: normalizedQuery, // Return the actual query that was searched
      });
    } catch (err) {
      logger.error("[globalResourceSearch] Error:", {
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
  }
);

