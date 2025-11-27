// src/apps/providers/components/TimelineItem.jsx

import React from "react";
import { Clock, Activity, AlertTriangle, MessageCircle, Calendar } from "lucide-react";

/**
 * Memoized Timeline Item Component
 * Prevents unnecessary re-renders of timeline items
 */
const TimelineItem = React.memo(({ item }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case "tool_usage":
        return Activity;
      case "risk_event":
        return AlertTriangle;
      case "chat_message":
        return MessageCircle;
      case "session_event":
        return Calendar;
      default:
        return Clock;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "border-destructive/50 bg-destructive/10 text-destructive";
      case "high":
        return "border-orange-400/50 bg-orange-400/10 text-orange-400";
      case "moderate":
      case "warning":
        return "border-amber-400/50 bg-amber-400/10 text-amber-400";
      default:
        return "border-border/50 bg-muted/20 text-muted-foreground";
    }
  };

  try {
    const Icon = getEventIcon(item?.type || "unknown");
    let timestamp;
    try {
      timestamp = item.timestamp instanceof Date
        ? item.timestamp
        : (item.timestamp ? new Date(item.timestamp) : new Date());
    } catch {
      timestamp = new Date();
    }

    // Generate stable key
    const stableKey = item.id || 
                     (item.timestamp?.getTime ? `item-${item.type}-${item.timestamp.getTime()}` : `item-${item.type}`);

    return (
      <div
        key={stableKey}
        className={`lux-card p-3 border-l-2 ${getSeverityColor(item.severity || "low")}`}
      >
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSeverityColor(item.severity || "low")}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-medium text-foreground capitalize">
                {item.label || "Event"}
              </p>
              <span className="text-[10px] text-muted-foreground">
                {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
              </span>
            </div>
            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={tag || idx}
                    className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {String(tag || "").replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
            {item.type === "tool_usage" && 
             item.metadata?.context?.intensityBefore !== undefined && 
             typeof item.metadata.context.intensityBefore === 'number' && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Intensity: {item.metadata.context.intensityBefore}/10
              </p>
            )}
          </div>
        </div>
      </div>
    );
  } catch (itemErr) {
    console.warn("Failed to render timeline item (non-critical):", itemErr.message);
    return null;
  }
});

TimelineItem.displayName = "TimelineItem";

export default TimelineItem;

