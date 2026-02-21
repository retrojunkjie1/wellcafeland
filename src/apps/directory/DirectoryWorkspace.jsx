// src/apps/directory/DirectoryWorkspace.jsx
// Global Directory workspace - ChatGPT style, minimal

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { withFrom } from "@/navigation/linkState";
import { Search, ExternalLink, Heart, Loader2 } from "lucide-react";
import { searchDirectory } from "@/services/directorySearch";
import { saveFavoriteResource } from "@/services/directoryService";
import { normalizeExternalUrl } from "@/utils/normalizeUrl";
import PageHeader from "@/components/navigation/PageHeader";

const DOMAIN_CONFIG = {
  providers: {
    title: "Providers Directory",
    subtitle: "Find therapists, recovery coaches, somatic and spiritual guides.",
    categories: ["Therapist", "Coach", "Peer Support", "Somatic", "Spiritual", "Cultural"],
    types: ["clinical", "peer", "somatic", "spiritual", "cultural"],
  },
  housing: {
    title: "Housing Directory",
    subtitle: "Find sober living, transitional housing, and supportive housing options.",
    categories: ["Sober Living", "Transitional", "Supportive", "Emergency"],
    types: [],
  },
  grants: {
    title: "Grants & Funding",
    subtitle: "Find grants and financial assistance for recovery and wellness.",
    categories: ["Recovery", "Housing", "Education", "Medical"],
    types: [],
  },
  assistance: {
    title: "Government Assistance",
    subtitle: "Find government programs and support services.",
    categories: ["Food", "Healthcare", "Housing", "Employment"],
    types: [],
  },
  hotlines: {
    title: "Hotlines & Crisis Support",
    subtitle: "24/7 crisis support and emergency hotlines.",
    categories: ["Crisis", "Suicide Prevention", "Substance Use", "Domestic Violence"],
    types: [],
  },
  programs: {
    title: "Programs & Groups",
    subtitle: "Find support groups, recovery programs, and community resources.",
    categories: ["Support Group", "Recovery Program", "Community", "Education"],
    types: [],
  },
  circles: {
    title: "Recovery Circles",
    subtitle: "Join reflection circles for daily prompts and community support.",
    categories: ["Men", "Women", "Spiritual", "Grief", "Harm Reduction"],
    types: [],
  },
};

