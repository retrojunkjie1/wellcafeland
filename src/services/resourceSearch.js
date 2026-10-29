// All external resource searches go through the Firebase Function. The
// RapidAPI credential and provider controls must never be shipped to browsers.
import { logError, logWarn } from "@/services/logService";
import { buildApiUrl } from "@/services/apiBase";
import { getAuthHeaders } from "@/services/aiSessionClient";
import { getCuratedFallback } from "@/lib/directoryCuratedFallback";

function normalizeResourceItem(raw, domain) {
  if (!raw || typeof raw !== "object") return null;
  const url = raw.url || raw.link || raw.website || raw.uri || "";
  const title = raw.title || raw.name || raw.headline || "Untitled Resource";
  const summary = raw.summary || raw.description || raw.snippet || raw.blurb || raw.abstract || "";
  const phone = raw.phone || raw.tel || raw.contactPhone || raw.contact?.phone || null;
  let source = raw.source || "Web";
  try {
    if (url) source = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // Keep the source label supplied by the server when the URL is malformed.
  }
  const address = raw.address && typeof raw.address === "object" ? raw.address : {};
  const location = raw.location && typeof raw.location === "object" ? raw.location : {};
  const city = raw.city || address.city || location.city || "";
  const state = raw.state || address.state || raw.region || location.state || "";
  const country = raw.country || address.country || location.country || "";
  const postalCode = raw.postalCode || raw.zip || address.postalCode || location.postalCode || "";
  const addressLine = typeof raw.address === "string" ? raw.address :
    [address.streetAddress, address.street, address.address1, city, state, postalCode, country].filter(Boolean).join(", ");
  const locationLine = raw.locationLine || [city, state, postalCode, country].filter(Boolean).join(", ") || addressLine || raw.serviceArea || "";
  const tags = Array.isArray(raw.tags) ? raw.tags : Array.isArray(raw.eligibility)
    ? raw.eligibility
    : raw.category ? [raw.category] : [];
  return {
    id: raw.id || url || `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title,
    summary: String(summary).slice(0, 280),
    domain: domain || raw.domain || "other",
    phone: phone ? String(phone).trim() : null,
    url: url || null,
    address: addressLine || null,
    city: city || null,
    state: state || null,
    country: country || null,
    postalCode: postalCode || null,
    locationLine,
    locationLabel: raw.locationLabel || (addressLine ? "Address" : locationLine ? "Service area" : null),
    tags: tags.map((tag) => (typeof tag === "string" ? tag : tag?.label || String(tag)).slice(0, 32)),
    source: source || null,
  };
}

function curatedResults(domain, query, region) {
  const queryText = String(query || "").toLowerCase();
  const searchText = domain === "programs" && /\baa\b|alcoholics anonymous|a\.a\./.test(queryText)
    ? "Alcoholics Anonymous"
    : domain === "programs" && /\bna\b|narcotics anonymous|n\.a\./.test(queryText)
      ? "Narcotics Anonymous"
      : query;
  return getCuratedFallback(domain, searchText, region).map((item) => normalizeResourceItem({
    ...item,
    title: item.name,
    summary: item.description,
    url: item.link,
    tags: [domain, "curated support pathway"],
    id: `curated:${domain}:${item.id}`,
  }, domain)).filter(Boolean);
}

async function callFunctionSearch({ query, domain, region, category, limit = 20, pageToken, signal }) {
  const endpoint = buildApiUrl("/globalResourceSearch");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const abortRequest = () => controller.abort();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  signal?.addEventListener("abort", abortRequest, { once: true });
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...await getAuthHeaders() },
      body: JSON.stringify({ query, domain, region: region || undefined, category: category || undefined, limit, pageToken: pageToken || undefined }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        results: [],
        error: data?.error || `Live resource search returned status ${response.status}.`,
        query,
        meta: data?.meta || {},
      };
    }
    if (data && typeof data === "object" && Array.isArray(data.results)) {
      return {
        ok: data.ok !== false,
        results: data.results,
        error: data.error || data.message || null,
        query: data.query || query,
        provider: data.provider || null,
        nextPageToken: data.nextPageToken || null,
        meta: data.meta || {},
      };
    }
    return { ok: false, results: [], error: "The live resource search returned no usable data.", query, meta: {} };
  } catch (error) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (error?.name === "AbortError") {
      return { ok: false, results: [], error: "Live resource search timed out. Please try again.", query, meta: {} };
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
}

/**
 * Search a server-owned live source once, then return explicit saved pathways
 * when that source is unavailable. Saved pathways are never labeled as live.
 */
export async function searchResources({ query, domain, region, category, limit = 20, pageToken, signal }) {
  const cleanQuery = String(query || "").trim();
  const domainNorm = domain || "other";
  if (!cleanQuery) return { ok: false, results: [], error: "Missing query", query: "" };

  // Continuation requests page only through the live provider. Re-querying
  // local and curated sources on each page would make duplicates look like
  // fresh results and imply those saved pathways form a complete directory.
  if (pageToken) {
    const nextPage = await callFunctionSearch({ query: cleanQuery, domain: domainNorm, region, category, limit, pageToken, signal });
    const backendFallback = nextPage.provider === "fallback" || nextPage.meta?.fallback === true;
    return {
      ok: nextPage.ok && !backendFallback,
      results: nextPage.ok && !backendFallback ? nextPage.results.map((item) => normalizeResourceItem(item, domainNorm)).filter(Boolean) : [],
      fallback: backendFallback,
      error: nextPage.error || (backendFallback ? "Live search is unavailable. Saved pathways are shown above." : null),
      query: nextPage.query || cleanQuery,
      nextPageToken: backendFallback ? null : nextPage.nextPageToken,
      meta: { ...(nextPage.meta || {}), domain: domainNorm, liveAvailable: !backendFallback },
    };
  }

  let reviewedProviders = [];
  try {
    const { searchProviders } = await import("./providerService");
    reviewedProviders = await searchProviders({ query: cleanQuery, category: domainNorm, regionKey: region });
  } catch {
    logWarn("resourceSearch", "Reviewed provider search unavailable", { domain: domainNorm });
  }
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  let upstream;
  try {
    upstream = await callFunctionSearch({ query: cleanQuery, domain: domainNorm, region, category, limit, signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    logError("resourceSearch", error, { domain: domainNorm, step: "callFunctionSearch" });
    upstream = { ok: false, results: [], error: "Live resource search is temporarily unavailable.", query: cleanQuery, meta: {} };
  }

  const backendFallback = upstream.provider === "fallback" || upstream.meta?.fallback === true;
  const liveResults = upstream.ok && !backendFallback
    ? upstream.results.map((item) => normalizeResourceItem(item, domainNorm)).filter(Boolean)
    : [];
  const providerResults = Array.isArray(reviewedProviders)
    ? reviewedProviders.map((item) => normalizeResourceItem(item, domainNorm)).filter(Boolean)
    : [];
  const freshResults = [...providerResults, ...liveResults];

  if (freshResults.length) {
    const liveAvailable = liveResults.length > 0;
    return {
      ok: true,
      results: freshResults,
      fallback: !liveAvailable,
      error: !liveAvailable ? upstream.error || "Live search did not return fresh results; showing reviewed listings and saved support pathways." : null,
      query: upstream.query || cleanQuery,
      nextPageToken: liveAvailable ? upstream.nextPageToken : null,
      meta: { ...(upstream.meta || {}), domain: domainNorm, liveAvailable },
    };
  }

  const savedResults = curatedResults(domainNorm, cleanQuery, region);
  return {
    ok: savedResults.length > 0,
    results: savedResults,
    fallback: savedResults.length > 0,
    error: savedResults.length
      ? upstream.error || "Live search did not return fresh results; these saved support pathways are not a complete local directory."
      : upstream.error || "Live resource search is unavailable and no saved pathways matched. Try again or choose another support path.",
    query: upstream.query || cleanQuery,
    nextPageToken: null,
    meta: { ...(upstream.meta || {}), domain: domainNorm, liveAvailable: false },
  };
}
