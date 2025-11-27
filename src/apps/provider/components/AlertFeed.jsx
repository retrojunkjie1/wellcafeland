// src/apps/provider/components/AlertFeed.jsx
// Alert feed component for provider view

import React, { useState, useEffect } from "react";
import { AlertCircle, Clock, User } from "lucide-react";
import { getAlertsForProvider } from "@/services/riskService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

const AlertFeed = ({ providerId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { providerId: currentProviderId } = useSessionIdentity();

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const providerAlerts = await getAlertsForProvider(providerId || currentProviderId);
        setAlerts(providerAlerts);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    if (providerId || currentProviderId) {
      loadAlerts();
      // Refresh every 30 seconds
      const interval = setInterval(loadAlerts, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [providerId, currentProviderId]);

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "at-risk":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "strained":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      default:
        return "text-white/70 bg-white/5 border-white/10";
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">Loading alerts...</div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/50">No active alerts</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">Active Alerts</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getRiskColor(alert.riskLevel)}`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium text-white">{alert.alias}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70 capitalize">
                    {alert.riskLevel}
                  </span>
                </div>
                {alert.emotionalLabel && (
                  <div className="text-xs text-white/70 mb-1">
                    {alert.emotionalLabel}
                  </div>
                )}
                {alert.messagePreview && (
                  <p className="text-sm text-white/80 line-clamp-2 mb-2">
                    {alert.messagePreview}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(alert.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertFeed;

