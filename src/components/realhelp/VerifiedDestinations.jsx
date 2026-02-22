// src/components/realhelp/VerifiedDestinations.jsx
// Verified provider selector component (Kipu-style)

import React, { useState, useEffect } from "react";
import { searchProviders } from "@/services/providerService";
import { CheckCircle } from "lucide-react";
import OpenInAppButton from "@/components/OpenInAppButton";

export function VerifiedDestinations({ category, regionKey, onSelectProvider, onAddRegion, onOpenLink }) {
  const [providers, setProviders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const commonTags = ["men", "women", "mat-friendly", "faith-based", "parole-friendly"];

  useEffect(() => {
    loadProviders();
  }, [category, regionKey]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const results = await searchProviders({
        query: searchQuery,
        category,
        regionKey,
      });
      setProviders(results);
    } catch (err) {
      console.error("Failed to load providers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [searchQuery]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredProviders = providers.filter(p => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(tag => p.tags?.includes(tag));
  });

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h3 className="text-base font-semibold text-white mb-2">Verified Destinations Near You</h3>
        <p className="text-xs text-white/60">Staff-reviewed resources</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, city, or tags..."
          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/40 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {commonTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedTags.includes(tag)
                  ? "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                  : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-xs text-white/60 py-4">Loading providers...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-xs text-white/60 py-4 space-y-2">
            <p>No staff-verified providers in this region yet.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onAddRegion?.()}
                className="px-2 py-1 rounded bg-wcGold/20 text-wcGold border border-wcGold/40 hover:bg-wcGold/30 text-xs font-medium"
              >
                Add region
              </button>
              {onOpenLink ? (
                <button
                  type="button"
                  onClick={() => onOpenLink("https://findtreatment.gov")}
                  className="px-2 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 text-xs inline-flex items-center gap-1"
                >
                  View national resources
                </button>
              ) : (
                <OpenInAppButton
                  url="https://findtreatment.gov"
                  title="Find Treatment.gov"
                  className="px-2 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 text-xs inline-flex items-center gap-1"
                >
                  View national resources
                </OpenInAppButton>
              )}
            </div>
          </div>
        ) : (
          <select
            onChange={(e) => {
              const provider = filteredProviders.find(p => p.id === e.target.value);
              if (provider && onSelectProvider) {
                onSelectProvider(provider);
              }
            }}
            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
            defaultValue=""
          >
            <option value="">Select a provider...</option>
            {filteredProviders.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name} {provider.verification?.status === "verified" && "✓"}
                {provider.city && ` • ${provider.city}, ${provider.state}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {filteredProviders.length > 0 && (
        <div className="text-xs text-white/50">
          {filteredProviders.length} verified provider{filteredProviders.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
}

