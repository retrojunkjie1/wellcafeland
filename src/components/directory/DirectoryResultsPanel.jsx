// src/components/directory/DirectoryResultsPanel.jsx
// Batch of directory results in chat (Phase 54H)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResourceResultCard from "./ResourceResultCard";
import { saveResource } from "@/lib/savedResources";

const DOMAIN_LABELS = {
  food: "Food & meals",
  housing: "Housing",
  treatment: "Treatment",
  grants: "Grants & funding",
  programs: "Programs",
  real_help: "Real Help",
  other: "Resources",
};

const REFINE_CHIPS = ["near me", "today", "women", "low cost"];

const LOCATION_CHIPS = ["Denver, CO", "Houston, TX", "Lagos", "Abuja", "Other..."];

export default function DirectoryResultsPanel({
  domain,
  query,
  results,
  onOpenDirectory,
  onAskLocation,
  onSaveItem,
}) {
  const navigate = useNavigate();
  const [savedId, setSavedId] = useState(null);

  const handleSave = (item) => {
    saveResource(item);
    onSaveItem?.(item);
    setSavedId(item?.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleOpenDirectory = () => {
    const priority = domain === "food" ? "food" : domain === "housing" ? "housing" : domain === "grants" ? "funding" : "programs";
    navigate(`/assistance?priority=${priority}${query ? `&query=${encodeURIComponent(query)}` : ""}`);
    onOpenDirectory?.();
  };

  const handleLocationChip = (chip) => {
    if (chip === "Other...") {
      onAskLocation?.();
      return;
    }
    onAskLocation?.(chip);
  };

  if (!results || results.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 space-y-3">
        <p className="text-sm text-white/80">Tell me your city or state for better results.</p>
        <div className="flex flex-wrap gap-2">
          {LOCATION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleLocationChip(chip)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/90 hover:bg-white/20 border border-white/10 transition"
            >
              {chip}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleOpenDirectory}
          className="w-full mt-2 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/15 border border-white/10 transition"
        >
          Open Real Help
        </button>
      </div>
    );
  }

  const label = DOMAIN_LABELS[domain] || domain || "Results";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-medium text-white/80">Real Help · {label}</span>
        <span className="text-[11px] text-white/50">{results.length} result{results.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
        {results.map((item) => (
          <ResourceResultCard
            key={item?.id || item?.url}
            item={item}
            onSave={handleSave}
            onOpen={() => {}}
            onCall={() => {}}
            onShare={() => {}}
          />
        ))}
      </div>
      <div className="px-3 py-2 border-t border-white/10 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleOpenDirectory}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/15 border border-white/10 transition"
        >
          Open full directory
        </button>
        {REFINE_CHIPS.map((chip) => (
          <span key={chip} className="px-2 py-1 rounded-md bg-white/5 text-white/50 text-[11px]">
            {chip}
          </span>
        ))}
        {savedId ? (
          <span className="text-[11px] text-white/50 ml-auto">Saved</span>
        ) : null}
      </div>
    </div>
  );
}
