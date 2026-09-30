// src/components/InAppWebView.jsx
// Modal iframe for opening links in-app (no external nav by default)

import React from "react";
import { X, ExternalLink } from "lucide-react";

function getSourcePreview(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "feedingamerica.org" || host.endsWith(".feedingamerica.org")) {
      return {
        title: "Feeding America food bank finder",
        heading: "Find a local food bank",
        description: "Feeding America’s network connects people with local food banks. Each local partner shares its own pantry locations, hours, and services. Search the official finder by ZIP code, then confirm details with the food bank before traveling.",
      };
    }
    if (host === "mealsonwheelsamerica.org" || host.endsWith(".mealsonwheelsamerica.org")) {
      return {
        title: "Meals on Wheels service finder",
        heading: "Find meal support for older adults",
        description: "Meals on Wheels programs are run by local providers. Services and eligibility vary by area. Use the official ZIP-code finder to connect with a nearby program and confirm its details.",
      };
    }
    if (host === "co.myfriendben.org" || host.endsWith(".myfriendben.org")) {
      return {
        eyebrow: "BENEFIT FINDER",
        title: "MyFriendBen benefits check",
        heading: "See benefit options that may fit",
        description: "MyFriendBen helps Denver residents explore public benefits, local programs, and tax credits. It can show estimated value and application effort; the benefit provider makes the final eligibility decision.",
      };
    }
    if (host === "peak.my.site.com" || host.endsWith(".peak.my.site.com") || host === "peak.state.co.us") {
      return {
        eyebrow: "STATE BENEFIT APPLICATION",
        title: "Colorado PEAK benefits",
        heading: "Apply for Colorado benefits",
        description: "Colorado PEAK is the state’s online place to check and apply for food, cash, medical, and other benefits. You can apply as a guest or create an account to save progress and track an application.",
      };
    }
  } catch {
    return null;
  }
  return null;
}

export default function InAppWebView({ url, title = "Preview", onClose, onOpenExternally }) {
  if (!url) return null;
  const sourcePreview = getSourcePreview(url);
  const displayTitle = sourcePreview?.title || title;
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
        <span className="text-sm text-white/80 truncate flex-1 mr-4">{displayTitle}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onOpenExternally && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm text-white/80 hover:bg-white/10 transition"
              aria-label={`Open ${displayTitle} in a new tab`}
              title="Open in a new tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in a new tab</span>
            </a>
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
        {sourcePreview ? (
          <main className="flex h-full items-center justify-center overflow-y-auto px-5 py-8">
            <section className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/80">{sourcePreview.eyebrow || "Official resource"}</p>
              <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{sourcePreview.heading}</h1>
              <p className="mt-4 text-base leading-relaxed text-white/75">{sourcePreview.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-amber-200 px-5 font-semibold text-slate-950 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                  Continue to {sourcePreview.title} <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
                <span className="text-sm text-white/55">Your WellnessCafe search stays open in this tab.</span>
              </div>
            </section>
          </main>
        ) : (
          <iframe
            src={url}
            title={displayTitle}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}
