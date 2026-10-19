// src/admin/panels/DeployStatusPanel.jsx
import React from "react";
export function DeployStatusPanel() {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "unknown";
  const env = import.meta.env.MODE || "unknown";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">Deployment Status</h2>
        <p className="text-xs text-white/60 mb-4">
          A quick view of the site and release environment.
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">WellnessCafe site</div>
          <div className="text-sm text-white">{hostname}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Release environment</div>
          <div className="text-sm text-white">{env === "production" ? "Live site" : "Preview site"}</div>
        </div>
      </div>
    </div>
  );
}
