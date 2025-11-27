// src/apps/dashboard/AdminConsolePage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentsRegistry } from "../../hooks/useAgentsRegistry";
import { useAdminEvents } from "../../hooks/useAdminEvents";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { useRiskRadar } from "../../hooks/useRiskRadar";
import OfflineFallback from "../../components/OfflineFallback";
import { throttle } from "../../utils/rateLimiters";
import { useAdminConfigStore } from "../../stores/adminConfigStore";
import { batchAnalyzeClients } from "../../ai/predictive/predictiveRecoveryEngine";
import { useAllClientAssignments } from "../../hooks/useClientAssignments";
import { getRiskLevelColor } from "../../ai/predictive/predictiveConfig";
import { useSystemSettingsStore } from "../../stores/systemSettingsStore";
import {
  hasAdminSession,
  tryUnlockAdmin,
  logoutAdmin,
  getAdminKeyHint,
  setAdminKeyHint,
} from "../../services/adminAccess";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Database,
  Zap,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Shield,
  Compass,
  Flame,
  X,
  ToggleLeft,
  ToggleRight,
  Bell,
  Sliders,
  Save,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";

const AdminConsolePage = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(hasAdminSession());
  const [unlockKey, setUnlockKey] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);

  // Filters state
  const [eventFilters, setEventFilters] = useState({
    agentId: null,
    eventType: null,
  });

  // Hooks
  const {
    agents,
    getHealthSummary,
  } = useAgentsRegistry();

  const {
    events,
    loading: eventsLoading,
    clearEvents,
  } = useAdminEvents({
    limit: 100,
    agentId: eventFilters.agentId || undefined,
    eventType: eventFilters.eventType || undefined,
  });

  const {
    metrics,
    loading: metricsLoading,
    refresh: refreshMetrics,
  } = useSystemMetrics();

  const {
    warningCount,
    criticalCount,
    totalEvents,
    topEventTypes,
    dailyCounts,
    loading: riskRadarLoading,
    error: riskRadarError,
  } = useRiskRadar();

  const {
    config,
    updateConfig,
    resetConfig,
  } = useAdminConfigStore();

  const {
    settings: systemSettings,
    updateFeature,
    updateThreshold,
    updateNotificationRule,
    resetSettings,
    saveToRemote,
  } = useSystemSettingsStore();

  // Get all client assignments for population analysis
  const { assignments: allAssignments } = useAllClientAssignments();

  // Predictive Recovery population data
  const [prePopulationData, setPrePopulationData] = React.useState({
    loading: false,
    data: null,
    error: null,
  });

  // Throttled update functions for performance
  const throttledUpdateThreshold = React.useMemo(
    () => throttle((key, value) => updateThreshold(key, value), 200),
    [updateThreshold]
  );

  // Load population-level PRE analysis
  const loadPopulationAnalysis = React.useCallback(async () => {
    if (!allAssignments || allAssignments.length === 0) {
      return;
    }

    setPrePopulationData({ loading: true, data: null, error: null });

    try {
      const clientIds = allAssignments
        .slice(0, 20) // Limit to 20 clients for performance
        .map((a) => a.clientId)
        .filter((id) => id);

      const results = await batchAnalyzeClients(clientIds, { days: 7 });

      // Aggregate by risk level
      const riskLevelCounts = {
        low: 0,
        moderate: 0,
        high: 0,
        insufficient_data: 0,
      };

      const highRiskClients = [];

      results.forEach((result) => {
        if (result.riskLevel) {
          riskLevelCounts[result.riskLevel] = (riskLevelCounts[result.riskLevel] || 0) + 1;
        }

        if (result.riskLevel === "high" && result.riskScore !== null) {
          highRiskClients.push({
            clientId: result.clientId,
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            weeklySummary: result.weeklySummary,
          });
        }
      });

      // Sort high-risk clients by score
      highRiskClients.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

      setPrePopulationData({
        loading: false,
        data: {
          riskLevelCounts,
          highRiskClients: highRiskClients.slice(0, 5), // Top 5
          totalAnalyzed: results.length,
        },
        error: null,
      });
    } catch (err) {
      console.warn("Population analysis failed (non-critical):", err.message);
      setPrePopulationData({
        loading: false,
        data: null,
        error: err.message,
      });
    }
  }, [allAssignments]);

  // Load on mount or when assignments change
  React.useEffect(() => {
    if (allAssignments && allAssignments.length > 0) {
      loadPopulationAnalysis();
    }
  }, [allAssignments, loadPopulationAnalysis]);

  // Map store properties to component variables
  const heroEyebrow = config.homeHeroEyebrow;
  const heroHeadline = config.homeHeroHeadline;
  const heroBody = config.homeHeroBody;
  const heroPrimaryLabel = config.homeHeroPrimaryCta;
  const heroSecondaryLabel = config.homeHeroSecondaryCta;
  const recoverySubtitle = config.recoverySubtitle;
  const toolsSubtitle = config.toolsSubtitle;
  const providersSubtitle = config.providersSubtitle;
  const dashboardSubtitle = config.dashboardSubtitle;

  const healthSummary = getHealthSummary();

  // Agent icons mapping
  const agentIcons = {
    seer: Eye,
    oracle: Flame,
    overseer: Compass,
    sentinel: Shield,
    cherubim: Shield,
    healer_breathwork: Activity,
    healer_grounding: Activity,
    healer_mindfulness: Activity,
    healer_spiritual: Activity,
    healer_acuwellness: Activity,
    towncrier: Bell,
  };

  function handleLogout() {
    logoutAdmin();
    setIsAdmin(false);
    setUnlockKey("");
    setUnlockError("");
  }

  async function handleUnlock(e) {
    e.preventDefault();
    setUnlockError("");
    setUnlockBusy(true);
    try {
      const result = tryUnlockAdmin(unlockKey);
      if (!result.ok) {
        setUnlockError(result.message || "That key didn't work.");
        return;
      }
      setIsAdmin(true);
      if (!getAdminKeyHint()) {
        setAdminKeyHint("Master admin key set on this device");
      }
    } finally {
      setUnlockBusy(false);
    }
  }

  // 🔒 If not admin, show unlock screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Restricted area
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              WellnessCafe Admin Console
            </h1>
            <p className="text-sm text-muted-foreground">
              This space is for the builder and trusted admins. If you don't
              have an admin key, you can safely go back to the main OS.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Admin access key
              </label>
              <input
                type="password"
                value={unlockKey}
                onChange={(e) => setUnlockKey(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter your key"
              />
              {unlockError && (
                <p className="text-xs text-destructive mt-1">{unlockError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={unlockBusy || !unlockKey.trim()}
              className="w-full inline-flex items-center justify-center rounded-md bg-foreground text-background text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60 transition-colors"
            >
              {unlockBusy ? "Verifying…" : "Unlock console"}
            </button>
          </form>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Tip: use a strong key and keep it private. You can change the
              master key later via your Vite environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Admin view
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Admin · God-Eye
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              WellnessCafe OS Console
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Watch how the OS is being used, monitor agents, and keep the system safe, honest, and healing.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Sign out of admin
            </button>
            <p className="text-[11px] text-muted-foreground">
              {getAdminKeyHint() || "Admin session active on this device"}
            </p>
          </div>
        </header>

        {/* System Metrics */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              System Metrics
            </h2>
            <button
              type="button"
              onClick={refreshMetrics}
              disabled={metricsLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${metricsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="lux-card p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Users
                </p>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {metricsLoading ? "—" : metrics.totalUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.activeUsers} active (24h)
              </p>
            </div>

            <div className="lux-card p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sessions
                </p>
                <Database className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {metricsLoading ? "—" : metrics.totalSessions}
              </p>
              <p className="text-xs text-muted-foreground">
                Total created
              </p>
            </div>

            <div className="lux-card p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Agent Executions
                </p>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {metricsLoading ? "—" : metrics.agentExecutions}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.avgResponseTime}ms avg
              </p>
            </div>

            <div className={`lux-card p-4 text-sm space-y-2 ${
              metrics.systemHealth === "down" ? "border-destructive/30" :
              metrics.systemHealth === "degraded" ? "border-amber-400/30" :
              ""
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  System Health
                </p>
                {metrics.systemHealth === "healthy" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <p className={`text-2xl font-semibold ${
                metrics.systemHealth === "healthy" ? "text-emerald-400" :
                metrics.systemHealth === "degraded" ? "text-amber-400" :
                "text-destructive"
              }`}>
                {metricsLoading ? "—" : metrics.systemHealth}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.errorRate}% error rate
              </p>
            </div>
          </div>
        </section>

        {/* Agents Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Agents Overview
            </h2>
            <a
              href="/admin/overseer"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-300 hover:bg-amber-400/20 transition-colors"
            >
              Overseer Console →
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {agents.map((agent) => {
              const Icon = agentIcons[agent.id] || Activity;
              return (
                <div
                  key={agent.id}
                  className={`lux-card p-4 space-y-2 ${
                    agent.health === "down" ? "border-destructive/30" :
                    agent.health === "degraded" ? "border-amber-400/30" :
                    ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-lg ${
                      agent.status === "active" ? "bg-amber-400/10" : "bg-muted"
                    }`}>
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {agent.role}
                      </p>
                    </div>
                    {agent.status === "active" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Runs</p>
                      <p className="text-sm font-semibold">{agent.runCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Health</p>
                      <p className={`text-sm font-semibold ${
                        agent.health === "healthy" ? "text-emerald-400" :
                        agent.health === "degraded" ? "text-amber-400" :
                        "text-destructive"
                      }`}>
                        {agent.health}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Health Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="lux-card p-3 text-xs">
              <p className="text-muted-foreground">Total Agents</p>
              <p className="text-lg font-semibold mt-1">{healthSummary.total}</p>
            </div>
            <div className="lux-card p-3 text-xs">
              <p className="text-muted-foreground">Healthy</p>
              <p className="text-lg font-semibold text-emerald-400 mt-1">
                {healthSummary.healthy}
              </p>
            </div>
            <div className="lux-card p-3 text-xs">
              <p className="text-muted-foreground">Degraded</p>
              <p className="text-lg font-semibold text-amber-400 mt-1">
                {healthSummary.degraded}
              </p>
            </div>
            <div className="lux-card p-3 text-xs">
              <p className="text-muted-foreground">Down</p>
              <p className="text-lg font-semibold text-destructive mt-1">
                {healthSummary.down}
              </p>
            </div>
          </div>
        </section>

        {/* Live Event Stream */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Live Event Stream
            </h2>
            <div className="flex items-center gap-2">
              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={eventFilters.agentId || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      agentId: e.target.value || null,
                    })
                  }
                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Agents</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <select
                  value={eventFilters.eventType || ""}
                  onChange={(e) =>
                    setEventFilters({
                      ...eventFilters,
                      eventType: e.target.value || null,
                    })
                  }
                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Types</option>
                  <option value="execution">Execution</option>
                  <option value="error">Error</option>
                  <option value="status_change">Status Change</option>
                </select>
              </div>
              <button
                type="button"
                onClick={clearEvents}
                className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="lux-card p-4 max-h-[400px] overflow-y-auto space-y-2">
          {eventsLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-muted-foreground">
                No events yet.
              </p>
              <p className="text-[10px] text-muted-foreground">
                Agent executions and risk signals will appear here as they occur.
              </p>
            </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="scroll-snap-item">
                  <EventItem event={event} agents={agents} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Risk Radar */}
        <section className="lux-section space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Risk Radar
              </p>
              <p className="text-xs text-muted-foreground">
                Overview of risk signals and emotional patterns (last 7 days).
              </p>
            </div>
          </div>

          {riskRadarError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Error loading risk data: {riskRadarError}
            </div>
          )}

          {riskRadarLoading ? (
            <div className="lux-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading risk data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="lux-card p-4 flex flex-col items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mb-2" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Warning Events
                  </p>
                  <p className="text-2xl font-semibold mt-1">{warningCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </div>
                <div className="lux-card p-4 flex flex-col items-start">
                  <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Critical Events
                  </p>
                  <p className="text-2xl font-semibold mt-1">{criticalCount}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </div>
                <div className="lux-card p-4 flex flex-col items-start">
                  <Activity className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Total Events
                  </p>
                  <p className="text-2xl font-semibold mt-1">{totalEvents}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Last 7 days
                  </p>
                </div>
              </div>

              {/* Top Event Types */}
              {topEventTypes.length > 0 && (
                <div className="lux-card p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Top Event Types
                  </h3>
                  <div className="space-y-2">
                    {topEventTypes.map(({ type, count }, idx) => (
                      <div
                        key={type}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-6">
                            #{idx + 1}
                          </span>
                          <span className="text-xs text-foreground capitalize">
                            {type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Trend */}
              {dailyCounts.length > 0 && (
                <div className="lux-card p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Daily Trend
                  </h3>
                  <div className="space-y-2">
                    {dailyCounts.map(({ date, count, label }) => {
                      const maxCount = Math.max(
                        ...dailyCounts.map((d) => d.count),
                        1
                      );
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={date} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium text-foreground">
                              {count}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {totalEvents === 0 && !riskRadarLoading && (
                <div className="lux-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No risk events in the last 7 days.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Risk signals will appear here as they are detected.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Predictive Recovery Overview */}
        <section className="lux-section space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Predictive Recovery Overview
              </p>
              <p className="text-xs text-muted-foreground">
                Population-level recovery risk analysis based on this week's patterns.
              </p>
            </div>
            <button
              type="button"
              onClick={loadPopulationAnalysis}
              disabled={prePopulationData.loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${prePopulationData.loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {prePopulationData.loading ? (
            <div className="lux-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Analyzing recovery patterns...</p>
            </div>
          ) : prePopulationData.error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Error loading analysis: {prePopulationData.error}
            </div>
          ) : prePopulationData.data ? (
            <div className="space-y-4">
              {/* Risk Level Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className={`lux-card p-4 flex flex-col items-start ${getRiskLevelColor("low").split(" ")[2]}`}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Low Risk
                  </p>
                  <p className="text-2xl font-semibold mt-1">{prePopulationData.data.riskLevelCounts.low || 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">clients</p>
                </div>
                <div className={`lux-card p-4 flex flex-col items-start ${getRiskLevelColor("moderate").split(" ")[2]}`}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Moderate Risk
                  </p>
                  <p className="text-2xl font-semibold mt-1">{prePopulationData.data.riskLevelCounts.moderate || 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">clients</p>
                </div>
                <div className={`lux-card p-4 flex flex-col items-start ${getRiskLevelColor("high").split(" ")[2]}`}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    High Risk
                  </p>
                  <p className="text-2xl font-semibold mt-1">{prePopulationData.data.riskLevelCounts.high || 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">clients</p>
                </div>
                <div className="lux-card p-4 flex flex-col items-start">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Insufficient Data
                  </p>
                  <p className="text-2xl font-semibold mt-1">{prePopulationData.data.riskLevelCounts.insufficient_data || 0}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">clients</p>
                </div>
              </div>

              {/* Top High-Risk Clients */}
              {prePopulationData.data.highRiskClients.length > 0 && (
                <div className="lux-card p-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Highest Risk Clients (Top 5)
                  </h3>
                  <div className="space-y-2">
                    {prePopulationData.data.highRiskClients.map((client) => (
                      <div
                        key={client.clientId}
                        className="flex items-center justify-between p-2 rounded-md border border-destructive/30 bg-destructive/5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-foreground">
                            Client: {client.clientId.slice(0, 8)}...
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {client.weeklySummary?.title || "Increased Support Needed"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-destructive">
                            {Math.round(client.riskScore || 0)}/100
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(`/providers/clients/${client.clientId}`)}
                            className="flex-shrink-0 h-7 w-7 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
                          >
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {prePopulationData.data.totalAnalyzed === 0 && (
                <div className="lux-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No client data available for analysis.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="lux-card p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Click "Refresh" to load predictive recovery analysis.
              </p>
            </div>
          )}
        </section>

        {/* System Settings Module */}
        <section className="lux-section space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                System Settings
              </p>
              <p className="text-xs text-muted-foreground">
                Configure feature toggles, risk thresholds, and notification rules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await saveToRemote();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-300 hover:bg-amber-400/20 transition-colors"
              >
                <Save className="h-3 w-3" />
                Save to Firestore
              </button>
              <button
                type="button"
                onClick={resetSettings}
                className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature Toggles */}
            <div className="lux-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Feature Toggles
                </h3>
              </div>
              <div className="space-y-3">
                {Object.entries(systemSettings.features).map(([feature, enabled]) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between gap-3"
                  >
                    <label className="text-xs text-foreground flex-1">
                      {feature
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        // Throttle feature updates for performance
                        throttle(() => updateFeature(feature, !enabled), 150)();
                      }}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        enabled ? "bg-emerald-500" : "bg-muted"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Threshold Sliders */}
            <div className="lux-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Risk Thresholds
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-foreground">Low Risk</label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {systemSettings.thresholds.riskLevelLow}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={systemSettings.thresholds.riskLevelLow}
                    onChange={(e) =>
                      updateThreshold("riskLevelLow", parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-foreground">Medium Risk</label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {systemSettings.thresholds.riskLevelMedium}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={systemSettings.thresholds.riskLevelMedium}
                    onChange={(e) =>
                      updateThreshold("riskLevelMedium", parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-foreground">High Risk</label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {systemSettings.thresholds.riskLevelHigh}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={systemSettings.thresholds.riskLevelHigh}
                    onChange={(e) =>
                      throttledUpdateThreshold("riskLevelHigh", parseInt(e.target.value, 10))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-foreground">Error Rate Threshold</label>
                    <span className="text-xs font-mono text-muted-foreground">
                      {(systemSettings.thresholds.errorRateThreshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={systemSettings.thresholds.errorRateThreshold}
                    onChange={(e) =>
                      updateThreshold("errorRateThreshold", parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Notification Rules (Towncrier) */}
            <div className="lux-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notification Rules
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-foreground">Notifications Enabled</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationRule("enabled", !systemSettings.notifications.enabled)
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      systemSettings.notifications.enabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                        systemSettings.notifications.enabled
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-foreground">Risk Alerts</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationRule(
                        "riskAlerts",
                        !systemSettings.notifications.riskAlerts
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      systemSettings.notifications.riskAlerts ? "bg-emerald-500" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                        systemSettings.notifications.riskAlerts
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-foreground">Session Reminders</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationRule(
                        "sessionReminders",
                        !systemSettings.notifications.sessionReminders
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      systemSettings.notifications.sessionReminders
                        ? "bg-emerald-500"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                        systemSettings.notifications.sessionReminders
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-foreground">Streak Milestones</label>
                  <button
                    type="button"
                    onClick={() =>
                      updateNotificationRule(
                        "streakMilestones",
                        !systemSettings.notifications.streakMilestones
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      systemSettings.notifications.streakMilestones
                        ? "bg-emerald-500"
                        : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                        systemSettings.notifications.streakMilestones
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <label className="block text-xs text-foreground mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={systemSettings.notifications.frequency}
                    onChange={(e) =>
                      updateNotificationRule("frequency", e.target.value)
                    }
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-foreground">Quiet Hours</label>
                    <button
                      type="button"
                      onClick={() =>
                        updateNotificationRule("quietHours", {
                          ...systemSettings.notifications.quietHours,
                          enabled:
                            !systemSettings.notifications.quietHours.enabled,
                        })
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        systemSettings.notifications.quietHours.enabled
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                          systemSettings.notifications.quietHours.enabled
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  {systemSettings.notifications.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Start</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={systemSettings.notifications.quietHours.start}
                          onChange={(e) =>
                            updateNotificationRule("quietHours", {
                              ...systemSettings.notifications.quietHours,
                              start: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">End</label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={systemSettings.notifications.quietHours.end}
                          onChange={(e) =>
                            updateNotificationRule("quietHours", {
                              ...systemSettings.notifications.quietHours,
                              end: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content controls */}
        <section className="lux-section space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Words the world sees
              </p>
              <p className="text-xs text-muted-foreground">
                Tune the language on the Home page hero and core tiles.
              </p>
            </div>
            <button
              type="button"
              onClick={resetConfig}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Reset all text to defaults
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-sm">
            {/* Hero text config */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Hero eyebrow
                </label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) =>
                    updateConfig({ homeHeroEyebrow: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Hero headline
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) =>
                    updateConfig({ homeHeroHeadline: e.target.value })
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Hero body
                </label>
                <textarea
                  rows={3}
                  value={heroBody}
                  onChange={(e) => updateConfig({ homeHeroBody: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Hero buttons + card subtitles */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Primary button label
                  </label>
                  <input
                    type="text"
                    value={heroPrimaryLabel}
                    onChange={(e) =>
                      updateConfig({ homeHeroPrimaryCta: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Secondary button label
                  </label>
                  <input
                    type="text"
                    value={heroSecondaryLabel}
                    onChange={(e) =>
                      updateConfig({ homeHeroSecondaryCta: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Recovery tile subtitle
                  </label>
                  <input
                    type="text"
                    value={recoverySubtitle}
                    onChange={(e) =>
                      updateConfig({ recoverySubtitle: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tools tile subtitle
                  </label>
                  <input
                    type="text"
                    value={toolsSubtitle}
                    onChange={(e) =>
                      updateConfig({ toolsSubtitle: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Providers tile subtitle
                  </label>
                  <input
                    type="text"
                    value={providersSubtitle}
                    onChange={(e) =>
                      updateConfig({ providersSubtitle: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Dashboard tile subtitle
                  </label>
                  <input
                    type="text"
                    value={dashboardSubtitle}
                    onChange={(e) =>
                      updateConfig({ dashboardSubtitle: e.target.value })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminConsolePage;
