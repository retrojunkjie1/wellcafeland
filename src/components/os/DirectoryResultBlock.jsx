// src/components/os/DirectoryResultBlock.jsx
// Compact directory results block for chat

import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ExternalLink, ArrowRight, FileText } from "lucide-react";
import { normalizeExternalUrl } from "@/utils/normalizeUrl";

const DirectoryResultBlock = ({ message }) => {
  const navigate = useNavigate();
  
  // Parse message if it's a string
  let directoryData;
  if (typeof message === "string") {
    try {
      directoryData = JSON.parse(message);
    } catch {
      return null;
    }
  } else {
    directoryData = message;
  }

  const { results, domain: backendDomain, query } = directoryData || {};
  
  // Map backend domain to route domain
  const routeDomainMap = {
    housing: "housing",
    government_assistance: "assistance",
    grants: "grants",
    programs: "programs",
    providers: "providers",
    hotlines: "hotlines",
  };
  
  const routeDomain = routeDomainMap[backendDomain] || backendDomain || "housing";
  
  if (!results || results.length === 0) {
    return null;
  }

  const topResults = results.slice(0, 3);

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-white mb-1">
            Found {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
          <div className="text-xs text-white/50">
            {(backendDomain === "providers") && "Therapists, coaches, and guides"}
            {(backendDomain === "housing") && "Housing and sober living options"}
            {(backendDomain === "grants") && "Grants and funding opportunities"}
            {(backendDomain === "government_assistance" || backendDomain === "assistance") && "Government assistance programs"}
            {(backendDomain === "hotlines") && "Crisis support and hotlines"}
            {(backendDomain === "programs") && "Support programs and groups"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {topResults.map((item, idx) => (
          <div
            key={item.id || idx}
            className="rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => navigate(`/directory/${routeDomain}/${encodeURIComponent(item.id || item.url)}`)}
                  className="text-sm font-medium text-white hover:underline block mb-1 text-left"
                >
                  {item.title}
                </button>
                <p className="text-xs text-white/60 line-clamp-2 mb-2">
                  {item.description || item.snippet}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.region && (
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <MapPin className="h-3 w-3" />
                      {item.region}
                    </div>
                  )}
                  {item.category && (
                    <span className="text-xs text-white/50">{item.category}</span>
                  )}
                  {item.source && (
                    <span className="text-xs text-white/40">{item.source}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {item.url && (() => {
                  const href = normalizeExternalUrl(item.url);
                  if (!href) return null;
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-lg p-1.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                      title="Visit site"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  );
                })()}
                <button
                  type="button"
                  onClick={() => navigate(`/directory/${routeDomain}/${encodeURIComponent(item.id || item.url)}`)}
                  className="flex-shrink-0 rounded-lg p-1.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                  title="View details"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length > 3 && (
        <button
          type="button"
          onClick={() => navigate(`/directory/${routeDomain}?q=${encodeURIComponent(query)}`)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          View full directory ({results.length} results)
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DirectoryResultBlock;

