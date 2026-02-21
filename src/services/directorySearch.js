/**
 * src/services/directorySearch.js
 * Single source of truth for Find Help / RealHelp directory search
 * Calls /globalResourceSearch (v2). Supports pagination, verified-first, no scraping.
 * Falls back to curated resources when API is unavailable.
 */

import { logDebug } from "@/lib/debug";
import { getCuratedFallback } from "@/lib/directoryCuratedFallback";
import { resolveFunctionsBaseUrl } from "@/lib/functionsUrl";

function getEndpoint() {
  return `${resolveFunctionsBaseUrl().replace(/\/+$/, "")}/globalResourceSearch`;
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

/**
 * Search directory with pagination and retry
 */
export async function searchDirectory({
  query,
  domain,
  location,
  category,
  pageToken,
  limit = 20,
}) {
  if (!query || !String(query).trim()) {
    return { ok: false, items: [], nextPageToken: null, meta: {}, error: "Query is required" };
  }

  const region = location || undefined;
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const endpoint = getEndpoint();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (typeof window !== "undefined" && window.localStorage?.getItem("wc_debug") === "1") {
      logDebug("DirectorySearch", {
        endpoint,
        domain: domain || "",
        pageToken: pageToken || null,
        query: query.slice(0, 50),
      });
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: String(query).trim(),
          domain: domain || "",
          region,
          category: category || undefined,
          limit,
          pageToken: pageToken || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        lastError = data?.error || `Search failed (${res.status})`;
        if (attempt < 2) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        const fallback = getCuratedFallback(domain, String(query).trim());
        const items = fallback.map((r) => normalizeResult({ ...r, url: r.link, title: r.name, description: r.description, snippet: r.description, source: r.source, verified: r.verified })).filter(Boolean);
        return { ok: true, items, nextPageToken: null, meta: { fallback: true, sourceCount: items.length }, error: null };
      }

      if (!data?.ok) {
        lastError = data?.error || "Search did not return data";
        if (attempt < 2) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        const fallback = getCuratedFallback(domain, String(query).trim());
        const items = fallback.map((r) => normalizeResult({ ...r, url: r.link, title: r.name, description: r.description, snippet: r.description, source: r.source, verified: r.verified })).filter(Boolean);
        return { ok: true, items, nextPageToken: null, meta: { fallback: true, sourceCount: items.length }, error: null };
      }

      const normalized = normalizeResponse({
        results: data.results || [],
        nextPageToken: data.nextPageToken || null,
        meta: data.meta || {},
      });

      return {
        ok: true,
        items: normalized.items,
        nextPageToken: normalized.nextPageToken,
        meta: normalized.meta,
        error: null,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err?.message || "Request failed";
      if (err?.name === "AbortError") {
        lastError = "Request timed out";
      }
      if (attempt < 2) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      const fallback = getCuratedFallback(domain, String(query).trim());
      const items = fallback.map((r) => normalizeResult({ ...r, url: r.link, title: r.name, description: r.description, snippet: r.description, source: r.source, verified: r.verified })).filter(Boolean);
      return { ok: true, items, nextPageToken: null, meta: { fallback: true, sourceCount: items.length }, error: null };
    }
  }

  const fallback = getCuratedFallback(domain, String(query).trim());
  const items = fallback.map((r) => normalizeResult({ ...r, url: r.link, title: r.name, description: r.description, snippet: r.description, source: r.source, verified: r.verified })).filter(Boolean);
  return { ok: true, items, nextPageToken: null, meta: { fallback: true, sourceCount: items.length }, error: null };
}
