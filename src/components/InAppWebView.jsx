// src/components/InAppWebView.jsx
// Modal iframe for opening links in-app (no external nav by default)

import React from "react";
import { X, ExternalLink } from "lucide-react";

export default function InAppWebView({ url, title = "Preview", onClose, onOpenExternally }) {
  if (!url) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
        <span className="text-sm text-white/80 truncate flex-1 mr-4">{title}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenExternally && (
            <button
              type="button"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition"
              title="Open externally"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg border border-white/20 text-white/70 hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
