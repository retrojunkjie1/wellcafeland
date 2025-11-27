// src/apps/provider/components/RiskRadar.jsx
// Risk radar component for provider view

import React, { useState, useEffect } from "react";
import { AlertTriangle, Shield, TrendingUp, Activity } from "lucide-react";
import { getClientRisk, getRiskOverview } from "@/services/riskService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

const RiskRadar = ({ clientId, providerId }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { providerId: currentProviderId } = useSessionIdentity();

  useEffect(() => {
    const loadRisk = async () => {
      try {
        if (clientId) {
          const clientRisk = await getClientRisk(clientId);
          setRiskData({
            riskLevel: clientRisk.riskLevel,
            lastHighIntensityEvent: clientRisk.lastHighIntensityEvent,
            alertCount: clientRisk.alertCount,
            totalEvents: clientRisk.totalEvents,
          });
        } else if (providerId || currentProviderId) {
          const overview = await getRiskOverview(providerId || currentProviderId);
          setRiskData({
            riskCounts: overview.riskCounts,
            totalClients: overview.totalClients,
            riskClients: overview.riskClients,
          });
        }
      } catch (err) {
        console.error("Failed to load risk data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRisk();
  }, [clientId, providerId, currentProviderId]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "at-risk":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "strained":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "safe":
      default:
        return "text-green-400 bg-green-400/10 border-green-400/20";
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return <AlertTriangle className="h-5 w-5" />;
      case "at-risk":
        return <TrendingUp className="h-5 w-5" />;
      case "strained":
        return <Activity className="h-5 w-5" />;
      case "safe":
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">Loading risk data...</div>
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">No risk data available</div>
      </div>
    );
  }

  // Client-specific view
  if (clientId && riskData.riskLevel) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white mb-4">Risk Assessment</h3>
        <div className={`p-4 rounded-lg border ${getRiskColor(riskData.riskLevel)}`}>
          <div className="flex items-center gap-3 mb-2">
            {getRiskIcon(riskData.riskLevel)}
            <span className="text-lg font-medium capitalize">{riskData.riskLevel}</span>
          </div>
          {riskData.alertCount > 0 && (
            <div className="text-sm mt-2">
              {riskData.alertCount} alert{riskData.alertCount !== 1 ? "s" : ""} in recent activity
            </div>
          )}
          {riskData.lastHighIntensityEvent && (
            <div className="text-xs mt-2 opacity-75">
              Last high-intensity event: {riskData.lastHighIntensityEvent.emotionalLabel || "Unknown"}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Provider overview view
  if (riskData.riskCounts) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white mb-4">Risk Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(riskData.riskCounts).map(([level, count]) => (
            <div
              key={level}
              className={`p-3 rounded-lg border ${getRiskColor(level)}`}
            >
              <div className="flex items-center gap-2">
                {getRiskIcon(level)}
                <span className="text-sm font-medium capitalize">{level}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{count}</div>
            </div>
          ))}
        </div>
        {riskData.riskClients && riskData.riskClients.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-white/70 mb-2">Clients needing attention:</div>
            <div className="space-y-2">
              {riskData.riskClients.slice(0, 5).map((client) => (
                <div
                  key={client.clientId}
                  className={`p-2 rounded border ${getRiskColor(client.riskLevel)}`}
                >
                  <div className="text-sm font-medium">{client.alias}</div>
                  <div className="text-xs opacity-75 capitalize">{client.riskLevel}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default RiskRadar;

