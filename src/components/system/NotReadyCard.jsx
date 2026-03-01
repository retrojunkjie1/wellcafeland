// src/components/system/NotReadyCard.jsx
// Phase 53C: Calm placeholder — never "coming soon", glass panel

import React from "react";
import { Link } from "react-router-dom";

const DEFAULT_TITLE = "This module is being brought online safely.";
const DEFAULT_BODY = "You can continue in Chat, or explore calming tools while we activate this area.";
const DEFAULT_ACTIONS = [
  { label: "Chat", to: "/chat" },
  { label: "Tools", to: "/tools" },
];

export default function NotReadyCard({ title = DEFAULT_TITLE, body = DEFAULT_BODY, actions = DEFAULT_ACTIONS }) {
  const acts = actions.length > 0 ? actions : DEFAULT_ACTIONS;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-6">
      <h2 className="text-lg font-medium text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-300/80 leading-relaxed mb-6">{body}</p>
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
