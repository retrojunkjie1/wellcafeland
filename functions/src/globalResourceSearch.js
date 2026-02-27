// functions/src/globalResourceSearch.js
// Global Resource Search using RapidAPI real-time web search
// Phase 2A: cache, min query, rate-limit, 403 handling, abort + retry

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const axios = require("axios");
const { getPathwayCardsForQuery } = require("./pathwayCards");

const CACHE_TTL_MS = 30 * 1000; // 30s TTL
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30s window
const RATE_LIMIT_MAX = 10; // 10 req per 30s per fingerprint
const CIRCUIT_OPEN_MS = 10 * 60 * 1000;
const EXTERNAL_TIMEOUT_MS = 9000; // 8-10s
const MIN_QUERY_LEN = 3;
const RAPIDAPI_HOST_DEFAULT = "real-time-web-search.p.rapidapi.com";
const RAPIDAPI_URL_DEFAULT = `https://${RAPIDAPI_HOST_DEFAULT}/search`;

const cache = new Map();
const rateLimit = new Map();
const inFlight = new Map(); // coalesce identical concurrent requests
const lastLogByCode = {};
let circuitOpenUntil = 0;
let rapidApiKeyLoggedOnce = false;

const RAPIDAPI_KEY_SECRET = defineSecret("RAPIDAPI_KEY");

const safeText = (value, max) => ((value || "").length > max ? `${(value || "").slice(0, max)}…` : (value || ""));

function maskForLog(val, prefixLen = 3, suffixLen = 2) {
  if (!val || typeof val !== "string") return "****";
  if (val.length < prefixLen + suffixLen) return "****";
  return val.slice(0, prefixLen) + "***" + val.slice(-suffixLen);
}

