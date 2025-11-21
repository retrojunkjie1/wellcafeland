// src/apps/ai/SessionHistorySidebar.jsx

import React, { useState } from "react";
import { MessageCircle, Plus, Trash2, Search, X } from "lucide-react";
import { useAIStore } from "./useAIStore";

const SessionHistorySidebar = () => {
  const { sessions, currentSessionId, loadSession, newSession, deleteSession } = useAIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = (sessionId, e) => {
    e.stopPropagation();
    if (showDeleteConfirm === sessionId) {
      deleteSession(sessionId);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(sessionId);
      setTimeout(() => setShowDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card/40 border-r border-border/50">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <button
          onClick={newSession}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors mb-3"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New conversation</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-background/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto py-2">
        {filteredSessions.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`
                    group relative flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors
                    ${isActive 
                      ? 'bg-amber-400/10 border border-amber-400/30' 
                      : 'hover:bg-foreground/5 border border-transparent'
                    }
                  `}
                >
                  <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate font-medium">
                      {session.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className={`
                      opacity-0 group-hover:opacity-100 transition-opacity
                      p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive
                      ${showDeleteConfirm === session.id ? 'opacity-100' : ''}
                    `}
                    title="Delete conversation"
                  >
                    {showDeleteConfirm === session.id ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistorySidebar;

