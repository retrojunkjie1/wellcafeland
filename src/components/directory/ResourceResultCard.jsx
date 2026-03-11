// src/components/directory/ResourceResultCard.jsx
// Compact luxury card for one directory result (Phase 54H)

import React from "react";
import { Phone, Globe, Bookmark, Share2 } from "lucide-react";

const DOMAIN_ICONS = {
  food: "🍽",
  housing: "🏠",
  treatment: "🩺",
  grants: "💰",
  programs: "📋",
  other: "📌",
};

function sanitizeTel(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[^\d+]/g, "").slice(0, 20);
}

export default function ResourceResultCard({ item, onSave, onOpen, onCall, onShare }) {
  const domain = item?.domain || "other";
  const icon = DOMAIN_ICONS[domain] || DOMAIN_ICONS.other;
  const phone = item?.phone ? sanitizeTel(item.phone) : null;
  const url = item?.url || null;

  const handleCall = () => {
    if (phone) {
      window.location.href = `tel:${phone}`;
      onCall?.(item);
    }
  };

  const handleWebsite = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      onOpen?.(item);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: item?.title || "Resource",
          text: item?.summary || "",
          url: url || undefined,
        });
        onShare?.(item);
      } catch (_) {}
    } else {
      const text = [item?.title, url, item?.phone].filter(Boolean).join(" ");
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
        onShare?.(item);
      }
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 transition p-3 flex gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">{item?.title || "Untitled"}</div>
        {item?.summary ? (
          <p className="text-xs text-white/60 line-clamp-2 mt-0.5">{item.summary}</p>
        ) : null}
        {item?.locationLine ? (
          <p className="text-[11px] text-white/50 mt-1">{item.locationLine}</p>
        ) : null}
        {item?.tags?.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-md bg-white/10 text-white/60 text-[10px]">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={handleCall}
          disabled={!phone}
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
          title="Call"
          aria-label="Call"
        >
          <Phone className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleWebsite}
          disabled={!url}
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
          title="Website"
          aria-label="Website"
        >
          <Globe className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onSave?.(item)}
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
          title="Save"
          aria-label="Save"
        >
          <Bookmark className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
          title="Share"
          aria-label="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
