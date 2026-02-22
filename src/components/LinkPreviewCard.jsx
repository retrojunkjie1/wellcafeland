// src/components/LinkPreviewCard.jsx
// Reusable link preview card; opens InAppWebView on click

import React, { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { fetchLinkPreview } from "@/lib/linkPreview";
import InAppWebView from "./InAppWebView";

export default function LinkPreviewCard({ url, title, description, image, domain, onOpen }) {
  const [preview, setPreview] = useState(
    title || description || domain ? { title, description, image, domain, url } : null
  );
  const [loading, setLoading] = useState(!title && !description && !domain);
  const [webViewUrl, setWebViewUrl] = useState(null);

  useEffect(() => {
    if (!url) return;
    if (title || description || domain) {
      setPreview({ title, description, image, domain, url });
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchLinkPreview(url).then((data) => {
      if (!cancelled) {
        setPreview(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [url, title, description, image, domain]);

  const handleOpen = () => {
    if (onOpen) {
      onOpen(url);
    } else {
      setWebViewUrl(url);
    }
  };

  const displayTitle = preview?.title || preview?.domain || "Link";
  const displayDomain = preview?.domain || "";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-wcGold/30 hover:bg-white/[0.05] transition flex gap-3"
      >
        {preview?.image && (
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
            <img src={preview.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
          ) : (
            <>
              <p className="text-sm font-medium text-white truncate">{displayTitle}</p>
              {displayDomain && (
                <p className="text-xs text-white/50 truncate">{displayDomain}</p>
              )}
              {preview?.description && (
                <p className="text-xs text-white/60 line-clamp-2 mt-1">{preview.description}</p>
              )}
            </>
          )}
          <div className="mt-2 flex items-center gap-1 text-xs text-wcGold">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open in app</span>
          </div>
        </div>
      </button>
      {webViewUrl && (
        <InAppWebView
          url={webViewUrl}
          title={displayTitle}
          onClose={() => setWebViewUrl(null)}
          onOpenExternally
        />
      )}
    </>
  );
}
