// src/apps/workspace/RealHelpWorkspace.jsx
// Real Help workspace - Housing, Grants, Programs, Circles

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Home, DollarSign, Briefcase, Users, AlertCircle, ExternalLink, Heart, MapPin, PhoneCall, CheckCircle } from "lucide-react";
import { rememberWorkspace } from "@/engines/memory/workspaceMemoryEngine";
import { searchResources } from "@/services/resourceSearch";
import { searchDirectory } from "@/services/directorySearch";
import { listHousingProviders } from "@/services/housingService";
import { listGrants } from "@/services/grantsService";
import { listSupportPrograms } from "@/services/supportProgramsService";
import { listCircles } from "@/services/circlesService";
import { saveFavoriteResource } from "@/services/directoryService";
import { normalizeExternalUrl } from "@/utils/normalizeUrl";
import PageHeader from "@/components/navigation/PageHeader";
import { loadContentById } from "@/services/contentService";
import { ContentViewer } from "@/components/content/ContentViewer";
import { VerifiedDestinations } from "@/components/realhelp/VerifiedDestinations";

const RealHelpWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("priority") || "housing");
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [curatedResults, setCuratedResults] = useState([]);
  const [startHereContent, setStartHereContent] = useState(null);
  const [searchResponse, setSearchResponse] = useState(null);

  useEffect(() => {
    loadData();
    // Load "Start Here" content
    loadContentById("assistance.realhelp.start")
      .then((content) => {
        setStartHereContent(content);
      })
      .catch((err) => {
        console.error("Failed to load Start Here content:", err);
        setStartHereContent(null);
      });
    
    // Remember workspace visit (PHASE 44)
    rememberWorkspace("real-help", {
      priority: activeTab,
      query: query || null,
      region: region || null,
    });
  }, [activeTab, query, region]);

  const loadData = async () => {
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
      }

      setCuratedResults(curated);

      // If we have a query, also search globally
      if (query && query.trim()) {
        const domain = activeTab === "housing" ? "housing" : 
                      activeTab === "funding" ? "grants" : 
                      activeTab === "programs" ? "assistance" : "programs";

        // Programs tab: use globalResourceSearch (live pipeline)
        if (activeTab === "programs") {
          const dirResult = await searchDirectory({
            query: query.trim(),
            domain,
            location: region || undefined,
            category: activeTab,
            limit: 20,
          });
          setSearchResponse({ ok: dirResult.ok, results: dirResult.items, error: dirResult.error });
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
            })));
          } else {
            setResults([]);
          }
        } else {
          const searchResult = await searchResources({
            query: query.trim(),
            domain,
            region: region || undefined,
            category: activeTab,
          });
          setSearchResponse(searchResult);
          if (searchResult.ok && searchResult.results) {
            setResults(searchResult.results);
          } else {
            setResults([]);
          }
        }
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Failed to load real help data:", err);
      setResults([]);
      setCuratedResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = async (item) => {
    try {
      const domain = activeTab === "housing" ? "housing" : 
                    activeTab === "funding" ? "grants" : 
                    activeTab === "programs" ? "assistance" : "programs";
      
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
    const domain = activeTab === "housing" ? "housing" : 
                  activeTab === "funding" ? "grants" : 
                  activeTab === "programs" ? "assistance" : "programs";
    
    navigate(`/directory/${domain}/${encodeURIComponent(item.id)}`);
  };

  const tabs = [
    { id: "housing", label: "Housing", icon: Home },
    { id: "funding", label: "Funding", icon: DollarSign },
    { id: "programs", label: "Programs", icon: Briefcase },
    { id: "circles", label: "Circles", icon: Users },
  ];

  const allResults = [...curatedResults, ...results];

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <PageHeader
        title="Find Real Help"
        subtitle="Housing • Grants • Programs • Recovery Circles"
        showBack={false}
      />

      {/* Emergency Support Banner */}
      <div className="border-b border-red-400/30 bg-gradient-to-r from-red-400/[0.12] to-red-500/[0.08] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-400/20 flex items-center justify-center mt-0.5">
              <AlertCircle className="h-5 w-5 text-red-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base text-red-100 font-medium mb-2">
                If you're in crisis right now, you don't have to figure this out alone.
              </p>
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                <a 
                  href="tel:988" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/20 text-red-100 hover:bg-red-400/30 transition border border-red-400/30 font-medium"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call 988</span>
                </a>
                <a 
                  href="sms:988" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/20 text-red-100 hover:bg-red-400/30 transition border border-red-400/30 font-medium"
                >
                  <span>Text 988</span>
                </a>
                <span className="text-red-200/70 flex items-center">
                  24/7 Suicide & Crisis Lifeline
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Start Here Section */}
          {startHereContent && (
            <div className="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/[0.12] via-amber-500/[0.08] to-amber-600/[0.06] p-8 shadow-lg backdrop-blur-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/20">
                  <AlertCircle className="h-6 w-6 text-amber-200" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Start Here</h2>
                  <p className="text-base text-amber-100/80 leading-relaxed">
                    If you're overwhelmed, scared, or don't know where to begin—you're in the right place. Take a breath. We'll walk through this together.
                  </p>
                </div>
              </div>
              <div className="prose prose-invert prose-amber max-w-none">
                <ContentViewer title={null} body={startHereContent.body} />
              </div>
            </div>
          )}

          {/* Trust & Transparency */}
          <div className="rounded-xl border border-blue-400/20 bg-gradient-to-r from-blue-400/[0.08] to-blue-500/[0.05] p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center mt-0.5">
                <Heart className="h-4 w-4 text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/80 leading-relaxed">
                  <strong className="text-white font-medium">Our Commitment:</strong> Every resource marked "Verified" has been reviewed by our team. External search results should be verified directly with providers. Your safety and well-being matter—please trust your instincts and ask questions.
                </p>
              </div>
            </div>
          </div>

          {/* Verified Destinations Module */}
          <VerifiedDestinations
            category={activeTab === "housing" ? "housing" : activeTab === "funding" ? "funding" : activeTab === "programs" ? "treatment" : "circles"}
            regionKey={region || undefined}
            onSelectProvider={(provider) => {
              // Navigate to provider detail or show in existing card layout
              setQuery(provider.name);
            }}
          />

          {/* Tabs */}
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

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50 transition"
              />
            </div>
            <div className="w-full sm:w-48">
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
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
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Heart className="h-8 w-8 text-white/30" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-base font-medium text-white mb-2">No results yet</h3>
                <p className="text-sm text-white/60">
                  {query || region 
                    ? "Try adjusting your search terms or region filter."
                    : `Browse ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} resources or try searching above.`}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-white/60">
                  Found <span className="font-medium text-white border border-black shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">{allResults.length}</span> resource{allResults.length !== 1 ? 's' : ''}
                </p>
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
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-wcGold/10 hover:border-wcGold/30 transition text-xs font-medium"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Visit Site</span>
                              </a>
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

          {/* Crisis Resources Footer */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
              <h3 className="text-base font-semibold text-white mb-4">24/7 Crisis & Support Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <PhoneCall className="h-4 w-4 text-wcGold flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white">988 Suicide & Crisis Lifeline</p>
                      <p className="text-xs text-white/60">Call or text 988, available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneCall className="h-4 w-4 text-wcGold flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white">SAMHSA National Helpline</p>
                      <p className="text-xs text-white/60">1-800-662-4357 (treatment referrals)</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <PhoneCall className="h-4 w-4 text-wcGold flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white">Crisis Text Line</p>
                      <p className="text-xs text-white/60">Text HOME to 741741</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <PhoneCall className="h-4 w-4 text-wcGold flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-white">Disaster Distress Helpline</p>
                      <p className="text-xs text-white/60">1-800-985-5990</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/50 mt-4 leading-relaxed">
                These lines are confidential, free, and staffed by trained counselors who understand crisis and addiction. You don't have to be suicidal to call—if you're struggling, that's reason enough.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealHelpWorkspace;

