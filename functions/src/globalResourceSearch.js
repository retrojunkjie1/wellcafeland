// functions/src/globalResourceSearch.js
// Global Resource Search using RapidAPI real-time web search

const { onRequest } = require("firebase-functions/v2/https")
const { defineSecret } = require("firebase-functions/params")
const { logger } = require("firebase-functions")
const axios = require("axios")

const CACHE_TTL_MS = 60 * 1000
const THROTTLE_WINDOW_MS = 10000
const THROTTLE_MAX = 8
const CIRCUIT_OPEN_MS = 10 * 60 * 1000
const cache = new Map()
const throttle = new Map()
const lastLogByCode = {}
let circuitOpenUntil = 0

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown"
}

function checkThrottle(ip) {
  const now = Date.now()
  let entry = throttle.get(ip)
  if (!entry) {
    entry = { count: 0, windowStart: now }
    throttle.set(ip, entry)
  }
  if (now - entry.windowStart > THROTTLE_WINDOW_MS) {
    entry.count = 0
    entry.windowStart = now
  }
  entry.count++
  if (entry.count > THROTTLE_MAX) return false
  return true
}

function getCacheKey(query, domain, category, offset, limit) {
  return [query, domain || "", category || "", offset, limit].join("|")
}

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data })
}

function logOnce(code, msg) {
  const last = lastLogByCode[code] || 0
  if (Date.now() - last < 60000) return
  lastLogByCode[code] = Date.now()
  logger.warn("[globalResourceSearch]", code, msg)
}

// Define secret for RapidAPI key (set via: firebase functions:secrets:set RAPIDAPI_KEY)
const RAPIDAPI_KEY_SECRET = defineSecret("RAPIDAPI_KEY")
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
      return res.status(405).json({ error: "Method not allowed" })
    }

    const ip = getClientIp(req)
    if (!checkThrottle(ip)) {
      return res.status(429).json({ ok: false, error: "Rate limited", code: "RATE_LIMITED" })
    }

    const RAPIDAPI_KEY = RAPIDAPI_KEY_SECRET.value()

    if (!RAPIDAPI_KEY) {
      return res.status(503).json({
        ok: false,
        error: "Search service is not configured. Please contact support.",
        details: "RAPIDAPI_KEY not set",
      })
    }

    const startTime = Date.now()
    try {
      const { query, domain, region, category, limit: reqLimit, pageToken } = req.body

      if (!query || !query.trim()) {
        return res.status(400).json({
          ok: false,
          error: "Query is required",
        })
      }

      const limit = Math.min(Math.max(parseInt(reqLimit, 10) || 20, 1), 50)
      const offset = Math.max(parseInt(pageToken, 10) || 0, 0)

      const normalizedQuery = normalizeSearchQuery(query, domain || "", region || "", category || "")
      const cacheKey = getCacheKey(normalizedQuery, domain, category, offset, limit)
      const cached = getCached(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      if (Date.now() < circuitOpenUntil) {
        logOnce("CIRCUIT_OPEN", `Provider disabled until ${new Date(circuitOpenUntil).toISOString()}`)
        return res.status(200).json({
          ok: false,
          error: "Search temporarily unavailable",
          code: "RATE_LIMITED",
          results: [],
          meta: { fallbackReason: "circuit_open" },
        })
      }

      logger.info("[globalResourceSearch] Query:", {
        original: query,
        normalized: normalizedQuery,
        domain,
        region,
        category,
        limit,
        offset,
      });

      const requestLimit = Math.min(offset + limit, 50)
      let response
      try {
        response = await axios.get(RAPIDAPI_URL, {
          params: { q: normalizedQuery, limit: requestLimit },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
          timeout: 15000,
        })
      } catch (upstreamErr) {
        const status = upstreamErr.response?.status
        const dataMsg = String(upstreamErr.response?.data?.message || upstreamErr.response?.data?.error || "").toLowerCase()
        if (status === 429) {
          circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS
          logOnce("UPSTREAM_429", "RapidAPI rate limited; circuit open 10min")
          return res.status(200).json({ ok: false, error: "Upstream rate limited", code: "UPSTREAM_RATE_LIMITED", results: [], meta: { fallbackReason: "rate_limited" } })
        }
        if (status === 403 && dataMsg.includes("not subscribed")) {
          circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS
          logOnce("UPSTREAM_403", "RapidAPI not subscribed; circuit open 10min")
          return res.status(200).json({ ok: false, error: "Upstream API not enabled", code: "UPSTREAM_NOT_ENABLED", results: [], meta: { fallbackReason: "subscription_blocked" } })
        }
        throw upstreamErr
      }

      const data = response.data

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

      // Slice for offset (RapidAPI may not support offset; apply client-side)
      const sliced = normalizedResults.slice(offset, offset + limit)
      const nextPageToken = normalizedResults.length >= offset + limit ? String(offset + limit) : null
      const payload = {
        ok: true,
        results: sliced,
        query: normalizedQuery,
        nextPageToken,
        meta: { sourceCount: sliced.length, tookMs: Date.now() - startTime },
      }
      setCache(cacheKey, payload)
      return res.json(payload)
    } catch (err) {
      const status = err.response?.status
      const dataMsg = String(err.response?.data?.message || err.response?.data?.error || "").toLowerCase()
      if (status === 429) {
        circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS
        logOnce("UPSTREAM_429", "RapidAPI rate limited; circuit open 10min")
        return res.status(200).json({ ok: false, error: "Upstream rate limited", code: "UPSTREAM_RATE_LIMITED", results: [], meta: { fallbackReason: "rate_limited" } })
      }
      if (status === 403 && dataMsg.includes("not subscribed")) {
        circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS
        logOnce("UPSTREAM_403", "RapidAPI not subscribed; circuit open 10min")
        return res.status(200).json({ ok: false, error: "Upstream API not enabled", code: "UPSTREAM_NOT_ENABLED", results: [], meta: { fallbackReason: "subscription_blocked" } })
      }

      logger.error("[globalResourceSearch] Error:", {
        message: err.message,
        code: err.code,
        response: err.response ? { status: err.response.status, statusText: err.response.statusText } : null,
      })

      let errorMessage = "Search failed"
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

