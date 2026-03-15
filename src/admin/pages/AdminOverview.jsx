// src/admin/pages/AdminOverview.jsx
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { APP_VERSION } from "@/config/version";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { callFunction } from "@/lib/functionsClient";
import { firebaseConfig } from "@/config/firebaseConfig";
import { getFunctionsURL } from "@/lib/functionsClient";

export function AdminOverview() {
  const { claims, refreshClaims } = useAdminClaim();
  const auth = getAuth();
  const user = auth?.currentUser || null;
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await callFunction("adminGetOverview");
      setOverview(result);
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to load overview";
      console.error("[AdminOverview] Failed to load overview:", {
        error: err,
        message: errorMsg,
        code: err?.code,
      });
      setError(errorMsg);
      setOverview({ 
        error: errorMsg,
        projectId: firebaseConfig.projectId || "wellnesscafelanding",
        functionsURL: getFunctionsURL() || "not configured",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUID = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Overview</h2>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4">
          <div className="text-sm font-medium text-red-200 mb-1">Error Loading Overview</div>
          <div className="text-xs text-red-300/80">{error}</div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Project</div>
          <div className="text-sm font-medium text-white">
            {overview?.projectId || firebaseConfig.projectId || "wellnesscafelanding"}
          </div>
          {overview?.hostingSite && (
            <div className="text-xs text-white/50 mt-1">{overview.hostingSite}</div>
          )}
          {getFunctionsURL() && (
            <div className="text-xs text-white/40 mt-1">Functions: {getFunctionsURL()}</div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Auth</div>
          <div className="text-sm font-medium text-white">{user?.email || "N/A"}</div>
          <div className="text-xs text-white/50 mt-1">
            {user?.uid ? `UID: ${user.uid.slice(0, 8)}...` : "No UID"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Health</div>
          {loading ? (
            <div className="text-sm text-white/60">Loading...</div>
          ) : (
            <div className="text-sm font-medium text-white">
              {overview?.buildVersion || APP_VERSION}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Claims</div>
          <div className="text-sm font-medium text-white">
            {claims?.admin ? "Admin" : "User"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={refreshClaims}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition"
        >
          Refresh Claims
        </button>
        <button
          type="button"
          onClick={copyUID}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition"
        >
          Copy UID
        </button>
      </div>
    </div>
  );
}

