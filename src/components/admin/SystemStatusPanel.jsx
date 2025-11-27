// src/components/admin/SystemStatusPanel.jsx
// System status panel for admin/provider monitoring

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { getEnvSummary } from "@/services/envInspector";
import { runAllHealthChecks } from "@/services/healthService";
import { getRecentLogs } from "@/services/logService";

const SystemStatusPanel = () => {
  const [envSummary, setEnvSummary] = useState(null);
  const [healthChecks, setHealthChecks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const summary = getEnvSummary();
      setEnvSummary(summary);

      const health = await runAllHealthChecks();
      setHealthChecks(health);
      setLastCheck(new Date().toISOString());

      // Get recent errors
      const logs = getRecentLogs(20);
      const errors = logs.filter(log => log.level === "error").slice(0, 5);
      setRecentErrors(errors);
    } catch (err) {
      console.error("Failed to load system status:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (ok, warning) => {
    if (ok && !warning) {
      return <CheckCircle2 className="h-4 w-4 text-green-400" />;
    }
    if (ok && warning) {
      return <AlertCircle className="h-4 w-4 text-amber-400" />;
    }
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  const getStatusText = (ok, warning) => {
    if (ok && !warning) return "OK";
    if (ok && warning) return "Degraded";
    return "Error";
  };

  const formatLatency = (latencyMs) => {
    if (!latencyMs) return "—";
    if (latencyMs < 1000) return `${latencyMs}ms`;
    return `${(latencyMs / 1000).toFixed(1)}s`;
  };

  if (loading && !healthChecks) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-wcGold" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Environment Summary */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-3">Environment</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Mode:</span>
            <span className="text-white">
              {envSummary?.buildMode || "unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60">Build ID:</span>
            <span className="text-white font-mono">
              {envSummary?.version?.frontendBuildId || "unknown"}
            </span>
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Core Services</h3>
          <button
            type="button"
            onClick={loadStatus}
            className="rounded p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          {healthChecks?.checks && Object.entries(healthChecks.checks).map(([service, check]) => (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.ok, check.warning)}
                <span className="text-xs font-medium text-white capitalize">
                  {service === "rapidapi" ? "RapidAPI" : service === "openai" ? "OpenAI" : service}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${
                  check.ok ? "text-green-400" : "text-red-400"
                }`}>
                  {getStatusText(check.ok, check.warning)}
                </span>
                {check.latencyMs !== null && (
                  <span className="text-xs text-white/40">
                    {formatLatency(check.latencyMs)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {lastCheck && (
          <p className="text-[10px] text-white/40 mt-3">
            Last check: {new Date(lastCheck).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <h3 className="text-sm font-medium text-red-400 mb-3">Recent Errors</h3>
          <div className="space-y-2">
            {recentErrors.map((error, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-medium">{error.scope}</span>
                  <span className="text-white/40">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white/60">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Health */}
      <div className={`rounded-lg border p-4 ${
        healthChecks?.healthy
          ? "border-green-500/20 bg-green-500/5"
          : "border-amber-500/20 bg-amber-500/5"
      }`}>
        <div className="flex items-center gap-2">
          {healthChecks?.healthy ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          )}
          <span className="text-sm font-medium text-white">
            System Status: {healthChecks?.healthy ? "Healthy" : "Degraded"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPanel;

