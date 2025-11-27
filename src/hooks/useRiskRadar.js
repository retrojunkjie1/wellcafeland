// src/hooks/useRiskRadar.js

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
 * Hook for Risk Radar data
 * Fetches agent events from last 7 days and aggregates risk metrics
 */
export function useRiskRadar() {
  const [data, setData] = useState({
    warningCount: 0,
    criticalCount: 0,
    totalEvents: 0,
    topEventTypes: [],
    dailyCounts: [],
  });
  const [loading, setLoading] = useState(() => !!db);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Check cache first
    const cacheKey = "risk_radar_7days";
    if (hasValidCache(cacheKey)) {
      const cached = getCache(cacheKey);
      setData(cached);
      setLoading(false);
    }

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

    // Query agent_events from last 7 days
    const q = query(
      collection(db, "agent_events"),
      where("timestamp", ">=", sevenDaysAgoTimestamp),
      orderBy("timestamp", "desc"),
      limit(safeLimit(500, 1000)) // Reasonable limit
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            setData({
              warningCount: 0,
              criticalCount: 0,
              totalEvents: 0,
              topEventTypes: [],
              dailyCounts: [],
            });
            setLoading(false);
            return;
          }

          const events = snapshot.docs
            .filter((doc) => doc.exists())
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

          // Aggregate data
          let warningCount = 0;
          let criticalCount = 0;
          const eventTypeCounts = {};
          const dailyCountsMap = {};

          events.forEach((event) => {
            try {
              // Count by severity
              if (event.severity === "warning") {
                warningCount++;
              } else if (event.severity === "critical") {
                criticalCount++;
              }

              // Count event types
              const eventType = event.eventType || "unknown";
              eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1;

              // Count by day
              if (event.timestamp) {
                const date = event.timestamp.toDate?.() || 
                           (event.timestamp ? new Date(event.timestamp) : new Date());
                const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
                dailyCountsMap[dayKey] = (dailyCountsMap[dayKey] || 0) + 1;
              }
            } catch (eventErr) {
              console.warn("Failed to process risk radar event (non-critical):", eventErr.message);
            }
          });

        // Get top 3 event types
        const topEventTypes = Object.entries(eventTypeCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([type, count]) => ({ type, count }));

        // Convert daily counts to array (last 7 days)
        const dailyCounts = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayKey = date.toISOString().split("T")[0];
          dailyCounts.push({
            date: dayKey,
            count: dailyCountsMap[dayKey] || 0,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
          });
        }

          const radarData = {
            warningCount,
            criticalCount,
            totalEvents: events.length,
            topEventTypes,
            dailyCounts,
          };
          
          setData(radarData);
          
          // Cache the result
          setCache(cacheKey, radarData, 60 * 1000); // 1 minute cache
          
          setError(null);
          setLoading(false);
        } catch (err) {
          console.warn("Risk Radar aggregation error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Risk Radar subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    ...data,
    loading,
    error,
  };
}

