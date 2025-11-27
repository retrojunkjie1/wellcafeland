// src/apps/dashboard/components/EventItem.jsx

import React from "react";

/**
 * Memoized Event Item Component
 * Prevents unnecessary re-renders of event stream items
 */
const EventItem = React.memo(({ event, agents }) => {
  const agent = agents.find((a) => a.id === event.agentId);
  const timestamp = event.timestamp?.toDate?.() || new Date(event.timestamp);

  return (
    <div
      className={`flex items-start gap-3 p-2 rounded-md border ${
        event.success === false
          ? "border-destructive/30 bg-destructive/5"
          : "border-border/50 bg-muted/20"
      }`}
    >
      <div className="h-6 w-6 rounded-full bg-amber-400/10 flex items-center justify-center text-xs flex-shrink-0">
        {agent?.icon || "🤖"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium">
            {agent?.name || event.agentId}
          </p>
          {event.success === false && (
            <span className="text-[10px] text-destructive">Error</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {timestamp.toLocaleTimeString()}
        </p>
        {event.error && (
          <p className="text-[10px] text-destructive mt-1">
            {event.error}
          </p>
        )}
        {event.responseTime && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {event.responseTime}ms
          </p>
        )}
      </div>
    </div>
  );
});

EventItem.displayName = "EventItem";

export default EventItem;

