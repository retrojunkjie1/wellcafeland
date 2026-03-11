// src/apps/provider/ProviderDashboardPage.jsx
// Provider dashboard page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, Activity, Target } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getRiskOverview } from "@/services/riskService";
import { getRecentRiskSnapshots } from "@/services/providerTimeline";
import RiskRadar from "./components/RiskRadar";
import AlertFeed from "./components/AlertFeed";
import ProviderSocialInsights from "./ProviderSocialInsights";
import PageHeader from "@/components/navigation/PageHeader";
import { MessageSquare } from "lucide-react";

const ProviderDashboardPage = () => {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [riskOverview, setRiskOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskEvents, setRiskEvents] = useState([]);

  useEffect(() => {
    if (!isProvider && !isAdmin) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const providerIdToUse = providerId || userId;
        if (!providerIdToUse) {
          setLoading(false);
          return;
        }

        const [assignmentsData, riskData] = await Promise.all([
          listAssignmentsForProvider(providerIdToUse),
          getRiskOverview(providerIdToUse),
        ]);

        // Convert assignments to client list format
        const clientsData = assignmentsData.map((assignment) => ({
          clientId: assignment.clientId,
          alias: `Client ${assignment.clientId.substring(0, 8)}`, // Simple alias
          relationshipType: assignment.relationshipType,
        }));
        setClients(clientsData);
        setRiskOverview(riskData);
      } catch (err) {
        console.error("Failed to load provider dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Load risk events
    let mounted = true;
    async function loadRiskEvents() {
      const providerIdToUse = providerId || userId;
      if (providerIdToUse) {
        const data = await getRecentRiskSnapshots({ providerId: providerIdToUse, limit: 10 });
        if (mounted) setRiskEvents(data);
      }
    }
    loadRiskEvents();
    return () => { mounted = false; };
  }, [isProvider, isAdmin, providerId, userId, navigate]);

  if (!isProvider && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Provider Dashboard"
        subtitle="Clinical overview and client management"
      />
      <div className="lux-shell py-10 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-white/50">Loading dashboard...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Clients Widget */}
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-white/70" />
                <h2 className="text-lg font-medium text-white">My Clients</h2>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {clients.length}
              </div>
              <div className="text-sm text-white/50 mb-4">
                Total assigned clients
              </div>
              <button
                onClick={() => navigate("/provider/clients")}
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
              >
                View All Clients
              </button>
            </div>

            {/* Risk Radar */}
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <RiskRadar providerId={providerId || userId} />
            </div>

            {/* Today's Focus */}
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-white/70" />
                <h2 className="text-lg font-medium text-white">Today's Focus</h2>
              </div>
              {riskOverview && riskOverview.riskClients && riskOverview.riskClients.length > 0 ? (
                <div className="space-y-3">
                  {riskOverview.riskClients.slice(0, 3).map((client) => (
                    <div
                      key={client.clientId}
                      className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                      onClick={() => navigate(`/provider/clients/${client.clientId}`)}
                    >
                      <div className="text-sm font-medium text-white">{client.alias}</div>
                      <div className="text-xs text-white/50 capitalize mt-1">
                        {client.riskLevel} risk
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/50">No high-priority clients today</div>
              )}
            </div>

            {/* Alerts Feed */}
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <AlertFeed providerId={providerId || userId} />
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
      </div>
    </div>
  );
};

export default ProviderDashboardPage;

