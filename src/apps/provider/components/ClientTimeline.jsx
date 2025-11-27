// src/apps/provider/components/ClientTimeline.jsx
// Client timeline component for provider view

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, Heart, Wrench, MessageSquare } from "lucide-react";
import { getClientEvents } from "@/services/clientRegistry";

const ClientTimeline = ({ clientId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    const loadEvents = async () => {
      try {
        const clientEvents = await getClientEvents(clientId, 50);
        setEvents(clientEvents);
      } catch (err) {
        console.error("Failed to load client events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [clientId]);

  const getEventIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "emotional":
        return <Heart className="h-4 w-4 text-pink-400" />;
      case "tool":
        return <Wrench className="h-4 w-4 text-blue-400" />;
      case "session":
      default:
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">Loading timeline...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">No events yet</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Timeline</h3>
      <div className="space-y-3">
        {events.map((event, index) => (
          <div
            key={event.id || index}
            className="flex gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <div className="flex-shrink-0 mt-1">
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white capitalize">
                  {event.type}
                </span>
                {event.emotionalLabel && (
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                    {event.emotionalLabel}
                  </span>
                )}
                <span className="text-xs text-white/50 ml-auto">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              {event.messagePreview && (
                <p className="text-sm text-white/70 line-clamp-2">
                  {event.messagePreview}
                </p>
              )}
              {event.riskShift && (
                <p className="text-xs text-white/50 mt-1">
                  Risk: {event.riskShift}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientTimeline;

