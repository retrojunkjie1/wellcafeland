// src/admin/AdminGuard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminClaim } from "@/hooks/useAdminClaim";

export function AdminGuard({ children }) {
  const navigate = useNavigate();
  const { adminReady, isAdmin } = useAdminClaim();

  if (!adminReady) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="glass-panel rounded-2xl border border-amber-400/10 bg-amber-400/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Restricted</h2>
          <p className="text-sm text-white/70 mb-4">
            This area is for system administrators.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
