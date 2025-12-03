// src/apps/provider/ProviderSocialInsights.jsx
// Provider social insights and oversight

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertTriangle, Activity, TrendingUp, MessageSquare } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listClientsForProvider } from "@/services/providerRegistry";
import { getConnections } from "@/services/connectionsService";
import { getUserCircles } from "@/services/circlesService";
import { getFeedPosts } from "@/services/socialService";
import PageHeader from "@/components/navigation/PageHeader";

const ProviderSocialInsights = () => {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientConnections, setClientConnections] = useState(null);
  const [clientCircles, setClientCircles] = useState([]);
  const [clientFeedActivity, setClientFeedActivity] = useState([]);

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
      const [connections, circles, feedPosts] = await Promise.all([
        getConnections(clientId),
        getUserCircles(clientId),
        getFeedPosts(100), // Get all posts and filter client's
      ]);

      setClientConnections(connections);
      setClientCircles(circles);
      
      // Filter feed posts for this client
      const clientPosts = feedPosts.filter(post => post.userId === clientId);
      setClientFeedActivity(clientPosts);
    } catch (err) {
      console.error("Failed to load client social data:", err);
    }
  };

  const calculateSocialRiskScore = (connections, circles, feedActivity) => {
    let score = 0;
    let flags = [];

    // Check for isolation
    if (connections.friends.length === 0 && connections.trusted.length === 0) {
      score += 20;
      flags.push("No social connections");
    }

    // Check for blocked users (might indicate conflict)
    if (connections.blocked.length > 5) {
      score += 15;
      flags.push("High number of blocked users");
    }

    // Check for circle participation
    if (circles.length === 0) {
      score += 10;
      flags.push("Not participating in circles");
    }

    // Check feed activity (low activity might indicate withdrawal)
    if (feedActivity.length === 0) {
      score += 10;
      flags.push("No social feed activity");
    }

    // Check for negative patterns in feed
    const negativeKeywords = ["struggling", "hard", "difficult", "alone", "lost"];
    const hasNegativePattern = feedActivity.some(post => 
      negativeKeywords.some(kw => post.text.toLowerCase().includes(kw))
    );
    if (hasNegativePattern) {
      score += 15;
      flags.push("Negative patterns in social posts");
    }

    return {
      score: Math.min(100, score),
      level: score < 30 ? "low" : score < 60 ? "medium" : "high",
      flags,
    };
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

  const socialRisk = selectedClient && clientConnections && clientCircles && clientFeedActivity
    ? calculateSocialRiskScore(clientConnections, clientCircles, clientFeedActivity)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Social Signals"
        subtitle="Monitor client social connections and activity"
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
                {/* Social Risk Score */}
                {socialRisk && (
                  <div className="lux-card p-6 border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-5 w-5 text-white/70" />
                      <h2 className="text-lg font-medium text-white">Social Risk Score</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl font-bold ${
                          socialRisk.level === "low" ? "text-green-400" :
                          socialRisk.level === "medium" ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {socialRisk.score}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white capitalize">
                            {socialRisk.level} Risk
                          </div>
                          <div className="text-xs text-white/50">Social engagement score</div>
                        </div>
                      </div>
                      {socialRisk.flags.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="text-xs font-medium text-white/70 mb-2">Flags:</div>
                          <div className="space-y-1">
                            {socialRisk.flags.map((flag, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs text-white/60">
                                <AlertTriangle className="h-3 w-3 text-yellow-400" />
                                <span>{flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Feed Activity */}
                {clientFeedActivity.length > 0 && (
                  <div className="lux-card p-6 border border-white/10 bg-white/5">
                    <h2 className="text-lg font-medium text-white mb-4">Recent Feed Activity</h2>
                    <div className="space-y-3">
                      {clientFeedActivity.slice(0, 5).map((post) => (
                        <div key={post.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-white/70 capitalize">{post.type}</span>
                            <span className="text-xs text-white/50">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 line-clamp-2">{post.text}</p>
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

