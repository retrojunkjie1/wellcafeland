// src/services/resourceSearch.js
// Frontend client for global resource search
// 1) Try Firebase Function (server-side RapidAPI)
// 2) Fallback to client-side RapidAPI via globalWebSearch

import { globalWebSearch } from "./searchService";
import { logError, logInfo, logWarn } from "@/services/logService";
import { resolveFunctionsBaseUrl } from "@/lib/functionsUrl";

// Request deduplication cache
const requestCache = new Map();
const CACHE_TTL = 5000; // 5 seconds cache for duplicate requests
const ERROR_CACHE_TTL = 10000; // 10 seconds cache for rate limit errors

/**
 * Normalize search query based on domain (same logic as backend)
 * Smarter normalization: only add context if query doesn't already contain relevant terms
 */
function normalizeSearchQuery(query, domain, region, category) {
  let searchQuery = (query || "").trim();

  if (!searchQuery) return "";

  const domainTerms = {
    housing: ["sober living", "recovery housing", "transitional housing"],
    government_assistance: ["government assistance", "SAMHSA", "addiction recovery"],
    assistance: ["government assistance", "SAMHSA", "addiction recovery"],
    grants: ["grants", "funding", "addiction treatment"],
    programs: ["recovery programs", "IOP", "PHP", "rehab", "support groups"],
    providers: ["therapist", "counselor", "recovery coach"],
    hotlines: ["crisis hotline", "suicide prevention", "helpline"],
  };

  const queryLower = searchQuery.toLowerCase();
  const domainKeywords = domainTerms[domain] || [];
  
  // Only add domain context if query doesn't already contain relevant keywords
  // Check if any part of the query matches domain keywords
  const hasDomainKeyword = domainKeywords.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    // Check if query contains the keyword or any significant word from it
    return queryLower.includes(keywordLower) || 
           keywordLower.split(' ').some(word => word.length > 3 && queryLower.includes(word));
  });
  
  // Only add minimal context if needed and query is short (avoid bloating long queries)
  if (!hasDomainKeyword && domainKeywords.length > 0 && searchQuery.length < 30) {
    // Add just the first, most relevant keyword as context
    const primaryKeyword = domainKeywords[0];
    searchQuery = `${searchQuery} ${primaryKeyword}`;
  }

  // Add region if provided and not already in query
  if (
    region &&
    region !== "All regions" &&
    region !== "Nationwide" &&
    region !== "" &&
    !queryLower.includes(region.toLowerCase())
  ) {
    searchQuery = `${searchQuery} ${region}`;
  }

  // Add category if provided and not already in query
  if (
    category &&
    category !== "All categories" &&
    category !== "" &&
    !queryLower.includes(category.toLowerCase())
  ) {
    searchQuery = `${searchQuery} ${category}`;
  }

  return searchQuery.trim();
}

/**
 * Map external search results to directory format
 */
function mapResultsToDirectory(results, domain) {
  if (!Array.isArray(results)) return [];

  return results.map((item, index) => {
    const url = item.url || item.link || "";
    let source = item.source || "Web";

    try {
      if (url) {
        const urlObj = new URL(url);
        source = urlObj.hostname.replace("www.", "");
      }
    } catch {
      // Invalid URL, keep default source
    }

    return {
      id: item.id || url || `result-${Date.now()}-${index}`,
      title: item.title || item.name || item.headline || "Untitled Resource",
      description: item.description || item.snippet || item.abstract || "",
      url: url || item.link || item.uri || "",
      source: source || item.source || "Web",
      snippet: item.snippet || item.description || item.abstract || "",
      domain: domain || item.domain || null,
      region: item.region || item.location || item.address || null,
      phone: item.phone || null,
      address: item.address || item.location || null,
      category: item.category || null,
      tags: item.tags || [],
    };
  });
}

/**
 * Call the Firebase Function for global resource search
 */
async function callFunctionSearch({ query, domain, region, category }) {
  const endpoint = `${resolveFunctionsBaseUrl().replace(/\/+$/, "")}/globalResourceSearch`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: (query || "").trim(),
        domain: domain || "",
        region: region || undefined,
        category: category || undefined,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage =
        data?.error ||
        `Search failed with status ${res.status} (${res.statusText})`;

      return {
        ok: false,
        results: [],
        error: errorMessage,
        query: data?.query || query,
      };
    }

    if (data && data.ok && Array.isArray(data.results)) {
      return {
        ok: true,
        results: data.results,
        error: null,
        query: data.query || query,
      };
    }

    return {
      ok: false,
      results: [],
      error: "Search did not return any usable data.",
      query,
    };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        logWarn("resourceSearch", "Firebase Function search timed out", { query });
        return {
          ok: false,
          results: [],
          error: "Search timed out. Please try again.",
          query,
        };
      }

      logError("resourceSearch", err, { query, endpoint: "callFunctionSearch" });

      return {
        ok: false,
        results: [],
        error: err.message || "Search error",
        query,
      };
    }
}

