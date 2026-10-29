// src/components/system/ChatDock.jsx
// Phase 54D: ChatGPT-like dock for composer — fixed above AppDock, glass panel, safe-area aware.

import React from "react";

export default function ChatDock({ children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-2 sm:px-5">
      {children}
    </div>
  );
}
