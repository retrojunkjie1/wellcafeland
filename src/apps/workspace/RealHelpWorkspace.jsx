// src/apps/workspace/RealHelpWorkspace.jsx
// Unified Assistance — one page, action-first. Housing, Food, Funding, Programs, Emergency, Circles.

import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Home, DollarSign, Briefcase, Users, ExternalLink, Heart, MapPin, PhoneCall, CheckCircle } from "lucide-react";
import { rememberWorkspace } from "@/engines/memory/workspaceMemoryEngine";
import { searchResources } from "@/services/resourceSearch";
import { searchDirectory } from "@/services/directorySearch";
import { listHousingProviders } from "@/services/housingService";
import { listGrants } from "@/services/grantsService";
import { listSupportPrograms } from "@/services/supportProgramsService";
import { listCircles } from "@/services/circlesService";
import { saveFavoriteResource } from "@/services/directoryService";
import { getCuratedFallback } from "@/lib/directoryCuratedFallback";
import { normalizeExternalUrl } from "@/utils/normalizeUrl";
import InAppWebView from "@/components/InAppWebView";

const DOMAIN_TO_PRIORITY = {
  "food.essentials": "food",
  hotlines: "emergency",
  housing: "housing",
  grants: "funding",
  programs: "programs",
};

const RealHelpWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAssistanceRoute = location.pathname === "/assistance";
  const qp = searchParams;
  const urlPriority = qp.get("priority");
  const urlDomain = qp.get("domain");
  const resolvedDomain = (urlDomain && urlDomain.trim()) ? urlDomain.trim() : null;
  const resolvedPriority = urlPriority || (urlDomain && DOMAIN_TO_PRIORITY[urlDomain]) || "housing";
  const [activeTab, setActiveTab] = useState(resolvedPriority);

  // Sync activeTab when URL priority changes (e.g. from Assistance page)
  useEffect(() => {
    const next = urlPriority || (urlDomain && DOMAIN_TO_PRIORITY[urlDomain]) || "housing";
    setActiveTab((prev) => (prev !== next ? next : prev));
  }, [urlPriority, urlDomain]);
  const [query, setQuery] = useState(qp.get("query") || "");
  const [region, setRegion] = useState(qp.get("region") || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [curatedResults, setCuratedResults] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null)
  const [webViewUrl, setWebViewUrl] = useState(null)
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchInputRef = useRef(null);
  const regionInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const DEBOUNCE_MS = 600;
  const MIN_QUERY_LEN = 3;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadData(), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = null;
    };
  }, [activeTab, query, region, resolvedDomain]);

  useEffect(() => {
    // Remember workspace visit (PHASE 44)
    rememberWorkspace("real-help", {
      priority: activeTab,
      query: query || null,
      region: region || null,
    });
  }, [activeTab, query, region]);

  const loadData = async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    const reqId = ++requestIdRef.current;

    setLoading(true);
    try {
      // Load curated Firestore data first
      let curated = [];
      
      if (activeTab === "housing") {
        curated = await listHousingProviders({ region: region || undefined });
      } else if (activeTab === "funding") {
        curated = await listGrants({ region: region || undefined });
      } else if (activeTab === "programs") {
        curated = await listSupportPrograms({ region: region || undefined });
      } else if (activeTab === "circles") {
        curated = await listCircles();
      } else if (activeTab === "food") {
        curated = getCuratedFallback("food.essentials", query).map((r) => ({
          id: r.id,
          name: r.name,
          title: r.name,
          description: r.description,
          website: r.link,
          url: r.link,
          phone: r.phone,
          source: r.source,
          verification: r.verified ? { status: "verified" } : { status: "external" },
          curated: true,
        }));
      } else if (activeTab === "emergency") {
        curated = getCuratedFallback("hotlines", query).map((r) => ({
          id: r.id,
          name: r.name,
          title: r.name,
          description: r.description,
          website: r.link,
          url: r.link,
          phone: r.phone,
          source: r.source,
          verification: r.verified ? { status: "verified" } : { status: "external" },
          curated: true,
        }));
      }

      if (signal.aborted || reqId !== requestIdRef.current) return;
      setCuratedResults(curated);

      // If we have a query (min 3 chars), also search globally
      const q = (query || "").trim()
      if (q.length >= MIN_QUERY_LEN) {
        const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : "programs");

        // Programs tab: use globalResourceSearch (live pipeline) with abort support
        if (activeTab === "programs") {
          const dirResult = await searchDirectory({
            query: q,
            domain,
            location: region || undefined,
            category: activeTab,
            limit: 20,
            signal,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          if (import.meta.env.DEV) {
            console.debug("[RealHelp] programs search", { query: q, region: region || null, domain, resultCount: dirResult.items?.length ?? 0 });
          }
          setSearchResponse({ ok: dirResult.ok, results: dirResult.items, error: dirResult.error, meta: dirResult.meta });
          if (dirResult.ok && dirResult.items?.length) {
            setResults(dirResult.items.map((r) => ({
              id: r.id,
              name: r.title,
              title: r.title,
              description: r.description || r.summary,
              website: r.url,
              url: r.url,
              region: r.state || r.address,
              source: r.source,
              verification: r.verified ? { status: "verified" } : { status: "external" },
              ...(domain && { domain: domain }),
            })));
          } else {
            setResults([]);
          }
        } else {
          const searchResult = await searchResources({
            query: q,
            domain: domain,
            region: region || undefined,
            category: activeTab,
          });
          if (signal.aborted || reqId !== requestIdRef.current) return;
          setSearchResponse(searchResult);
          if (searchResult.ok && searchResult.results) {
            setResults(searchResult.results.map((r) => ({
              ...r,
              ...(domain && { domain: domain }),
            })));
          } else {
            setResults([]);
          }
        }
      } else {
        setResults([]);
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.error("Failed to load real help data:", err);
      setResults([]);
      setCuratedResults([]);
    } finally {
      if (abortControllerRef.current === controller) setLoading(false);
    }
  };

  const handleSaveFavorite = async (item) => {
    try {
      const domain = resolvedDomain || (activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : "programs");
      
      await saveFavoriteResource(domain, {
        id: item.id,
        title: item.name || item.title,
        description: item.description || item.snippet,
        url: item.website || item.url,
        source: item.source || "curated",
      });
      
      // Show success (could use toast)
      console.log("Saved to favorites");
    } catch (err) {
      console.error("Failed to save favorite:", err);
    }
  };

  const handleOpenDetail = (item) => {
    const domain = activeTab === "housing" ? "housing" : activeTab === "food" ? "food.essentials" : activeTab === "funding" ? "grants" : activeTab === "programs" ? "assistance" : activeTab === "emergency" ? "hotlines" : "programs";
    
    navigate(`/resources/${encodeURIComponent(item.id)}`);
  };

  const tabs = [
    { id: "housing", label: "Housing", icon: Home },
    { id: "food", label: "Food", icon: MapPin },
    { id: "funding", label: "Funding", icon: DollarSign },
    { id: "programs", label: "Programs", icon: Briefcase },
    { id: "emergency", label: "Emergency", icon: PhoneCall },
    { id: "circles", label: "Circles", icon: Users },
  ];

  const allResults = [...curatedResults, ...results];

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Minimal header — one line, action-first */}
      <div className="flex-shrink-0 border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-medium text-white">Find Help</h1>
            <p className="text-xs text-white/50 mt-0.5">Housing · Food · Funding · Programs · Crisis</p>
          </div>
          {isAssistanceRoute ? (
            <div className="flex items-center gap-3">
              <a href="tel:988" className="text-xs text-red-300 hover:text-red-200 font-medium whitespace-nowrap">988</a>
              <button type="button" onClick={() => navigate("/assistance/request")} className="text-xs text-white/50 hover:text-white/80">Request Help</button>
            </div>
          ) : (
            <button type="button" onClick={() => navigate("/assistance")} className="text-xs text-white/60 hover:text-white">← Back</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Tabs — primary action */}
          <div className="flex gap-2 border-b border-white/10 pb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-wcGold border-b-2 border-wcGold -mb-px"
                      : "text-white/60 hover:text-white hover:bg-white/5 rounded-t-lg"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search - debounced (450ms), Enter triggers immediate search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (debounceRef.current) clearTimeout(debounceRef.current)
                    debounceRef.current = null
                    loadData()
                  }
                }}
                placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 transition"
              />
            </div>
            <div className="w-full sm:w-48">
              <input
                ref={regionInputRef}
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (debounceRef.current) clearTimeout(debounceRef.current)
                    debounceRef.current = null
                    loadData()
                  }
                }}
                placeholder="Region (e.g., California)"
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 transition"
              />
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-8 h-8 border-2 border-wcGold/30 border-t-wcGold rounded-full animate-spin"></div>
              <div className="text-sm text-white/50">Finding resources...</div>
            </div>
          ) : allResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 gap-3">
              <Heart className="h-10 w-10 text-white/20" />
              <p className="text-sm text-white/50 text-center">
                {query || region ? "Try different words or region." : `Pick a category above or search.`}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button type="button" onClick={() => regionInputRef.current?.focus()} className="px-3 py-1.5 text-xs rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/40 hover:bg-wcGold/30 font-medium">Add region</button>
                <button type="button" onClick={() => setWebViewUrl("https://findtreatment.gov")} className="px-3 py-1.5 text-xs rounded-lg border border-white/20 text-white/70 hover:bg-white/10 font-medium inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> National resources
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-sm text-white/60">
                  Found <span className="font-medium text-white border border-black shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">{allResults.length}</span> resource{allResults.length !== 1 ? 's' : ''}
                </p>
                {(searchResponse?.meta?.rateLimited || searchResponse?.meta?.subscriptionBlocked || searchResponse?.meta?.fallback) && (
                  <p className="text-xs text-white/50">Showing verified resources we already have.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allResults.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-5 hover:border-wcGold/30 hover:shadow-lg hover:shadow-wcGold/5 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-medium text-white line-clamp-2 flex-1 pr-2">
                        {item.name || item.title}
                      </h3>
                      {(item.curated || item.verification?.status === "verified") && (
                        <span className="text-xs px-2 py-1 rounded-full bg-wcGold/20 text-wcGold border border-wcGold/30 whitespace-nowrap flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                          {item.verification?.verifiedAt && (
                            <span className="text-wcGold/70 text-[10px]">
                              {new Date(item.verification.verifiedAt.toDate?.() || item.verification.verifiedAt).toLocaleDateString()}
                            </span>
                          )}
                        </span>
                      )}
                      {/* External/Unverified Badge - Only show if not verified */}
                      {!(item.curated || item.verification?.status === "verified") && 
                       (item.verification?.status === "external" || 
                        item.verification?.status === "unverified" || 
                        item._external ||
                        item.verification?.source === "findtreatment.gov") && (
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 whitespace-nowrap">
                          External
                        </span>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-white/70 line-clamp-3 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      {item.region && (
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{item.region}</span>
                        </div>
                      )}
                      
                      {item.capacity_status && (
                        <div className="inline-flex items-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            item.capacity_status === "open" ? "bg-green-400/20 text-green-300 border border-green-400/30" :
                            item.capacity_status === "waitlist" ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30" :
                            "bg-red-400/20 text-red-300 border border-red-400/30"
                          }`}>
                            {item.capacity_status === "open" ? "Currently Open" :
                             item.capacity_status === "waitlist" ? "Waitlist Available" :
                             "Limited Availability"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                          {item.phone && (
                            <a
                              href={`tel:${item.phone}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-wcGold/10 hover:border-wcGold/30 transition text-xs font-medium"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                          {(item.website || item.url) && (() => {
                            const href = normalizeExternalUrl(item.website || item.url);
                            if (!href) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => setWebViewUrl(href)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-wcGold/10 hover:border-wcGold/30 transition text-xs font-medium"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Visit Site</span>
                              </button>
                            );
                          })()}
                      <button
                        onClick={() => handleOpenDetail(item)}
                        className="flex items-center px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-xs font-medium"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleSaveFavorite(item)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-wcGold hover:bg-wcGold/10 hover:border-wcGold/30 transition"
                        title="Save to favorites"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Minimal crisis footer — tap to act */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
            <a href="tel:988" className="text-red-300 hover:text-red-200 font-medium">988</a>
            <a href="tel:18006624357" className="hover:text-white">SAMHSA 1-800-662-4357</a>
            <span className="text-white/30">|</span>
            <a href="sms:741741" className="hover:text-white">Text HOME to 741741</a>
          </div>
        </div>
      </div>
      {webViewUrl && (
        <InAppWebView
          url={webViewUrl}
          title="Resource"
          onClose={() => setWebViewUrl(null)}
          onOpenExternally
        />
      )}
    </div>
  );
};

export default RealHelpWorkspace;

