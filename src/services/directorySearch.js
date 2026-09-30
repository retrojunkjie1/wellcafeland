/**
 * src/services/directorySearch.js
 * Single source of truth for Find Help / RealHelp directory search
 * Calls /globalResourceSearch (v2). Supports pagination, verified-first, no scraping.
 * Falls back to curated resources when API is unavailable.
 */

import { logDebug } from "@/lib/debug";
import { getCuratedFallback } from "@/lib/directoryCuratedFallback";
import { buildApiUrl } from "@/services/apiBase";
import { getAuthHeaders } from "@/services/aiSessionClient";
import { listResources } from "@/data/resources";

function getEndpoint() {
  return buildApiUrl("/globalResourceSearch");
}
const TIMEOUT_MS = 15000;
const RETRY_DELAY_MS = 1500;

const VERIFIED_SOURCES = [
  "samhsa.gov",
  "samhsa",
  "findtreatment.gov",
  "findtreatment",
  "health.gov",
  "hhs.gov",
  "mass.gov",
  "state.co.us",
  "cdc.gov",
  "nih.gov",
];

function isVerifiedSource(source) {
  if (!source || typeof source !== "string") return false;
  const lower = source.toLowerCase();
  return VERIFIED_SOURCES.some((v) => lower.includes(v));
}

/**
 * Normalize a raw result into structured card format
 */
