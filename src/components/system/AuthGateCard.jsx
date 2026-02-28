// src/components/system/AuthGateCard.jsx
// Phase 53: Premium guest-mode gate card

import React from "react";

export default function AuthGateCard({
  onLogin,
  onSignup,
  onExplore,
  title = "Sign in to continue",
  subtitle = "To protect your privacy and continuity, sessions require secure sign-in.",
}) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl">
        <div className="text-white text-lg font-semibold">{title}</div>
        <div className="text-slate-300 text-sm mt-1">{subtitle}</div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm border border-white/10"
            onClick={onLogin}
          >
            Sign in
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/55 text-white text-sm border border-white/10"
            onClick={onSignup}
          >
            Create account
          </button>

          <button
            type="button"
            className="px-3 py-2 rounded-xl text-slate-300 hover:text-white text-sm"
            onClick={onExplore}
          >
            Explore tools
          </button>
        </div>

        <div className="text-xs text-slate-400 mt-4">
          Guest browsing is available, but session continuity requires authentication.
        </div>
      </div>
    </div>
  );
}
