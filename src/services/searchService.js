// src/services/searchService.js
// Real-time web search using RapidAPI (client-side helper)
// NOTE: In production we prefer going through the Firebase Function,
// and only use this as a fallback when absolutely needed.

import axios from "axios";

const rapidKey = import.meta.env.VITE_RAPIDAPI_KEY;
const rapidHost =
  import.meta.env.VITE_RAPIDAPI_HOST || "real-time-web-search.p.rapidapi.com";
const searchURL =
  import.meta.env.VITE_RAPIDAPI_SEARCH_URL ||
  "https://real-time-web-search.p.rapidapi.com/search";

if (!rapidKey || !rapidHost) {
  console.warn(
    "[searchService] RapidAPI config missing. Global search fallback will not work."
  );
}

/**
 * Normalize a RapidAPI response into a list of items
 */
function extractRawResults(data) {
  if (!data) return [];

  // Try common shapes
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.items)) return data.items;

  // If it's an object, wrap it so we can at least show something
  if (typeof data === "object") return [data];

  // If it's a string or something else, we can't parse it meaningfully
  return [];
}

/**
 * Map RapidAPI result item into a normalized shape
 */
function mapItem(item, index) {
  const url =
    item.url || item.link || item.uri || item.href || item.permalink || "";

  const title =
    item.title ||
    item.name ||
    item.headline ||
    item.text ||
    item.page_title ||
    "Untitled result";

  const description =
    item.snippet ||
    item.description ||
    item.abstract ||
    item.summary ||
    item.body ||
    item.content ||
    "";

  return {
    id: url || `result-${Date.now()}-${index}`,
    title,
    description,
    link: url,
    url, // both fields for compatibility
    source: "rapidapi",
    snippet: description,
    region: item.region || item.location || item.address || "",
    phone: item.phone || "",
    address: item.address || "",
  };
}

/**
 * Global web search using RapidAPI.
 * In production this is a fallback – primary should be the Cloud Function.
 */
export async function globalWebSearch(query, { limit = 10 } = {}) {
  if (!rapidKey || !rapidHost) {
    return { ok: false, results: [], error: "Missing RapidAPI config" };
  }

  const trimmed = (query || "").trim();
  if (!trimmed) {
    return { ok: false, results: [], error: "Missing query" };
  }

  try {
    console.log("[searchService] RapidAPI request:", {
      query: trimmed,
      limit,
      url: searchURL,
    });

    const response = await axios.get(searchURL, {
      params: {
        q: trimmed,
        limit,
        include_domains: "",
        exclude_domains: "",
      },
      headers: {
        "x-rapidapi-key": rapidKey,
        "x-rapidapi-host": rapidHost,
      },
      timeout: 15000,
    });

    // Enhanced response parsing - try multiple structures
    let raw = extractRawResults(response?.data);
    
    // If no results found in standard locations, try deeper nesting
    if (raw.length === 0 && response?.data) {
      // Try response.data.query or response.data.webPages
      if (response.data.query && Array.isArray(response.data.query)) {
        raw = response.data.query;
      } else if (response.data.webPages && Array.isArray(response.data.webPages)) {
        raw = response.data.webPages;
      } else if (response.data.webPages?.value && Array.isArray(response.data.webPages.value)) {
        raw = response.data.webPages.value;
      } else if (response.data.organic_results && Array.isArray(response.data.organic_results)) {
        raw = response.data.organic_results;
      }
    }

    console.log("[searchService] RapidAPI response meta:", {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response?.data,
      dataKeys: response?.data ? Object.keys(response.data) : [],
      rawLength: raw.length,
      sampleItem: raw[0] || null,
    });

    const results = raw.map(mapItem);

    if (!results.length) {
      return {
        ok: false,
        results: [],
        error:
          "We couldn't find any results. Try a simpler search or different wording.",
      };
    }

    return { ok: true, results };
  } catch (err) {
    console.error("[searchService] globalWebSearch error:", {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
    });

    let errorMessage = "Search failed";

    if (err.response) {
      const status = err.response.status;
      if (status === 401 || status === 403) {
        errorMessage =
          "Search authentication failed. Please check the RapidAPI configuration.";
      } else if (status === 429) {
        errorMessage =
          "Too many search requests. Please wait a bit and try again.";
      } else if (status >= 500) {
        errorMessage =
          "The search service is temporarily unavailable. Please try again later.";
      } else {
        errorMessage =
          err.response.data?.message ||
          `Search failed with status ${status} (${err.response.statusText})`;
      }
    } else if (
      err.code === "ECONNABORTED" ||
      err.message?.toLowerCase().includes("timeout")
    ) {
      errorMessage = "Search request timed out. Please try again.";
    } else if (
      err.message?.toLowerCase().includes("network error") ||
      err.code === "ERR_NETWORK"
    ) {
      errorMessage = "Network error. Please check your internet connection.";
    } else {
      errorMessage = err.message || "Search failed";
    }

    return { ok: false, results: [], error: errorMessage };
  }
}

export default {
  globalWebSearch,
};
