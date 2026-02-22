// src/components/OpenInAppButton.jsx
// Button that opens link in-app (InAppWebView) first; explicit "Open externally" in modal

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import InAppWebView from "./InAppWebView";

export default function OpenInAppButton({ url, title, className, children }) {
  const [webViewUrl, setWebViewUrl] = useState(null);
  if (!url || typeof url !== "string") return null;
  const href = url.trim();
  if (!href) return null;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWebViewUrl(href);
  };

  const displayTitle = title || href;
  const defaultClassName = "inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className || defaultClassName}
      >
        {children || (
          <>
            <ExternalLink className="h-4 w-4" />
            Visit site
          </>
        )}
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
