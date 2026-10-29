// src/apps/provider/ProviderSocialInsights.jsx
// Provider social insights and oversight

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ShieldCheck } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listClientsForProvider } from "@/services/providerRegistry";
import { getConnections } from "@/services/connectionsService";
import { getUserCircles } from "@/services/circlesService";
import PageHeader from "@/components/navigation/PageHeader";

const ProviderSocialInsights = () => {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientConnections, setClientConnections] = useState(null);
  const [clientCircles, setClientCircles] = useState([]);

  useEffect(() => {
    if (!isProvider && !isAdmin) {
      navigate("/");
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProvider, isAdmin, providerId, userId, navigate]);

  const loadData = async () => {
    try {
      const providerIdToUse = providerId || userId;
      if (!providerIdToUse) {
        setLoading(false);
        return;
      }

      const clientsData = await listClientsForProvider(providerIdToUse);
      setClients(clientsData);
    } catch (err) {
      console.error("Failed to load provider social insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClientSocialData = async (clientId) => {
    try {
      const [connections, circles] = await Promise.all([
        getConnections(clientId),
        getUserCircles(clientId),
      ]);

      setClientConnections(connections);
      setClientCircles(circles);
    } catch (err) {
      console.error("Failed to load client social data:", err);
    }
  };

  if (!isProvider && !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Social Signals" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading social insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Social Signals"
        subtitle="Support chosen connections without turning private recovery activity into a score"
      />
      <div className="lux-shell py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <h2 className="text-lg font-medium text-white mb-4">Connected Clients</h2>
              <div className="space-y-2">
                {clients.length === 0 ? (
                  <div className="text-white/50 text-sm">No clients assigned</div>
                ) : (
                  clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        loadClientSocialData(client.id);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedClient?.id === client.id
                          ? "bg-wcGold/10 border-wcGold/30 text-wcGold"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="font-medium text-sm">{client.alias}</div>
                      <div className="text-xs opacity-75 capitalize">{client.riskLevel}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Client Social Data */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedClient ? (
              <div className="lux-card p-12 border border-white/10 bg-white/5 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-white/50">Select a client to view social insights</p>
              </div>
            ) : (
              <>
                <div className="lux-card p-5 border border-emerald-300/20 bg-emerald-300/5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-200 mt-0.5" />
                    <div>
                      <h2 className="text-base font-medium text-white">Client-led sharing</h2>
                      <p className="text-sm text-white/65 mt-1">Community posts and private reflections stay out of this view. Use an explicit shared check-in or a client-approved conversation to plan support; participation or silence is not a risk score.</p>
                    </div>
                  </div>
                </div>

                {/* Connections */}
                {clientConnections && (
                  <div className="lux-card p-6 border border-white/10 bg-white/5">
                    <h2 className="text-lg font-medium text-white mb-4">Connections</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">{clientConnections.friends.length}</div>
                        <div className="text-xs text-white/50">Friends</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{clientConnections.trusted.length}</div>
                        <div className="text-xs text-white/50">Trusted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{clientConnections.blocked.length}</div>
                        <div className="text-xs text-white/50">Blocked</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Circles */}
                {clientCircles.length > 0 && (
                  <div className="lux-card p-6 border border-white/10 bg-white/5">
                    <h2 className="text-lg font-medium text-white mb-4">Circles</h2>
                    <div className="space-y-2">
                      {clientCircles.map((circle) => (
                        <div key={circle.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
                          <div className="text-sm font-medium text-white capitalize">
                            {circle.theme} Circle
                          </div>
                          <div className="text-xs text-white/50 mt-1">{circle.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSocialInsights;
