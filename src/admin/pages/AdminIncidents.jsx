// src/admin/pages/AdminIncidents.jsx
// Incidents management

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";

export function AdminIncidents() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", severity: "all" });

  useEffect(() => {
    loadIncidents();
  }, [filter]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const incidentsRef = collection(db, "incidents", "current");
      let q = query(incidentsRef, orderBy("openedAt", "desc"));

      if (filter.status !== "all") {
        q = query(q, where("status", "==", filter.status));
      }
      if (filter.severity !== "all") {
        q = query(q, where("severity", "==", filter.severity));
      }

      const snapshot = await getDocs(q);
      setIncidents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load incidents:", err);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const resolveIncident = async (incidentId) => {
    if (!user || !confirm("Resolve this incident?")) return;

    try {
      await updateDoc(doc(db, "incidents", "current", incidentId), {
        status: "resolved",
        resolvedAt: serverTimestamp(),
        resolvedBy: user.uid,
      });
      
      // Log to admin_actions
      await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        createdByEmail: user.email,
        actionType: "resolveIncident",
        payload: { incidentId },
        status: "executed",
        executedAt: serverTimestamp(),
      });

      await loadIncidents();
    } catch (err) {
      console.error("Failed to resolve incident:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Incidents</h2>

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filter.severity}
          onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : incidents.length === 0 ? (
        <div className="text-sm text-white/60">No incidents found</div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className={`rounded-lg border p-4 ${
                incident.severity === "critical"
                  ? "border-red-400/30 bg-red-900/10"
                  : incident.severity === "high"
                  ? "border-yellow-400/30 bg-yellow-900/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-sm font-medium text-white">{incident.title || "Untitled"}</div>
                  <div className="text-xs text-white/60 mt-1">{incident.type || "Unknown"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    incident.severity === "critical" ? "bg-red-500/20 text-red-300" :
                    incident.severity === "high" ? "bg-yellow-500/20 text-yellow-300" :
                    "bg-white/10 text-white/70"
                  }`}>
                    {incident.severity}
                  </span>
                  {incident.status === "open" && (
                    <button
                      type="button"
                      onClick={() => resolveIncident(incident.id)}
                      className="rounded border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              {incident.summary && (
                <div className="text-xs text-white/70 mt-2">{incident.summary}</div>
              )}
              <div className="text-xs text-white/50 mt-2">
                Opened: {incident.openedAt?.toDate?.()?.toLocaleString() || "Unknown"}
                {incident.affectedUids && ` • Affected: ${incident.affectedUids.length} users`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

