// src/admin/pages/AdminTelemetry.jsx
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

export function AdminTelemetry() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    device_type: "all",
    disconnect_reason: "all",
    timeRange: "24h",
  });

  useEffect(() => {
    loadTelemetry();
  }, [filter]);

  const loadTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      // Read from telemetry_events collection (God-Eye Supreme schema)
      const colRef = collection(db, "telemetry_events");
      let q = query(colRef, orderBy("createdAt", "desc"), limit(200));

      const timeCutoff = new Date();
      if (filter.timeRange === "1h") {
        timeCutoff.setHours(timeCutoff.getHours() - 1);
      } else if (filter.timeRange === "24h") {
        timeCutoff.setHours(timeCutoff.getHours() - 24);
      } else if (filter.timeRange === "7d") {
        timeCutoff.setDate(timeCutoff.getDate() - 7);
      }

      const snapshot = await getDocs(q);
      let docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter by time range
      if (filter.timeRange !== "all") {
        docs = docs.filter((e) => {
          const eventTime = e.createdAt?.toDate?.() || e.timestamp?.toDate?.() || (e.timestamp ? new Date(e.timestamp) : null);
          return eventTime && eventTime >= timeCutoff;
        });
      }

      // Filter by device type and disconnect reason
      let filtered = docs;
      if (filter.device_type !== "all") {
        filtered = filtered.filter((e) => 
          e.metadata?.deviceType === filter.device_type || 
          e.device_type === filter.device_type
        );
      }
      if (filter.disconnect_reason !== "all") {
        filtered = filtered.filter((e) => 
          e.metadata?.chat_disconnect_reason === filter.disconnect_reason ||
          e.chat_disconnect_reason === filter.disconnect_reason
        );
      }

      setEvents(filtered);
           } catch (err) {
             const errorMsg = err?.message || "Failed to load telemetry";
             console.error("[AdminTelemetry] Failed to load telemetry:", {
               error: err,
               message: errorMsg,
             });
             setError(errorMsg);
             setEvents([]);
           } finally {
             setLoading(false);
           }
         };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Telemetry</h2>

      <div className="flex flex-wrap gap-2">
        <select
          value={filter.device_type}
          onChange={(e) => setFilter({ ...filter, device_type: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Devices</option>
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          <option value="desktop">Desktop</option>
        </select>

        <select
          value={filter.disconnect_reason}
          onChange={(e) => setFilter({ ...filter, disconnect_reason: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Reasons</option>
          <option value="visibility_hidden">Visibility Hidden</option>
          <option value="mobile_timeout">Mobile Timeout</option>
          <option value="error">Error</option>
        </select>

        <select
          value={filter.timeRange}
          onChange={(e) => setFilter({ ...filter, timeRange: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
        >
          <option value="1h">Last 1 hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-4">
          <div className="text-sm font-medium text-red-200 mb-1">Error Loading Telemetry</div>
          <div className="text-xs text-red-300/80">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : events.length === 0 ? (
        <div className="glass-panel p-4 text-center text-xs text-white/60">
          {error 
            ? "Failed to load events. Check your Firestore rules and connection."
            : "No events yet. Telemetry events will appear here as users interact with the app. Check back after users start using features."}
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
            >
                    <div className="text-white font-medium">
                      {event.type || event.metadata?.type || "event"} ({event.level || "info"})
                    </div>
                    <div className="text-white/60 mt-1">
                      {event.metadata?.deviceType || event.device_type || "unknown"} • {event.metadata?.action || event.metadata?.url || "no action"}
                    </div>
                    <div className="text-white/50 mt-1">
                      {event.createdAt?.toDate?.()?.toLocaleString() || 
                       event.timestamp?.toDate?.()?.toLocaleString() || 
                       (event.timestamp ? new Date(event.timestamp).toLocaleString() : null) ||
                       "No timestamp"}
                    </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

