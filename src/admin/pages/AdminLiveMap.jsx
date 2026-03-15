// src/admin/pages/AdminLiveMap.jsx
// Live system status and activity

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

export function AdminLiveMap() {
  const [stats, setStats] = useState({
    onlineCount: 0,
    activeSessions5m: 0,
    activeSessions15m: 0,
    activeSessions60m: 0,
    errorRate15m: 0,
    toolUsage: {},
    signalsVolume: 0,
    medianLatency: null,
    recentErrors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLiveData();
    // Subscribe to real-time updates
    const unsubscribe = subscribeToLiveData(setStats);
    return () => unsubscribe();
  }, []);

  const loadLiveData = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      const fiveMinAgo = Timestamp.fromMillis(now - 5 * 60 * 1000);
      const fifteenMinAgo = Timestamp.fromMillis(now - 15 * 60 * 1000);
      const sixtyMinAgo = Timestamp.fromMillis(now - 60 * 60 * 1000);

      // Get recent telemetry events
      const telemetryRef = collection(db, "telemetry_events");
      const [events5m, events15m, events60m, errors15m] = await Promise.all([
        getDocs(query(telemetryRef, where("createdAt", ">=", fiveMinAgo), limit(1000))),
        getDocs(query(telemetryRef, where("createdAt", ">=", fifteenMinAgo), limit(1000))),
        getDocs(query(telemetryRef, where("createdAt", ">=", sixtyMinAgo), limit(1000))),
        getDocs(query(telemetryRef, where("createdAt", ">=", fifteenMinAgo), where("level", "==", "error"), orderBy("createdAt", "desc"), limit(10))),
      ]);

      // Count unique users by time window
      const uids5m = new Set();
      const uids15m = new Set();
      const uids60m = new Set();
      const toolUsage = {};
      let signalsCount = 0;
      let latencies = [];

      events5m.docs.forEach((doc) => {
        const data = doc.data();
        if (data.uid) uids5m.add(data.uid);
        if (data.type === "tool" && data.metadata?.toolId) {
          toolUsage[data.metadata.toolId] = (toolUsage[data.metadata.toolId] || 0) + 1;
        }
        if (data.type === "signal") signalsCount++;
        if (data.metadata?.duration) latencies.push(data.metadata.duration);
      });

      events15m.docs.forEach((doc) => {
        const data = doc.data();
        if (data.uid) uids15m.add(data.uid);
      });

      events60m.docs.forEach((doc) => {
        const data = doc.data();
        if (data.uid) uids60m.add(data.uid);
      });

      const recentErrors = errors15m.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const errorRate = events15m.docs.length > 0 
        ? (errors15m.docs.length / events15m.docs.length) * 100 
        : 0;

      const medianLatency = latencies.length > 0
        ? [...latencies].sort((a, b) => a - b)[Math.floor(latencies.length / 2)]
        : null;

      // Top 5 tools
      const topTools = Object.entries(toolUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce((acc, [tool, count]) => {
          acc[tool] = count;
          return acc;
        }, {});

      setStats({
        onlineCount: uids15m.size,
        activeSessions5m: uids5m.size,
        activeSessions15m: uids15m.size,
        activeSessions60m: uids60m.size,
        errorRate15m: errorRate.toFixed(1),
        toolUsage: topTools,
        signalsVolume: signalsCount,
        medianLatency,
        recentErrors,
      });
    } catch (err) {
      console.error("Failed to load live data:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLiveData = (setStats) => {
    const telemetryRef = collection(db, "telemetry_events");
    const q = query(telemetryRef, orderBy("createdAt", "desc"), limit(100));
    
    return onSnapshot(q, (snapshot) => {
      // Recalculate stats on new events
      loadLiveData();
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Live Map</h2>

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Online Users</div>
            <div className="text-2xl font-bold text-white">{stats.onlineCount}</div>
            <div className="text-xs text-white/50 mt-1">Last 15 min</div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Active Sessions</div>
            <div className="text-sm font-medium text-white">
              5m: {stats.activeSessions5m} • 15m: {stats.activeSessions15m} • 60m: {stats.activeSessions60m}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Error Rate (15m)</div>
            <div className={`text-2xl font-bold ${parseFloat(stats.errorRate15m) > 5 ? "text-red-400" : "text-white"}`}>
              {stats.errorRate15m}%
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Signals Volume (15m)</div>
            <div className="text-2xl font-bold text-white">{stats.signalsVolume}</div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Median Latency</div>
            <div className="text-2xl font-bold text-white">
              {stats.medianLatency ? `${Math.round(stats.medianLatency)}ms` : "N/A"}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Top Tools (5m)</div>
            <div className="text-xs text-white/80 mt-2 space-y-1">
              {Object.keys(stats.toolUsage).length === 0 ? (
                <div className="text-white/50">No tool usage</div>
              ) : (
                Object.entries(stats.toolUsage).map(([tool, count]) => (
                  <div key={tool} className="flex justify-between">
                    <span>{tool}</span>
                    <span className="text-white/60">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60 mb-2">Recent Critical Errors</div>
        {stats.recentErrors.length === 0 ? (
          <div className="text-sm text-white/60">No recent errors</div>
        ) : (
          <div className="space-y-2">
            {stats.recentErrors.map((error) => (
              <div key={error.id} className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                <div className="font-medium">{error.metadata?.error?.message || "Unknown error"}</div>
                <div className="text-red-400/70 mt-1">
                  {error.createdAt?.toDate?.()?.toLocaleString() || "Unknown time"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