export function normalizeResult(raw) {
  if (!raw || typeof raw !== "object") return null;
  const url = raw.url || raw.link || raw.uri || "";
  let source = raw.source || "Web";
  try {
    if (url) {
      const u = new URL(url);
      source = u.hostname.replace("www.", "");
    }
  } catch {
    // keep default
  }
  const description = raw.description || raw.snippet || raw.abstract || "";
  const summary = description.length > 160 ? description.slice(0, 157) + "…" : description;

  return {
    id: raw.id || url || `dir-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: raw.title || raw.name || raw.headline || "Untitled Resource",
    type: raw.type || raw.category || "resource",
    phone: raw.phone || null,
    website: url || null,
    address: raw.address || raw.location || null,
    city: raw.city || null,
    state: raw.state || raw.region || null,
    distance: raw.distance ?? null,
    verified: raw.verified === true || isVerifiedSource(source),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    source: source || "Web",
    updatedAt: raw.updatedAt || raw.createdAt || null,
    summary: summary || null,
    url,
    description,
  };
}

/**
 * Normalize full API response
 */
export function normalizeResponse(raw) {
  if (!raw || typeof raw !== "object") return { items: [], nextPageToken: null, meta: {} };
  const results = Array.isArray(raw.results) ? raw.results : [];
  const items = results.map((r) => normalizeResult(r)).filter(Boolean);
  return {
    items,
    nextPageToken: raw.nextPageToken || null,
    meta: {
      sourceCount: items.length,
      tookMs: raw.meta?.tookMs ?? 0,
    },
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function firestoreFallback({ query, category, location, limit = 20 }) {
  try {
    let items = []
    const { items: byType, error: err1 } = await listResources({
      mode: "indexed",
      verified: true,
      type: category || undefined,
    })
    if (!err1 && byType?.length) items = byType
    if (items.length === 0) {
      const { items: byTag, error: err2 } = await listResources({
        mode: "indexed",
        verified: true,
        tag: category || undefined,
      })
      if (!err2 && byTag?.length) items = byTag
    }
    const seen = new Set()
    const merged = items.filter((r) => {
      const id = r.id || r.title
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
    const q = (query || "").toLowerCase().trim()
    let filtered = merged
    if (q.length > 2) {
      filtered = merged.filter((r) =>
        (r.title || "").toLowerCase().includes(q) ||
        ((r.contact?.notes || r.description || "").toLowerCase().includes(q))
      )
    }
    return filtered.slice(0, limit).map((r) => normalizeResult({
      id: r.id,
      title: r.title,
      type: r.type || "resource",
      url: r.contact?.url || "",
      description: r.contact?.notes || r.description || "",
      phone: r.contact?.phone || r.phone || null,
      state: r.location?.region || r.location?.state || null,
      verified: r.verified === true,
      tags: r.tags || [],
    })).filter(Boolean)
  } catch {
    return []
  }
}

const NO_RETRY_CODES = ["UPSTREAM_RATE_LIMITED", "UPSTREAM_NOT_ENABLED", "PROVIDER_NOT_SUBSCRIBED", "RATE_LIMITED"]
const CLIENT_CACHE_TTL_MS = 10000

const clientCache = new Map()
function getClientCacheKey(query, domain, category, location, limit, pageToken) {
  return [String(query || "").trim(), domain || "", category || "", location || "", limit, pageToken || ""].join("|")
}
function getClientCached(key) {
  const entry = clientCache.get(key)
  if (!entry || Date.now() - entry.ts > CLIENT_CACHE_TTL_MS) {
    if (entry) clientCache.delete(key)
    return null
  }
  return entry.data
}
function setClientCached(key, data) {
  clientCache.set(key, { ts: Date.now(), data })
}

function buildFallbackMeta(fallback, sourceCount, code) {
  const meta = { fallback, sourceCount }
  if (code === "RATE_LIMITED" || code === "UPSTREAM_RATE_LIMITED") meta.rateLimited = true
  if (code === "UPSTREAM_NOT_ENABLED") meta.subscriptionBlocked = true
  return meta
}

function fallbackFailureMessage(code, error) {
  if (code === "RATE_LIMITED" || code === "UPSTREAM_RATE_LIMITED") {
    return "The live resource search is busy right now, and no saved listings matched. Please try again in a moment or change your search area."
  }
  if (code === "UPSTREAM_NOT_ENABLED" || code === "PROVIDER_NOT_SUBSCRIBED") {
    return "The live resource directory is not available right now, and no saved listings matched. Try again later or choose another support path."
  }
  if (/timed out/i.test(String(error || ""))) {
    return "The resource search took too long, and no saved listings matched. Check your connection and try again."
  }
  return "The resource directory could not be reached, and no saved listings matched. Check your connection and try again."
}

async function buildFallbackResponse({ query, domain, category, location, limit, code, error }) {
  let items = await firestoreFallback({ query, category, location, limit })
  let fallbackSource = "firestore"
  if (!items.length) {
    const curated = getCuratedFallback(domain, query)
    items = curated.map((resource) => normalizeResult({
      ...resource,
      url: resource.link,
      title: resource.name,
      description: resource.description,
      snippet: resource.description,
      source: resource.source,
      verified: resource.verified,
    })).filter(Boolean)
    fallbackSource = "curated"
  }
  const meta = buildFallbackMeta(fallbackSource, items.length, code)
  if (!items.length) {
    return { ok: false, items: [], nextPageToken: null, meta: { ...meta, unavailable: true }, error: fallbackFailureMessage(code, error) }
  }
  return { ok: true, items, nextPageToken: null, meta, error: null }
}

/**
 * Search directory with pagination and retry
 * @param {AbortSignal} [signal] - Optional abort signal to cancel in-flight request
 */
async function searchDirectoryImpl({
  query,
  domain,
  location,
  category,
  pageToken,
  limit = 20,
  signal,
}) {
  if (!query || !String(query).trim()) {
    return { ok: false, items: [], nextPageToken: null, meta: {}, error: "Query is required" }
  }

  const cacheKey = getClientCacheKey(query, domain, category, location, limit, pageToken)
  if (!pageToken) {
    const cached = getClientCached(cacheKey)
    if (cached) return cached
  }

  const region = location || undefined
  let lastError = null

  for (let attempt = 1; attempt <= 2; attempt++) {
    const endpoint = getEndpoint()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId)
        throw new DOMException("Aborted", "AbortError")
      }
      signal.addEventListener("abort", () => controller.abort())
    }

    if (typeof window !== "undefined" && window.localStorage?.getItem("wc_debug") === "1") {
      logDebug("DirectorySearch", {
        endpoint,
        domain: domain || "",
        pageToken: pageToken || null,
        query: query.slice(0, 50),
      })
    }

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          query: String(query).trim(),
          domain: domain || "",
          region,
          category: category || undefined,
          limit,
          pageToken: pageToken || undefined,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        lastError = data?.error || `Search failed (${res.status})`
        const code = data?.code
        const isRateLimited = res.status === 429 || res.status === 403 || NO_RETRY_CODES.includes(code)
        if (isRateLimited) {
          const effectiveCode = code || (res.status === 429 || res.status === 403 ? "RATE_LIMITED" : undefined)
          const out = await buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, code: effectiveCode, error: lastError })
          if (!pageToken && out.ok) setClientCached(cacheKey, out)
          return out
        }
        if (attempt < 2) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        return buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, error: lastError })
      }

      if (!data?.ok) {
        lastError = data?.error || "Search did not return data"
        const code = data?.code
        if (NO_RETRY_CODES.includes(code)) {
          return buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, code, error: lastError })
        }
        if (attempt < 2) {
          await sleep(RETRY_DELAY_MS)
          continue
        }
        return buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, error: lastError })
      }

      const normalized = normalizeResponse({
        results: data.results || [],
        nextPageToken: data.nextPageToken || null,
        meta: data.meta || {},
      })

      if (normalized.items.length === 0) {
        const out = { ok: true, items: [], nextPageToken: null, meta: { empty: true }, error: null }
        if (!pageToken) setClientCached(cacheKey, out)
        return out
      }

      const out = {
        ok: true,
        items: normalized.items,
        nextPageToken: normalized.nextPageToken,
        meta: normalized.meta,
        error: null,
      }
      if (!pageToken) setClientCached(cacheKey, out)
      return out
    } catch (err) {
      clearTimeout(timeoutId)
      if (signal?.aborted) throw err
      lastError = err?.message || "Request failed"
      if (err?.name === "AbortError") lastError = "Request timed out"
      if (attempt < 2) {
        await sleep(RETRY_DELAY_MS)
        continue
      }
      return buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, error: lastError })
    }
  }

  return buildFallbackResponse({ query: String(query).trim(), domain, category, location, limit, error: lastError })
}


/**
 * Defensive wrapper: returns honest unavailability when no fallback results exist.
 */
export async function searchDirectory(params) {
  try {
    return await searchDirectoryImpl(params);
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) console.warn('[directorySearch] Defensive fallback:', e?.message);
    const domain = params?.domain || '';
    const query = String(params?.query || '').trim();
    if (params?.signal?.aborted) throw e;
    try {
      return await buildFallbackResponse({
        query,
        domain,
        category: params?.category,
        location: params?.location,
        limit: params?.limit || 20,
        error: e?.message,
      });
    } catch (_) {
      return { ok: false, items: [], nextPageToken: null, meta: { unavailable: true }, error: fallbackFailureMessage(undefined, e?.message) };
    }
  }
}