function getCorrelationId(req) {
  return req.headers["x-correlation-id"] || req.body?.correlationId || `grs_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown";
}

function getFingerprint(req) {
  const ip = getClientIp(req);
  const ua = (req.headers["user-agent"] || "").slice(0, 64);
  const hash = `${ip}|${ua}`;
  return hash;
}

function checkRateLimit(fingerprint) {
  const now = Date.now();
  let entry = rateLimit.get(fingerprint);
  if (!entry) {
    entry = { count: 0, windowStart: now };
    rateLimit.set(fingerprint, entry);
  }
  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

function getCacheKey(query, domain, category, region, offset, limit) {
  return JSON.stringify({ query, domain: domain || "", category: category || "", region: region || "", limit, offset });
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { ts: Date.now(), data });
}

function logOnce(code, msg, level = "info") {
  const last = lastLogByCode[code] || 0;
  if (Date.now() - last < 60000) return;
  lastLogByCode[code] = Date.now();
  if (level === "warn") logger.warn("[globalResourceSearch]", code, msg);
  else logger.info("[globalResourceSearch]", code, msg);
}

function buildFallbackResponse(query, domain, reason) {
  const cards = getPathwayCardsForQuery(query, domain);
  const results = cards.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    url: c.url || "",
    source: c.source || "WellnessCafe",
    snippet: c.description,
    category: c.category,
    actionText: c.actionText,
    searchHint: c.searchHint,
    verified: c.verified,
  }));
  const retryAt = Date.now() + CIRCUIT_OPEN_MS;
  return {
    ok: true,
    provider: "fallback",
    results,
    query: (query || "").trim(),
    nextPageToken: null,
    safetyNotice: {
      message: "Showing verified pathways. Live search will resume when available.",
      calm: true,
    },
    nextSteps: ["Try the suggestions above", "Add your city or state for local results"],
    meta: { fallback: true, sourceCount: results.length, retryAt, provider: "RapidAPI" },
    debug: { reason },
  };
}

function buildProviderNotSubscribedResponse(query, domain) {
  const retryAt = Date.now() + CIRCUIT_OPEN_MS;
  return {
    ok: false,
    code: "PROVIDER_NOT_SUBSCRIBED",
    message: "Provider not enabled",
    provider: "RapidAPI",
    retryAt,
    nextSteps: ["Subscribe in RapidAPI", "Set RAPIDAPI_KEY", "Set RAPIDAPI_HOST"],
    query: (query || "").trim(),
    results: [],
    meta: { fallback: true, retryAt, provider: "RapidAPI" },
  };
}

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
    "food.essentials": "food bank food pantry SNAP WIC meal program soup kitchen groceries",
  };

  // Add domain context if not already present (check if ANY domain word is in query)
  const domainContext = domainTerms[domain] || "";
  const domainWords = domainContext ? domainContext.split(/\s+/).filter(Boolean) : [];
  const hasAnyDomainWord = domainWords.some((w) => w.length > 2 && searchQuery.toLowerCase().includes(w.toLowerCase()));
  if (domainContext && !hasAnyDomainWord) {
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

    const fingerprint = getFingerprint(req);
    if (!checkRateLimit(fingerprint)) {
      const { query, domain } = req.body || {};
      const fallback = buildFallbackResponse(query || "", domain, "RATE_LIMITED");
      return res.status(200).json(fallback);
    }

    let RAPIDAPI_KEY;
    let keySource = "none";
    try {
      RAPIDAPI_KEY = RAPIDAPI_KEY_SECRET.value();
      if (RAPIDAPI_KEY) keySource = "Secret Manager";
    } catch {
      RAPIDAPI_KEY = null;
    }
    // Local dev: set RAPIDAPI_KEY and RAPIDAPI_HOST in functions/.env for emulator fallback.
    if (!RAPIDAPI_KEY && process.env.RAPIDAPI_KEY) {
      RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
      keySource = "RAPIDAPI_KEY";
    }

    if (RAPIDAPI_KEY && process.env.NODE_ENV !== "production" && !rapidApiKeyLoggedOnce) {
      rapidApiKeyLoggedOnce = true;
      logger.info("[globalResourceSearch] rapidapi_key", { present: true, source: keySource, masked: maskForLog(RAPIDAPI_KEY) });
    }

    if (!RAPIDAPI_KEY) {
      logOnce("NO_KEY", "RAPIDAPI_KEY not set; using fallback", "info");
      const { query, domain } = req.body || {};
      const fallback = buildFallbackResponse(query || "", domain, "NO_KEY");
      return res.status(200).json(fallback);
    }

    const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || RAPIDAPI_HOST_DEFAULT;
    const RAPIDAPI_URL = process.env.RAPIDAPI_URL || `https://${RAPIDAPI_HOST}/search`;

    const startTime = Date.now();
    try {
      const { query, domain, region, category, limit: reqLimit, pageToken } = req.body;

      if (!query || typeof query !== "string") {
        return res.status(400).json({ ok: false, error: "Query is required" });
      }

      const limit = Math.min(Math.max(parseInt(reqLimit, 10) || 20, 1), 50);
      const offset = Math.max(parseInt(pageToken, 10) || 0, 0);

      const normalizedQuery = normalizeSearchQuery(query, domain || "", region || "", category || "");
      const rawQueryLen = (query || "").trim().length;
      logger.info("[globalResourceSearch]", { domain: domain || null, rawQueryLen, normalizedQuery });

      // A2: Min query length — do NOT call external API for < 3 chars
      if (rawQueryLen < MIN_QUERY_LEN) {
        return res.status(200).json({
          ok: true,
          results: [],
          nextPageToken: null,
          meta: { empty: true, reason: "min_query" },
        });
      }

      const cacheKey = getCacheKey(normalizedQuery, domain, category, region, offset, limit);
      const cached = getCached(cacheKey);
      if (cached) return res.json(cached);

      // A1: Coalesce identical concurrent requests
      const inFlightKey = cacheKey;
      let inFlightPromise = inFlight.get(inFlightKey);
      if (inFlightPromise) {
        const result = await inFlightPromise;
        return res.json(result);
      }

      if (Date.now() < circuitOpenUntil) {
        const untilIso = new Date(circuitOpenUntil).toISOString();
        logger.info("[globalResourceSearch] CIRCUIT_OPEN", { until: untilIso, untilMs: circuitOpenUntil, message: `Provider disabled until ${untilIso}` });
        const { query, domain } = req.body || {};
        const fallback = buildFallbackResponse(query || "", domain, "CIRCUIT_OPEN");
        fallback.meta = { ...(fallback.meta || {}), retryAt: circuitOpenUntil, provider: "RapidAPI" };
        return res.status(200).json(fallback);
      }

      const doFetch = async () => {
        const requestLimit = Math.min(offset + limit, 50);
        let lastErr = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const response = await axios.get(RAPIDAPI_URL, {
              params: { q: normalizedQuery, limit: requestLimit },
              headers: {
                "X-RapidAPI-Key": RAPIDAPI_KEY,
                "X-RapidAPI-Host": RAPIDAPI_HOST,
              },
              timeout: EXTERNAL_TIMEOUT_MS,
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
              const findArray = (obj) => {
                for (const key in obj) {
                  if (Array.isArray(obj[key])) return obj[key];
                  if (typeof obj[key] === "object" && obj[key] !== null) {
                    const found = findArray(obj[key]);
                    if (found) return found;
                  }
                }
                return null;
              };
              const foundArray = findArray(data);
              if (foundArray) rawResults = foundArray;
              else if (data.url || data.title) rawResults = [data];
            }

            const normalizedResults = normalizeResults(rawResults);
            const sliced = normalizedResults.slice(offset, offset + limit);
            const nextPageToken = normalizedResults.length >= offset + limit ? String(offset + limit) : null;
            const payload = {
              ok: true,
              results: sliced,
              query: normalizedQuery,
              nextPageToken,
              meta: { sourceCount: sliced.length, tookMs: Date.now() - startTime },
            };
            setCache(cacheKey, payload);
            return payload;
          } catch (upstreamErr) {
            lastErr = upstreamErr;
            const status = upstreamErr.response?.status;
            const correlationId = getCorrelationId(req);
            if (status === 401 || status === 403 || status === 404) {
              const bodyRaw = upstreamErr.response?.data;
              const bodyStr = typeof bodyRaw === "string" ? bodyRaw : JSON.stringify(bodyRaw || "");
              const bodyTruncated = safeText(bodyStr, 1200);
              logger.warn("[globalResourceSearch] rapidapi_auth_error", {
                status,
                correlationId,
                host: RAPIDAPI_HOST,
                body: bodyTruncated,
                message: "RapidAPI subscription/app mismatch or wrong host for this API",
              });
            }
            // 401/403/404 = config/subscription mismatch — do NOT open circuit
            if (status === 401 || status === 403 || status === 404) {
              return buildProviderNotSubscribedResponse(normalizedQuery, domain || "");
            }
            // Circuit only for 429 / >=500 / timeout / network
            if (status === 429) {
              if (attempt === 1) {
                await new Promise((r) => setTimeout(r, 1500));
                continue;
              }
              circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
              logOnce("UPSTREAM_429", "RapidAPI rate limited; circuit open 10min", "info");
              return buildFallbackResponse(normalizedQuery, domain || "", "UPSTREAM_429");
            }
            if (status >= 500) {
              circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
              logOnce("UPSTREAM_5XX", `RapidAPI server error ${status}; circuit open 10min`, "info");
              return buildFallbackResponse(normalizedQuery, domain || "", "UPSTREAM_5XX");
            }
            if (upstreamErr.code === "ECONNABORTED" || upstreamErr.message?.includes("timeout")) {
              if (attempt === 1) {
                await new Promise((r) => setTimeout(r, 500));
                continue;
              }
              circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
              logOnce("UPSTREAM_TIMEOUT", "RapidAPI timeout; circuit open 10min", "info");
              return buildFallbackResponse(normalizedQuery, domain || "", "UPSTREAM_TIMEOUT");
            }
            if (!status && (upstreamErr.code === "ECONNREFUSED" || upstreamErr.code === "ENOTFOUND" || upstreamErr.code === "ETIMEDOUT")) {
              circuitOpenUntil = Date.now() + CIRCUIT_OPEN_MS;
              logOnce("UPSTREAM_NETWORK", `RapidAPI network error ${upstreamErr.code}; circuit open 10min`, "info");
              return buildFallbackResponse(normalizedQuery, domain || "", "UPSTREAM_NETWORK");
            }
            throw upstreamErr;
          }
        }
        throw lastErr;
      };

      const promise = doFetch();
      inFlight.set(inFlightKey, promise);
      let result;
      try {
        result = await promise;
      } finally {
        inFlight.delete(inFlightKey);
      }

      if (result.ok === false) {
        return res.status(200).json(result);
      }
      return res.json(result);
    } catch (err) {
      logger.error("[globalResourceSearch] Error:", { message: err.message, code: err.code });
      const { query, domain } = req.body || {};
      const fallback = buildFallbackResponse(query || "", domain, "ERROR");
      return res.status(200).json(fallback);
    }
  }
);

