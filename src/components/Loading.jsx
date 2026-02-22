// src/components/Loading.jsx
// Minimal, calm loading indicator

import React from "react";

const Loading = ({ message = "Loading…" }) => (
  <div className="min-h-[120px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
      <p className="text-xs text-white/50">{message}</p>
    </div>
  </div>
);

export default Loading;
