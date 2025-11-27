// src/apps/providers/components/ClientEmotionalTimeline.jsx

import React from "react";
import { useClientEmotionalData } from "../../../hooks/useClientEmotionalData";
import TimelineItem from "./TimelineItem";
import ClientWeeklyPattern from "./ClientWeeklyPattern";

const ClientEmotionalTimeline = ({ clientId }) => {
  const { timeline, loading, error } = useClientEmotionalData(clientId, {
    limit: 50,
    daysBack: 30,
  });

  if (loading) {
    return (
      <div className="lux-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Error loading timeline: {error}
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="lux-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No emotional data available for this client yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timeline.map((item, idx) => (
        <TimelineItem key={item.id || `item-${idx}`} item={item} />
      ))}
    </div>
  );
};

export default ClientEmotionalTimeline;

