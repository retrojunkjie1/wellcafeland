// src/components/interaction/modules/SupportSearchModule.jsx
// Support search with comprehensive database and smart search

import React, { useState } from "react";
import { Search, MapPin, Phone, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { searchResources } from "@/services/resourceSearch";
import { searchSupportResources, getResourcesByLocation } from "@/lib/searchEngine";
import { REGIONS } from "@/lib/supportDatabase";

const SupportSearchModule = ({ module }) => {
  const { label } = module.payload;
  const [region, setRegion] = useState("");
  const [state, setState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  const [showAllResources, setShowAllResources] = useState(false);

  // Get available states/provinces for selected region
  const availableStates = region ? REGIONS[region]?.states || [] : [];

  // Handle region change - reset state
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setState("");
    setResults([]);
    setCorrectedQuery(null);
  };

  // Smart search function - uses global search + local suggestions
  const handleSearch = async () => {
    if (!region) return;

    setIsSearching(true);
    setCorrectedQuery(null);
    setResults([]);

    try {
      if (searchQuery.trim()) {
        // Try global search first
        const globalResult = await searchResources({
          query: searchQuery.trim(),
          domain: "hotlines", // Default to hotlines for support search
          region: state || region,
        });

        // Also get local suggestions
        const localResult = searchSupportResources(
          searchQuery.trim(),
          region,
          state || null
        );

        // Combine results (global first, then local)
        const combinedResults = [
          ...(globalResult.ok && globalResult.results ? globalResult.results : []),
          ...(localResult.results || []),
        ];

        setResults(combinedResults);
        setCorrectedQuery(localResult.correctedQuery);
        setShowAllResources(false);
      } else {
        // Show all local resources for region/state when no query
        const allResources = getResourcesByLocation(region, state || null);
        setResults(allResources);
        setShowAllResources(true);
      }
    } catch (err) {
      console.error("Search error:", err);
      // Fallback to local search only
      if (searchQuery.trim()) {
        const localResult = searchSupportResources(
          searchQuery.trim(),
          region,
          state || null
        );
        setResults(localResult.results || []);
        setCorrectedQuery(localResult.correctedQuery);
      } else {
        const allResources = getResourcesByLocation(region, state || null);
        setResults(allResources);
        setShowAllResources(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Show all resources when region is selected but no search query
  const handleShowAll = () => {
    if (!region) return;
    const allResources = getResourcesByLocation(region, state || null);
    setResults(allResources);
    setShowAllResources(true);
    setSearchQuery("");
    setCorrectedQuery(null);
  };

  return (
    <div className="animate-slide-up">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white mb-1.5">
            {label || "Find Support"}
          </h3>
          <p className="text-xs text-white/60 font-light">
            Let's find the right resources for you
          </p>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wide">
              Region / Country
            </label>
            <select
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-wcGold/50 focus:outline-none focus:ring-2 focus:ring-wcGold/20 transition-all"
            >
              <option value="">Select region</option>
              <option value="us">United States</option>
              <option value="ca">Canada</option>
              <option value="uk">United Kingdom</option>
            </select>
          </div>

          {region && availableStates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wide">
                {region === "us" ? "State" : region === "ca" ? "Province" : "Region"}
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setResults([]);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-wcGold/50 focus:outline-none focus:ring-2 focus:ring-wcGold/20 transition-all"
              >
                <option value="">All {region === "us" ? "States" : region === "ca" ? "Provinces" : "Regions"}</option>
                {availableStates.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wide">
              What kind of support are you looking for?
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && region) {
                    handleSearch();
                  }
                }}
                placeholder="e.g., crisis hotline, rehab program, financial assistance"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-wcGold/50 focus:outline-none focus:ring-2 focus:ring-wcGold/20 transition-all"
              />
            </div>
            {correctedQuery && (
              <div className="mt-2 flex items-center gap-2 text-xs text-wcGold/80">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Did you mean: <strong>{correctedQuery}</strong>?</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching || !region}
              className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : searchQuery.trim() ? (
                "Search"
              ) : (
                "Show All Resources"
              )}
            </button>
            {!searchQuery.trim() && region && (
              <button
                type="button"
                onClick={handleShowAll}
                disabled={isSearching}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                All
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/60 uppercase tracking-wide">
                {showAllResources ? "All Resources" : "Search Results"} ({results.length})
              </p>
            </div>
            {results.map((result, idx) => (
              <div
                key={result.id || result.url || idx}
                className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 space-y-3 hover:border-wcGold/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">
                      {result.name || result.title}
                    </h4>
                    <p className="text-xs text-wcGold/80 font-medium uppercase tracking-wide">
                      {result.type || result.category || result.source}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {result.description || result.snippet}
                </p>
                <div className="flex items-center gap-4 pt-2 flex-wrap">
                  {result.phone && (
                    <a
                      href={`tel:${result.phone.replace(/\s+/g, "")}`}
                      className="flex items-center gap-2 text-xs font-medium text-wcGold hover:text-amber-300 transition"
                    >
                      <Phone className="h-4 w-4" />
                      {result.phone}
                    </a>
                  )}
                  {result.text && (
                    <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                      <Phone className="h-4 w-4" />
                      <span>Text: {result.text}</span>
                    </div>
                  )}
                  {(result.link || result.url) && (
                    <a
                      href={result.link || result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-medium text-wcGold hover:text-amber-300 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && results.length === 0 && region && (
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-white/50 text-center py-4">
              No resources found. Try adjusting your search or region.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportSearchModule;

