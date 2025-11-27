// src/apps/workspace/RealHelpWorkspace.jsx
// Real Help workspace - Housing, Grants, Programs, Circles

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Home, DollarSign, Briefcase, Users, AlertCircle, ExternalLink, Heart, MapPin } from "lucide-react";
import { searchResources } from "@/services/resourceSearch";
import { listHousingProviders } from "@/services/housingService";
import { listGrants } from "@/services/grantsService";
import { listSupportPrograms } from "@/services/supportProgramsService";
import { listCircles } from "@/services/circlesService";
import { saveFavoriteResource } from "@/services/directoryService";
import { useOSStore } from "@/stores/useOSStore";
import PageHeader from "@/components/navigation/PageHeader";

const RealHelpWorkspace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { closeWorkspace } = useOSStore();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("priority") || "housing");
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [region, setRegion] = useState(searchParams.get("region") || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [curatedResults, setCuratedResults] = useState([]);

  useEffect(() => {
    loadData();
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
        
        const searchResult = await searchResources({
          query: query.trim(),
          domain,
          region: region || undefined,
        });

        if (searchResult.ok && searchResult.results) {
          setResults(searchResult.results);
        } else {
          setResults([]);
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
        backTo="/chat"
      />

      {/* Emergency Support Banner */}
      <div className="border-b border-red-400/20 bg-red-400/10 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium text-red-400">If you are in danger, call 988 or local emergency services immediately.</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="lux-shell py-6 space-y-6">
          {/* Disclaimer */}
          <div className="lux-card p-4 border border-white/10 bg-white/5">
            <p className="text-xs text-white/60">
              We cannot verify all listings. Please verify information directly with providers before making decisions.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "text-wcGold border-b-2 border-wcGold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50"
            />
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Region (optional)"
              className="w-32 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50"
            />
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-white/50">Loading...</div>
            </div>
          ) : allResults.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-white/50">No results found. Try a different search.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResults.map((item, index) => (
                <div
                  key={item.id || index}
                  className="lux-card p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-medium text-white line-clamp-2">
                      {item.name || item.title}
                    </h3>
                    {item.curated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-wcGold/20 text-wcGold">
                        Curated
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-white/70 line-clamp-3 mb-3">
                      {item.description}
                    </p>
                  )}
                  
                  {item.region && (
                    <div className="flex items-center gap-1 text-xs text-white/50 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{item.region}</span>
                    </div>
                  )}
                  
                  {item.capacity_status && (
                    <div className="text-xs mb-2">
                      <span className={`px-2 py-0.5 rounded ${
                        item.capacity_status === "open" ? "bg-green-400/20 text-green-400" :
                        item.capacity_status === "waitlist" ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-red-400/20 text-red-400"
                      }`}>
                        {item.capacity_status}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Website</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenDetail(item)}
                      className="px-3 py-1.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-xs"
                    >
                      More Info
                    </button>
                    <button
                      onClick={() => handleSaveFavorite(item)}
                      className="p-1.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
                      title="Save to favorites"
                    >
                      <Heart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealHelpWorkspace;

