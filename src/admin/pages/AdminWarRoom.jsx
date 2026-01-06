// src/admin/pages/AdminWarRoom.jsx
// War Room - Live operations dashboard

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, Timestamp, onSnapshot } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function AdminWarRoom() {
  const [stats, setStats] = useState({
    activeUsers5m: 0,
    activeUsers15m: 0,
    activeUsers60m: 0,
    recentErrors: [],
    toolUsage: {},
    offlineEvents: 0,
    avgLatency: null,
    systemHealth: "OK",
  });
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState(null);

  useEffect(() => {
    loadWarRoomData();
    const unsubscribe = subscribeToLiveData();
    return () => unsubscribe();
  }, []);

  const loadWarRoomData = async () => {
    try {
      setLoading(true);
      const now = Date.now();
      const fiveMinAgo = Timestamp.fromMillis(now - 5 * 60 * 1000);
      const fifteenMinAgo = Timestamp.fromMillis(now - 15 * 60 * 1000);
      const sixtyMinAgo = Timestamp.fromMillis(now - 60 * 60 * 1000);

      // Get active users from user_runtime
      const runtimeRef = collection(db, "user_runtime");
      const [runtime5m, runtime15m, runtime60m] = await Promise.all([
        getDocs(query(runtimeRef, where("lastActiveAt", ">=", fiveMinAgo), limit(1000))),
        getDocs(query(runtimeRef, where("lastActiveAt", ">=", fifteenMinAgo), limit(1000))),
        getDocs(query(runtimeRef, where("lastActiveAt", ">=", sixtyMinAgo), limit(1000))),
      ]);

      const uids5m = new Set(runtime5m.docs.map((d) => d.id));
      const uids15m = new Set(runtime15m.docs.map((d) => d.id));
      const uids60m = new Set(runtime60m.docs.map((d) => d.id));

      // Get recent errors
      const telemetryRef = collection(db, "telemetry_events");
      const errorsQuery = query(
        telemetryRef,
        where("createdAt", ">=", fifteenMinAgo),
        where("level", "==", "error"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const errorsSnapshot = await getDocs(errorsQuery);
      const recentErrors = errorsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Get tool usage from telemetry
      const toolEventsQuery = query(
        telemetryRef,
        where("createdAt", ">=", fifteenMinAgo),
        where("type", "==", "tool"),
        limit(200)
      );
      const toolEventsSnapshot = await getDocs(toolEventsQuery);
      const toolUsage = {};
      const latencies = [];

      toolEventsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.metadata?.toolId) {
          toolUsage[data.metadata.toolId] = (toolUsage[data.metadata.toolId] || 0) + 1;
        }
        if (data.metadata?.duration) {
          latencies.push(data.metadata.duration);
        }
      });

      // Get offline events
      const offlineQuery = query(
        telemetryRef,
        where("createdAt", ">=", fifteenMinAgo),
        where("type", "==", "network"),
        where("metadata.action", "==", "offline"),
        limit(100)
      );
      const offlineSnapshot = await getDocs(offlineQuery);
      const offlineEvents = offlineSnapshot.docs.length;

      // Calculate avg latency
      const avgLatency = latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : null;

      // Check for active incidents
      const incidentsRef = collection(db, "incidents", "current");
      const activeIncidents = await getDocs(query(incidentsRef, where("status", "==", "open"), limit(1)));
      const activeIncident = activeIncidents.docs[0]?.data() || null;

      // Determine system health
      let systemHealth = "OK";
      if (activeIncident?.severity === "critical") {
        systemHealth = "DEGRADED";
      } else if (recentErrors.length > 10 || offlineEvents > 20) {
        systemHealth = "WARN";
      }

      setStats({
        activeUsers5m: uids5m.size,
        activeUsers15m: uids15m.size,
        activeUsers60m: uids60m.size,
        recentErrors,
        toolUsage: Object.fromEntries(
          Object.entries(toolUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
        ),
        offlineEvents,
        avgLatency,
        systemHealth,
      });
      setIncident(activeIncident);
    } catch (err) {
      console.error("Failed to load war room data:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLiveData = () => {
    const telemetryRef = collection(db, "telemetry_events");
    const q = query(telemetryRef, orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, () => {
      loadWarRoomData();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">War Room</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          stats.systemHealth === "OK" ? "bg-green-500/20 text-green-300" :
          stats.systemHealth === "WARN" ? "bg-yellow-500/20 text-yellow-300" :
          "bg-red-500/20 text-red-300"
        }`}>
          {stats.systemHealth}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : (
        <>
          {/* Active Users */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Active Users (5m)</div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers5m}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Active Users (15m)</div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers15m}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Active Users (60m)</div>
              <div className="text-2xl font-bold text-white">{stats.activeUsers60m}</div>
            </div>
          </div>

          {/* System Health */}
          {incident && (
            <div className="rounded-lg border border-red-400/30 bg-red-900/10 p-4">
              <div className="text-sm font-medium text-red-300 mb-1">Active Incident</div>
              <div className="text-xs text-white/70">{incident.title || "Unknown"}</div>
              <div className="text-xs text-white/50 mt-1">Severity: {incident.severity}</div>
            </div>
          )}

          {/* Network Health */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Offline Events (15m)</div>
              <div className="text-2xl font-bold text-white">{stats.offlineEvents}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Avg Latency</div>
              <div className="text-2xl font-bold text-white">
                {stats.avgLatency ? `${stats.avgLatency}ms` : "N/A"}
              </div>
            </div>
          </div>

          {/* Tool Usage */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-2">Top Tools (15m)</div>
            {Object.keys(stats.toolUsage).length === 0 ? (
              <div className="text-sm text-white/60">No tool usage</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.toolUsage).map(([tool, count]) => (
                  <div key={tool} className="flex justify-between text-sm">
                    <span className="text-white">{tool}</span>
                    <span className="text-white/60">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Errors */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-2">Recent Errors (15m)</div>
            {stats.recentErrors.length === 0 ? (
              <div className="text-sm text-white/60">No errors</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
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
        </>
      )}
    </div>
  );
}

