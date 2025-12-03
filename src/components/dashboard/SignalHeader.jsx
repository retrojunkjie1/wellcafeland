// src/components/dashboard/SignalHeader.jsx
// Phase 33: Luxury header for intelligence signals dashboard

import React from "react";
import { useOSStore } from "@/stores/useOSStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

export default function SignalHeader() {
  const messages = useOSStore((state) => state.messages || []);
  const identity = useSessionIdentity();

  // Get last active timestamp from last message
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastActive = lastMessage?.timestamp || lastMessage?.createdAt || Date.now();

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const diffMinutes = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    return new Date(timestamp).toLocaleDateString();
  };

  // Get user ID (anonymous)
  const userId = identity.userId || "guest";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-md shadow-wc-soft">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Signals & Moments
          </h1>
          <p className="text-xs text-white/50 mt-1 font-mono">
            {userId.slice(0, 8)}...
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40 uppercase tracking-wider">Last Active</p>
          <p className="text-sm text-white/70 font-medium mt-0.5">
            {formatRelativeTime(lastActive)}
          </p>
        </div>
      </div>
    </div>
  );
}
