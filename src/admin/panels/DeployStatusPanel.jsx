// src/admin/panels/DeployStatusPanel.jsx
import React from "react";
import { firebaseConfig } from "@/config/firebaseConfig";

export function DeployStatusPanel() {
  const projectId = firebaseConfig?.projectId || "unknown";
  const authDomain = firebaseConfig?.authDomain || "unknown";
  const storageBucket = firebaseConfig?.storageBucket || "unknown";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "unknown";
  const env = import.meta.env.MODE || "unknown";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">Deployment Status</h2>
        <p className="text-xs text-white/60 mb-4">
          Read-only deployment and environment information.
        </p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Project ID</div>
          <div className="text-sm font-mono text-white">{projectId}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Auth Domain</div>
          <div className="text-sm font-mono text-white">{authDomain}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Storage Bucket</div>
          <div className="text-sm font-mono text-white">{storageBucket}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Current Hostname</div>
          <div className="text-sm font-mono text-white">{hostname}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-xs text-white/60 mb-1">Environment Mode</div>
          <div className="text-sm font-mono text-white">{env}</div>
        </div>
      </div>
    </div>
  );
}

