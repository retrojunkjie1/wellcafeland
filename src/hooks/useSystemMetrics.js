// src/hooks/useSystemMetrics.js

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { getTelemetrySnapshot } from "../services/telemetry";
import { safeLimit } from "../utils/queryOptimizer";
import { getCache, setCache, hasValidCache } from "../stores/cacheStore";

/**
 * Hook for system metrics and health monitoring
 * Aggregates data from multiple sources for admin dashboard
 */
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    agentExecutions: 0,
    systemHealth: "healthy",
    uptime: 0,
    errorRate: 0,
    avgResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      // Check cache first
      const cacheKey = "admin_metrics";
      if (hasValidCache(cacheKey)) {
        const cached = getCache(cacheKey);
        setMetrics(cached);
        setLoading(false);
        // Still refresh in background
      }

      if (!db) {
        // Fallback to localStorage-based metrics
        const telemetry = getTelemetrySnapshot();
        const fallbackMetrics = {
          totalUsers: 1, // Anonymous user
          activeUsers: 1,
          totalSessions: telemetry?.events?.length || 0,
          agentExecutions: 0,
          systemHealth: "healthy",
          uptime: 0,
          errorRate: 0,
          avgResponseTime: 0,
        };
        setMetrics(fallbackMetrics);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get user count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;
        const activeUsers = usersSnapshot.docs.filter(
          (doc) => {
            const data = doc.data();
            const lastActive = data.lastActive?.toMillis?.() || data.lastActive || 0;
            const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
            return lastActive > dayAgo;
          }
        ).length;

        // Get session count
        const sessionsSnapshot = await getDocs(collection(db, "sessions"));
        const totalSessions = sessionsSnapshot.size;

        // Get agent executions
        const agentExecutionsSnapshot = await getDocs(
          query(
            collection(db, "agent_events"),
            orderBy("timestamp", "desc"),
            limit(safeLimit(1000, 2000))
          )
        );
        const agentExecutions = agentExecutionsSnapshot.size;

        // Calculate error rate and avg response time from agent events
        const executions = agentExecutionsSnapshot.docs.map((doc) => doc.data());
        const failed = executions.filter((e) => !e.success).length;
        const errorRate = executions.length > 0 ? (failed / executions.length) * 100 : 0;
        const responseTimes = executions
          .filter((e) => e.responseTime)
          .map((e) => e.responseTime);
        const avgResponseTime =
          responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        // Determine system health
        let systemHealth = "healthy";
        if (errorRate > 10) systemHealth = "degraded";
        if (errorRate > 25) systemHealth = "down";

        const metricsData = {
          totalUsers,
          activeUsers,
          totalSessions,
          agentExecutions,
          systemHealth,
          uptime: 0, // Would need server-side tracking
          errorRate: Math.round(errorRate * 10) / 10,
          avgResponseTime,
        };

        setMetrics(metricsData);
        
        // Cache the result
        setCache(cacheKey, metricsData, 30 * 1000); // 30 second cache

        setError(null);
      } catch (err) {
        console.warn("Failed to load system metrics (non-critical):", err.message);
        setError(err.message);
        // Set safe defaults on error
        setMetrics({
          totalUsers: 0,
          activeUsers: 0,
          totalSessions: 0,
          agentExecutions: 0,
          systemHealth: "unknown",
          uptime: 0,
          errorRate: 0,
          avgResponseTime: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();

    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      // Trigger reload
    },
  };
}