const DirectoryWorkspace = () => {
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Map domain names to backend domain format
  const domainMap = {
    housing: "housing",
    assistance: "government_assistance",
    grants: "grants",
    programs: "programs",
    providers: "providers",
    hotlines: "hotlines",
    circles: "circles",
  };

  const backendDomain = domainMap[domain] || domain || "housing";

  // Default queries per domain - simpler, more focused queries
  const defaultQueries = {
    housing: "sober living Colorado",
    assistance: "addiction recovery assistance",
    grants: "recovery grants",
    programs: "recovery programs",
    providers: "recovery therapist",
    hotlines: "crisis hotline",
  };

  const [query, setQuery] = useState(defaultQueries[domain] || "");
  const [results, setResults] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [actualQuery, setActualQuery] = useState("");
  const [filters, setFilters] = useState({
    region: "",
    category: "",
    type: "",
  });
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const lastRequestTimeRef = useRef(0);
  const pendingRequestRef = useRef(null);
  const COOLDOWN_MS = 1500;

  const config = DOMAIN_CONFIG[domain] || DOMAIN_CONFIG.providers;

  // Initial search on mount with default query
  useEffect(() => {
    const performInitialSearch = async () => {
      const defaultQuery = defaultQueries[domain] || "recovery resources";
      setQuery(defaultQuery);
      // Reset rate limiting for initial search
      lastRequestTimeRef.current = 0;
      handleSearch(defaultQuery, true);
    };

    if (domain) {
      performInitialSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  // Map directorySearch item to UI shape
  const toUIItem = (item) => ({
    id: item.id,
    title: item.title,
    url: item.website || item.url,
    source: item.source,
    description: item.summary || item.description || "",
    snippet: item.summary || item.description || "",
    verified: item.verified,
  });

  const handleSearch = async (searchQuery = query, isInitial = false, pageToken = null) => {
    const trimmed = searchQuery?.trim() || query.trim();
    if (!trimmed && !isInitial) return;

    if (!isInitial && !pageToken) {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;
      if (timeSinceLastRequest < COOLDOWN_MS) return;
      if (pendingRequestRef.current === trimmed && loading) return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const isLoadMore = !!pageToken;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
      setHasSearched(true);
    }
    abortControllerRef.current = new AbortController();
    pendingRequestRef.current = trimmed;
    lastRequestTimeRef.current = Date.now();

    try {
      const { ok, items, nextPageToken: nextToken, error: searchError } = await searchDirectory({
        query: trimmed,
        domain: backendDomain,
        location: filters.region === "All regions" || filters.region === "" ? undefined : filters.region,
        category: filters.category === "All categories" || filters.category === "" ? undefined : filters.category,
        pageToken: pageToken || undefined,
        limit: 20,
      });

      if (abortControllerRef.current?.signal?.aborted) return;

      const uiItems = (items || []).map(toUIItem);

      if (!ok) {
        if (!isLoadMore) {
          setError(searchError || "Couldn't load results.");
          setResults([]);
        }
        setActualQuery(trimmed);
      } else {
        if (isLoadMore) {
          setResults((prev) => {
            const seen = new Set(prev.map((r) => r.id));
            const appended = uiItems.filter((r) => !seen.has(r.id));
            return [...prev, ...appended];
          });
        } else {
          setResults(uiItems);
          setError(null);
        }
        setNextPageToken(nextToken || null);
        setActualQuery(trimmed);
      }
    } catch (err) {
      if (!abortControllerRef.current?.signal?.aborted && !isLoadMore) {
        setError("Search temporarily unavailable. Please retry.");
        setResults([]);
      }
    } finally {
      if (!abortControllerRef.current?.signal?.aborted) {
        setLoading(false);
        setLoadingMore(false);
        pendingRequestRef.current = null;
      }
    }
  };

  const loadMoreRef = useRef(null);
  loadMoreRef.current = () => {
    if (!nextPageToken || loadingMore || loading) return;
    handleSearch(query, false, nextPageToken);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight - scrollTop - clientHeight < 200) {
        loadMoreRef.current?.();
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only auto-search if user has typed something (not on initial mount)
    // Skip if already loading to prevent duplicate requests
    if (query && hasSearched && !loading) {
      debounceRef.current = setTimeout(() => {
        handleSearch(query, false);
      }, 500);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Search when filters change (with rate limiting)
  useEffect(() => {
    if (hasSearched && query && !loading) {
      // Add a delay to batch filter changes and avoid rapid-fire requests
      const filterTimeout = setTimeout(() => {
        // Check if enough time has passed since last request
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTimeRef.current;
        
        if (timeSinceLastRequest >= COOLDOWN_MS) {
          handleSearch(query, false);
        } else {
          // Wait for remaining cooldown time
          const remainingTime = COOLDOWN_MS - timeSinceLastRequest;
          setTimeout(() => {
            handleSearch(query, false);
          }, remainingTime);
        }
      }, 500); // Increased delay to batch filter changes
      
      return () => clearTimeout(filterTimeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.region, filters.category, filters.type]);

  const handleSaveFavorite = async (item) => {
    try {
      const result = await saveFavoriteResource(backendDomain, item);
      if (result.ok) {
        // Could show a toast notification here
        console.log("Saved to favorites");
      } else {
        console.error("Failed to save favorite:", result.error);
      }
    } catch (err) {
      console.error("Failed to save favorite:", err);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <PageHeader 
        title={config.title} 
        subtitle={config.subtitle}
        backTo="/explore"
      />

      {/* Search & Filters */}
      <div className="relative z-10 border-b border-white/10 bg-slate-950 px-4 sm:px-6 py-3 sm:py-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch(query, false);
                }
              }}
              placeholder={domain === "housing" ? "e.g., sober living in Colorado, housing in Denver…" : "Search by name, region, or type…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSearch(query, false)}
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
          >
            <option value="">All regions</option>
            <option value="Colorado">Colorado</option>
            <option value="Nationwide">Nationwide</option>
            <option value="California">California</option>
            <option value="New York">New York</option>
            <option value="Texas">Texas</option>
          </select>

          {config.categories.length > 0 && (
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-white/20 focus:outline-none"
            >
              <option value="">All categories</option>
              {config.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          {config.types.length > 0 && (
            <div className="flex items-center gap-2">
              {config.types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      type: filters.type === type ? "" : type,
                    })
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                    filters.type === type
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 w-full">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <p className="text-sm text-amber-200">{error}</p>
            {actualQuery && (
              <p className="mt-1 text-xs text-amber-300/70">Searched for: &quot;{actualQuery}&quot;</p>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white/60 mx-auto mb-2" />
              <p className="text-sm text-white/60">Searching secure sources for resources…</p>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-white/5 p-4 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-full mb-1" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : hasSearched && results.length === 0 && !error ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm sm:text-base text-white/60">
              No results found for{" "}
              <span className="font-medium text-white/80">"{actualQuery || query}"</span>.
            </p>
            <p className="text-xs sm:text-sm text-white/50 mt-3">
              Try another search
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3 w-full">
            {actualQuery && (
              <p className="text-xs text-white/40 mb-4 px-2">
                Showing results for: "{actualQuery}"
              </p>
            )}
            {results.map((item) => (
              <div
                key={item.id || item.url}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition cursor-pointer break-words"
                onClick={() => navigate(withFrom(`/directory/${domain}/${encodeURIComponent(item.id || item.url)}`, location))}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 className="text-sm sm:text-base font-medium text-white hover:underline mb-1 break-words">
                      {item.title}
                    </h3>
                    {item.source && (
                      <p className="text-[11px] text-white/40 uppercase tracking-[0.12em] mb-2">
                        {item.source}
                      </p>
                    )}
                    {(item.description || item.snippet) && (
                      <p className="text-xs sm:text-sm text-white/60 mt-2 line-clamp-2 break-words">
                        {item.description || item.snippet}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleSaveFavorite(item)}
                      className="rounded-lg p-2 sm:p-2.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition min-h-[48px] min-w-[48px] flex items-center justify-center"
                      title="Save to favorites"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    {item.url && (() => {
                      const href = normalizeExternalUrl(item.url);
                      if (!href) return null;
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 sm:p-2.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition min-h-[48px] min-w-[48px] flex items-center justify-center"
                          title="Visit site"
                        >
                          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
              </div>
            )}
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm sm:text-base text-white/60">
              Start a conversation
            </p>
            <p className="text-xs sm:text-sm text-white/50 mt-3">
              Search for something above
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DirectoryWorkspace;

