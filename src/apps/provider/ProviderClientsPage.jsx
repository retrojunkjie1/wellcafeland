// src/apps/provider/ProviderClientsPage.jsx
// Provider clients list page

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listAssignmentsForProvider } from "@/services/assignmentService";
import { getClientEvents } from "@/services/clientRegistry";
import { calculateRiskLabel } from "@/services/riskService";
import PageHeader from "@/components/navigation/PageHeader";

const ProviderClientsPage = () => {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isProvider && !isAdmin) {
      navigate("/");
      return;
    }

    const loadClients = async () => {
      try {
        const providerIdToUse = providerId || userId;
        if (!providerIdToUse) {
          setLoading(false);
          return;
        }

        const assignments = await listAssignmentsForProvider(providerIdToUse);
        
        // Load risk data for each client
        const clientsWithRisk = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const events = await getClientEvents(assignment.clientId);
              const riskLevel = calculateRiskLabel(events);
              
              // Get last interaction
              const lastEvent = events.length > 0 ? events[events.length - 1] : null;
              const lastInteraction = lastEvent?.timestamp || null;

              return {
                ...assignment,
                alias: `Client ${assignment.clientId.substring(0, 8)}`,
                riskLevel,
                lastInteraction,
              };
            } catch (err) {
              console.error(`Failed to load risk for client ${assignment.clientId}:`, err);
              return {
                ...assignment,
                alias: `Client ${assignment.clientId.substring(0, 8)}`,
                riskLevel: "safe",
                lastInteraction: null,
              };
            }
          })
        );

        setClients(clientsWithRisk);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [isProvider, isAdmin, providerId, userId, navigate]);

  if (!isProvider && !isAdmin) {
    return null;
  }

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "at-risk":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "strained":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  const formatLastInteraction = (timestamp) => {
    if (!timestamp) return "Never";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="My Clients"
        subtitle="Assigned clients and their status"
      />
      <div className="lux-shell py-10">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-white/50">Loading clients...</div>
          </div>
        ) : clients.length === 0 ? (
          <div className="lux-card p-12 text-center border border-white/10 bg-white/5">
            <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No clients assigned</h3>
            <p className="text-sm text-white/50">
              Clients will appear here once they are assigned to you.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => navigate(`/provider/clients/${client.clientId}`)}
                className="w-full lux-card p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium text-white">{client.alias}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${getRiskBadgeColor(client.riskLevel)}`}
                      >
                        {client.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastInteraction(client.lastInteraction)}</span>
                      </div>
                      <span className="capitalize">{client.relationshipType}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {client.riskLevel === "critical" ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : client.riskLevel === "at-risk" ? (
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderClientsPage;

