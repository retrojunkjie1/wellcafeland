// src/components/system/ChatDock.jsx
// Phase 54D: ChatGPT-like dock for composer — fixed above AppDock, glass panel, safe-area aware.

import React from "react";

export default function ChatDock({ children }) {
  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pt-3 pb-[env(safe-area-inset-bottom)] border-t border-white/10 bg-slate-950/80 backdrop-blur shadow-[0_-4px_24px_rgba(0,0,0,0.2)]"
      style={{ minHeight: "var(--wc-chat-dock-h, 88px)" }}
    >
      {children}
    </div>
  );
}
