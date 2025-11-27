// src/apps/providers/ProviderDashboardPage.jsx
// Provider dashboard with assigned clients, alerts, and sessions

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignedClients } from "@/services/providerService";
import { getRecentRiskSnapshots } from "@/services/providerTimeline";
import { trackPageView } from "@/services/telemetry";
import { Users, AlertTriangle, Clock, FileText, Eye, Loader2 } from "lucide-react";

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { userId, isProvider, isAdmin, isLoading: identityLoading } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("clients");
  const [riskEvents, setRiskEvents] = useState([]);

  useEffect(() => {
    document.title = "Provider Dashboard - WellnessCafe";
    trackPageView("provider_dashboard");

    // Redirect if not a provider
    if (!identityLoading && !isProvider && !isAdmin) {
      navigate("/");
      return;
    }

    // Load assigned clients
    if (userId && (isProvider || isAdmin)) {
      loadClients();
    }

    // Load risk events
    let mounted = true;
    async function loadRiskEvents() {
      if (userId) {
        const data = await getRecentRiskSnapshots({ providerId: userId, limit: 10 });
        if (mounted) setRiskEvents(data);
      }
    }
    loadRiskEvents();
    return () => { mounted = false; };
  }, [userId, isProvider, isAdmin, identityLoading, navigate]);

  const loadClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listAssignedClients(userId);
      if (result.ok) {
        setClients(result.clients || []);
      } else {
        setError(result.error || "Failed to load clients");
        // Still show mock data if available
        if (result.clients && result.clients.length > 0) {
          setClients(result.clients);
        }
      }
    } catch (err) {
      console.error("Error loading clients:", err);
      setError("Failed to load clients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  if (identityLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-wcGold" />
      </div>
    );
  }

  if (!isProvider && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <p className="text-base text-white/60">You don't have access to this area.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2">Provider Dashboard</h1>
          <p className="text-base text-white/60">
            {isAdmin ? "Administrator" : "Recovery Coach"} • Monitor and support your clients
          </p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "clients"
                ? "text-white border-b-2 border-wcGold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Assigned Clients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "alerts"
                ? "text-white border-b-2 border-wcGold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Alerts & Risks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === "sessions"
                ? "text-white border-b-2 border-wcGold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sessions & Notes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-wcGold" />
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-base text-white/60 mb-2">No assigned clients</p>
                <p className="text-sm text-white/40">
                  Clients will appear here once they are assigned to you.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <button
                    key={client.clientId}
                    type="button"
                    onClick={() => navigate(`/provider/clients/${client.clientId}/timeline`)}
                    className="rounded-lg border border-white/10 bg-white/5 p-5 text-left hover:bg-white/10 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-medium text-white mb-1">
                          {client.displayName}
                        </h3>
                        <p className="text-xs text-white/50 font-mono">
                          {client.clientId.slice(0, 8)}...
                        </p>
                      </div>
                      <Eye className="h-4 w-4 text-white/40 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium border ${getRiskBadgeColor(
                          client.currentRiskLevel
                        )}`}
                      >
                        {client.currentRiskLevel || "low"}
                      </span>
                      {client.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full px-2 py-1 text-[10px] text-white/60 bg-white/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Clock className="h-3 w-3" />
                      <span>Last seen: {formatDate(client.lastSeenAt)}</span>
                    </div>

                    {client.primaryConcerns.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <p className="text-xs text-white/50 mb-1">Primary concerns:</p>
                        <p className="text-xs text-white/70">
                          {client.primaryConcerns.slice(0, 2).join(", ")}
                          {client.primaryConcerns.length > 2 && "..."}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Alerts & Risks</h3>
                  <p className="text-xs text-white/70">
                    Risk signals and alerts will appear here. This feature is being enhanced with real-time monitoring.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Signals Panel */}
            <div className="mt-4 rounded-xl border border-gray-800/40 p-4 bg-black/20">
              <div className="text-sm font-semibold text-white/80 mb-2">Risk & Signals</div>

              {riskEvents.length === 0 && (
                <div className="text-xs text-white/40">No recent risk signals.</div>
              )}

              {riskEvents.length > 0 && (
                <div className="space-y-2">
                  {riskEvents.map(ev => (
                    <div key={ev.id} className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>{ev.riskLevel}</span>
                        <span>{ev.createdAt?.toDate?.()?.toLocaleString?.() || ""}</span>
                      </div>
                      {ev.reasons?.[0] && (
                        <div className="text-xs text-white/80 mt-1">{ev.reasons[0]}</div>
                      )}
                      {ev.emotion?.label && (
                        <div className="text-[11px] text-white/40">
                          {ev.emotion.label} · {ev.emotion.intensity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
              <FileText className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-base text-white/60 mb-2">Sessions & Notes</p>
              <p className="text-sm text-white/40">
                View and manage client sessions and notes. Click on a client to see their timeline and add notes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