/**
 * Search for resources using the global resource search engine.
 * 1) Try Firebase Function (server-side)
 * 2) If that fails, fallback to client-side RapidAPI
 */
export async function searchResources({ query, domain, region, category }) {
  // Combine verified providers with live search results (Phase 4)
  try {
    const { searchProviders } = await import("./providerService");
    const verifiedProviders = await searchProviders({ query, category: domain, regionKey: region });
    
    // Call live resource search function (real FindTreatment.gov integration)
    let liveResults = [];
    try {
      const functionsUrl = resolveFunctionsBaseUrl();
      const response = await fetch(`${functionsUrl.replace(/\/+$/, "")}/searchLiveResources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          location: region, 
          category: domain,
          state: region, // Pass state for filtering
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // Results are already normalized with verification status from backend
        liveResults = data.results || [];
      } else {
        // Graceful fallback: use verified providers only
        console.warn("Live resource search failed, using verified providers only:", response.status);
      }
    } catch (err) {
      // Graceful fallback: use verified providers only
      console.warn("Live resource search failed, using verified providers only:", err);
    }

    // Return combined: verified first, then live results
    return {
      ok: true,
      results: [...verifiedProviders, ...liveResults],
    };
  } catch (err) {
    console.warn("Provider search failed, falling back to legacy search:", err);
  }

  // Legacy search fallback
  if (!query || !query.trim()) {
    return {
      ok: false,
      results: [],
      error: "Missing query",
    };
  }

  const normalizedQuery = normalizeSearchQuery(
    query,
    domain || "",
    region || "",
    category || ""
  );

  // Create cache key for deduplication
  const cacheKey = `${normalizedQuery}|${domain || ""}|${region || ""}|${category || ""}`;
  const cached = requestCache.get(cacheKey);
  
  // Check if we have a recent cached result
  if (cached) {
    const cacheAge = Date.now() - cached.timestamp;
    const ttl = cached.result?.error?.toLowerCase().includes("too many") ? ERROR_CACHE_TTL : CACHE_TTL;
    
    if (cacheAge < ttl) {
      console.log("[resourceSearch] Using cached result for:", cacheKey);
      return cached.result;
    } else {
      // Remove expired cache entry
      requestCache.delete(cacheKey);
    }
  }

  // Check if there's a pending request for the same query
  if (cached && cached.pending) {
    console.log("[resourceSearch] Waiting for pending request:", cacheKey);
    // Wait for the pending request to complete
    try {
      const result = await cached.pending;
      return result;
    } catch (err) {
      // If pending request failed, continue with new request
      console.warn("[resourceSearch] Pending request failed, making new request:", err);
    }
  }

  // Create pending promise for deduplication
  const searchPromise = (async () => {
    // 1) Try Firebase Function first
    logInfo("resourceSearch", "Starting search", { query, domain, region, category });
    
    let fnResult;
    try {
      fnResult = await callFunctionSearch({
        query,
        domain,
        region,
        category,
      });
    } catch (err) {
      logError("resourceSearch", err, { query, domain, step: "callFunctionSearch" });
      fnResult = { ok: false, results: [], error: "Search service unavailable", query };
      
      // Observe search failure (if intelligence engine available)
      try {
        const { SystemMemory } = await import("@/core/system/systemMemory");
        const { observe } = await import("@/core/system/intelligenceEngine");
        SystemMemory.setLastSearchFailure(normalizedQuery, err);
        observe({
          type: "search_failure",
          data: { query: normalizedQuery, error: err.message || String(err), domain },
        });
      } catch {
        // Intelligence engine not available, continue without it
      }
    }

      if (fnResult.ok && fnResult.results.length > 0) {
        // Already in directory format or close enough
        const result = {
          ok: true,
          results: mapResultsToDirectory(fnResult.results, domain),
          error: null,
          query: fnResult.query || normalizedQuery,
        };
        
        // Observe search success (if intelligence engine available)
        try {
          const { SystemMemory } = await import("@/core/system/systemMemory");
          const { observe } = await import("@/core/system/intelligenceEngine");
          SystemMemory.setLastSearchSuccess(normalizedQuery, result.results);
          observe({
            type: "search_success",
            data: { query: normalizedQuery, resultCount: result.results.length, domain },
          });
        } catch {
          // Intelligence engine not available, continue without it
        }
        
        // Cache the result
        requestCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
          pending: null,
        });
        
        return result;
      }

    // If function explicitly says "Too many requests", wait before trying fallback
    if (
      fnResult.error &&
      fnResult.error.toLowerCase().includes("too many requests")
    ) {
      // Wait 3 seconds before trying fallback to avoid hammering the API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try fallback with a simpler query (just the original query without extra context)
      console.log("[resourceSearch] Rate limited, trying fallback with simpler query:", query.trim());
      try {
        const simpleQuery = query.trim(); // Use original query without normalization
        const fallbackResult = await globalWebSearch(simpleQuery, { limit: 10 });
        
        if (fallbackResult.ok && fallbackResult.results && fallbackResult.results.length > 0) {
          const mappedResults = mapResultsToDirectory(fallbackResult.results, domain);
          const result = {
            ok: true,
            results: mappedResults,
            error: null,
            query: simpleQuery,
          };
          
          requestCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            pending: null,
          });
          
          return result;
        }
      } catch (fallbackErr) {
        console.warn("[resourceSearch] Fallback also failed:", fallbackErr);
      }
      
      // If fallback also fails, return rate limit error
      const result = {
        ok: false,
        results: [],
        error:
          "The search service is receiving too many requests. Please wait a moment and try again.",
        query: fnResult.query || normalizedQuery,
      };
      
      // Cache the error result (shorter TTL for errors - 10 seconds)
      requestCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        pending: null,
      });
      
      return result;
    }

    // 2) Fallback to client-side RapidAPI search
    try {
      console.log("[resourceSearch] Fallback search with query:", normalizedQuery);
      const searchResult = await globalWebSearch(normalizedQuery, { limit: 10 });

      console.log("[resourceSearch] Fallback result:", {
        ok: searchResult.ok,
        resultsCount: searchResult.results?.length || 0,
        error: searchResult.error,
      });

      if (
        searchResult.ok &&
        Array.isArray(searchResult.results) &&
        searchResult.results.length > 0
      ) {
        const mappedResults = mapResultsToDirectory(
          searchResult.results,
          domain
        );
        const result = {
          ok: true,
          results: mappedResults,
          error: null,
          query: normalizedQuery,
        };
        
        // Cache the result
        requestCache.set(cacheKey, {
          result,
          timestamp: Date.now(),
          pending: null,
        });
        
        return result;
      }

      // Try simpler query (without domain context) if no results
      if (
        (!searchResult.ok || !searchResult.results?.length) &&
        normalizedQuery !== query.trim()
      ) {
        console.log(
          "[resourceSearch] No results, trying simpler query:",
          query.trim()
        );
        const simpleResult = await globalWebSearch(query.trim(), { limit: 10 });

        if (
          simpleResult.ok &&
          Array.isArray(simpleResult.results) &&
          simpleResult.results.length > 0
        ) {
          const mappedResults = mapResultsToDirectory(
            simpleResult.results,
            domain
          );
          const result = {
            ok: true,
            results: mappedResults,
            error: null,
            query: query.trim(),
          };
          
          // Cache the result
          requestCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            pending: null,
          });
          
          return result;
        }
      }

      // Graceful degradation: Show helpful message instead of hard error
      logWarn("resourceSearch", "No search results found", { query: normalizedQuery, domain });

      const result = {
        ok: false,
        results: [],
        error: "External search is currently disabled. You can still talk with your guide and we'll help you think through options. To enable external search, contact your administrator.",
        query: normalizedQuery,
      };
      
      // Cache the error result
      requestCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        pending: null,
      });
      
      return result;
    } catch (err) {
      console.error("[resourceSearch] Fallback search error:", err);
      const result = {
        ok: false,
        results: [],
        error: `Search error: ${
          err.message || "Please try again in a moment."
        }`,
        query: normalizedQuery,
      };
      
      // Cache the error result
      requestCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        pending: null,
      });
      
      return result;
    }
  })();

  // Store pending promise for deduplication
  requestCache.set(cacheKey, {
    result: null,
    timestamp: Date.now(),
    pending: searchPromise,
  });

  try {
    const finalResult = await searchPromise;
    return finalResult;
  } catch (err) {
    console.error("[resourceSearch] Search promise error:", err);
    // Clean up cache on error
    requestCache.delete(cacheKey);
    return {
      ok: false,
      results: [],
      error: "Search failed. Please try again.",
      query: normalizedQuery,
    };
  }
}

export default {
  searchResources,
};
