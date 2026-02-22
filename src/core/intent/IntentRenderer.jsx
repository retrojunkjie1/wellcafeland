// src/core/intent/IntentRenderer.jsx
// Renders intent-driven UI; no auto-open from generic discomfort

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { normalizeIntent } from "./intentTypes";
import DirectoryResultBlock from "@/components/os/DirectoryResultBlock";

export default function IntentRenderer({ intent, onOpenLink, onRunTool, onDirectorySearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { type, payload } = normalizeIntent(intent);
  const safePayload = payload && typeof payload === "object" ? payload : {};

  switch (type) {
    case "chat.message":
      return null;

    case "directory.search": {
      const { query, region, resources, domain } = safePayload;
      const q = query || safePayload.queryHint || "";
      if (resources && Array.isArray(resources) && resources.length > 0) {
        const directoryData = {
          results: resources,
          domain: domain || "programs",
          query: q,
        };
        return (
          <div className="mt-3">
            <DirectoryResultBlock message={directoryData} />
          </div>
        );
      }
      if (onDirectorySearch && q) {
        return (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onDirectorySearch({ query: q, region: region || "", domain: domain || "" })}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition border border-white/20"
            >
              Find resources for &quot;{q.slice(0, 40)}{q.length > 40 ? "…" : ""}&quot;
            </button>
          </div>
        );
      }
      return null;
    }

    case "resource.preview": {
      const url = safePayload.url;
      const title = safePayload.title || url;
      if (url && onOpenLink) {
        onOpenLink({ url, title });
      }
      return null;
    }

    case "tool.suggest": {
      if (typeof localStorage !== "undefined" && localStorage.getItem("wc_calming_tools_never") === "1") {
        return null;
      }
      const toolId = safePayload.toolId;
      if (!toolId) return null;
      const labels = {
        breathing: "Breathing",
        grounding: "Grounding",
        "urge-surfing": "Urge Surfing",
        journaling: "Journaling",
        "body-scan": "Body Scan",
        meditation: "Meditation",
        education: "Education",
      };
      const label = labels[toolId] || toolId;
      return (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRunTool && onRunTool(toolId, safePayload.args || {})}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition border border-white/20"
          >
            {label}
          </button>
        </div>
      );
    }

    case "tool.run": {
      const runToolId = safePayload.toolId;
      if (runToolId && onRunTool) {
        onRunTool(runToolId, safePayload.args || {});
      }
      return null;
    }

    case "page.navigate": {
      const to = safePayload.to;
      if (to && typeof to === "string") {
        navigate(to, { state: { from: location.pathname } });
      }
      return null;
    }

    default:
      return null;
  }
}
