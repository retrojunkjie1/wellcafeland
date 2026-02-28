// src/components/system/NotReadyCard.jsx
// Phase 53C: Calm placeholder for unfinished/dormant pages — never "coming soon"

import React from "react";
import { Link } from "react-router-dom";

export default function NotReadyCard({ title, body, actions = [] }) {
  const defaultBody = "This module is being brought online safely.";
  const defaultActions = [
    { label: "Go to Chat", to: "/chat" },
    { label: "Tools", to: "/tools" },
    { label: "Profile", to: "/profile" },
  ];
  const acts = actions.length > 0 ? actions : defaultActions;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-sm px-6 py-6">
      <h2 className="text-lg font-medium text-white mb-2">{title || "Module in Progress"}</h2>
      <p className="text-sm text-slate-300/80 leading-relaxed mb-6">{body || defaultBody}</p>
      <div className="flex flex-wrap gap-2">
        {acts.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 transition"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
