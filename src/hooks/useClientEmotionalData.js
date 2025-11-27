// src/hooks/useClientEmotionalData.js

import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { safeLimit } from "../utils/queryOptimizer";
import { getCache, setCache, hasValidCache } from "../stores/cacheStore";

/**
 * Hook for fetching emotional timeline data for a specific client
 */
export function useClientEmotionalData(clientId, options = {}) {
  const { limit: dataLimit = 100, daysBack = 30, useCache = true } = options;
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(() => !!db);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !clientId) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Check cache first
    const cacheKey = `timeline_${clientId}_${dataLimit}_${daysBack}`;
    if (useCache && hasValidCache(cacheKey)) {
      const cached = getCache(cacheKey);
      // Use setTimeout to avoid setState in effect
      setTimeout(() => {
        setTimeline(cached);
        setLoading(false);
      }, 0);
      // Still subscribe for real-time updates
    }

    // Calculate date threshold
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysBack);
    const thresholdTimestamp = Timestamp.fromDate(thresholdDate);
    
    const limitValue = safeLimit(dataLimit, 100);

    const timelineItems = [];

    // Query tool_usage
    const toolUsageQuery = query(
      collection(db, "tool_usage"),
      where("userId", "==", clientId),
      where("createdAt", ">=", thresholdTimestamp),
      orderBy("createdAt", "desc"),
      limit(limitValue)
    );

    // Query agent_events (filtered by userId in meta)
    const agentEventsQuery = query(
      collection(db, "agent_events"),
      where("userId", "==", clientId),
      where("timestamp", ">=", thresholdTimestamp),
      orderBy("timestamp", "desc"),
      limit(limitValue)
    );

    // Query telemetry_events
    const telemetryQuery = query(
      collection(db, "telemetry_events"),
      where("userId", "==", clientId),
      where("createdAt", ">=", thresholdTimestamp),
      orderBy("createdAt", "desc"),
      limit(limitValue)
    );

    const unsubscribers = [];

    // Subscribe to tool_usage
    const unsubscribeToolUsage = onSnapshot(
      toolUsageQuery,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            updateTimeline();
            return;
          }
          snapshot.docs.forEach((doc) => {
            try {
              if (!doc.exists()) return;
              const data = doc.data();
              if (!data) return;
              
              const timestamp = data.createdAt?.toDate?.() || 
                               (data.createdAt ? new Date(data.createdAt) : new Date());
              const intensityBefore = data.context?.intensityBefore ?? 0;
              
              timelineItems.push({
                id: `tool_${doc.id}`,
                type: "tool_usage",
                timestamp,
                toolId: data.toolId || "unknown",
                severity: intensityBefore >= 8 ? "high" : intensityBefore >= 4 ? "moderate" : "low",
                label: `${(data.toolId || "tool").replace(/-/g, " ")} used`,
                tags: Array.isArray(data.context?.tags) ? data.context.tags : [],
                metadata: data,
              });
            } catch (itemErr) {
              console.warn("Failed to process timeline item (non-critical):", itemErr.message);
            }
          });
          updateTimeline();
        } catch (err) {
          console.warn("Tool usage subscription callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Tool usage subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );
    unsubscribers.push(unsubscribeToolUsage);

    // Subscribe to agent_events
    const unsubscribeAgentEvents = onSnapshot(
      agentEventsQuery,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            updateTimeline();
            return;
          }
          snapshot.docs.forEach((doc) => {
            try {
              if (!doc.exists()) return;
              const data = doc.data();
              if (!data) return;
              
              const timestamp = data.timestamp?.toDate?.() || 
                               (data.timestamp ? new Date(data.timestamp) : new Date());
              
              timelineItems.push({
                id: `agent_${doc.id}`,
                type: "risk_event",
                timestamp,
                severity: data.severity || "moderate",
                label: data.message || `${data.agentId || "agent"} event`,
                tags: Array.isArray(data.meta?.evaluation?.tags) ? data.meta.evaluation.tags : [],
                agentId: data.agentId || "unknown",
                metadata: data,
              });
            } catch (itemErr) {
              console.warn("Failed to process agent event item (non-critical):", itemErr.message);
            }
          });
          updateTimeline();
        } catch (err) {
          console.warn("Agent events subscription callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Agent events subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );
    unsubscribers.push(unsubscribeAgentEvents);

    // Subscribe to telemetry_events
    const unsubscribeTelemetry = onSnapshot(
      telemetryQuery,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            updateTimeline();
            return;
          }
          snapshot.docs.forEach((doc) => {
            try {
              if (!doc.exists()) return;
              const data = doc.data();
              if (!data) return;
              
              const timestamp = data.createdAt?.toDate?.() || 
                               (data.createdAt ? new Date(data.createdAt) : new Date());
              const eventType = data.type || "telemetry";
              
              timelineItems.push({
                id: `telemetry_${doc.id}`,
                type: eventType,
                timestamp,
                severity: data.severity || data.riskLevel || "low",
                label: eventType === "chat_message" ? "Chat message" : 
                      eventType === "session_event" ? "Session event" : 
                      "Telemetry event",
                tags: Array.isArray(data.tags) ? data.tags : [],
                metadata: data,
              });
            } catch (itemErr) {
              console.warn("Failed to process telemetry item (non-critical):", itemErr.message);
            }
          });
          updateTimeline();
        } catch (err) {
          console.warn("Telemetry subscription callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Telemetry subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );
    unsubscribers.push(unsubscribeTelemetry);

    function updateTimeline() {
      try {
        // Sort by timestamp (most recent first) with fallback
        const sorted = [...timelineItems].sort((a, b) => {
          const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 
                       (typeof a.timestamp === 'number' ? a.timestamp : 0);
          const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 
                       (typeof b.timestamp === 'number' ? b.timestamp : 0);
          return bTime - aTime;
        });
        const limited = sorted.slice(0, limitValue);
        setTimeline(limited);
        
        // Cache the result
        if (useCache) {
          setCache(cacheKey, limited, 60 * 1000); // 1 minute cache
        }
        
        setLoading(false);
      } catch (err) {
        console.warn("Timeline update error (non-critical):", err.message);
        setTimeline([]);
        setLoading(false);
      }
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [clientId, dataLimit, daysBack, useCache]);

  return {
    timeline,
    loading,
    error,
  };
}

