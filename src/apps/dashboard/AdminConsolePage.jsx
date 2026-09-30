// src/apps/dashboard/AdminConsolePage.jsx
// Updated with "Test Agent" button for Phase 1

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentsRegistry } from "../../hooks/useAgentsRegistry";
import { useAdminEvents } from "../../hooks/useAdminEvents";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { useRiskRadar } from "../../hooks/useRiskRadar";
import OfflineFallback from "../../components/OfflineFallback";
import { throttle } from "../../utils/rateLimiters";
import { useAdminConfigStore } from "../../stores/adminConfigStore";
import { useSystemSettingsStore } from "../../stores/systemSettingsStore";
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
  UserRoundCog,
} from "lucide-react";

// NEW IMPORT - this is the only new import we added
import callAgent from "../../ai/agents/agentClient";
import { loadAdminApplicationQueueCounts } from "@/services/adminReviewQueues";
import { getAdminAgentControls, setAdminAgentControl } from "@/services/adminAgentControls";
import EventItem from "./components/EventItem";
import { getFeatureSwitchPresentation } from "./featureSwitchCatalog";
import AdminNotificationPolicy from "./AdminNotificationPolicy";
import AdminReviewQueues from "./AdminReviewQueues";

const AdminConsolePage = () => {
  const navigate = useNavigate();

  // Filters state
  const [eventFilters, setEventFilters] = useState({
    agentId: null,
    eventType: null,
  });

  // NEW STATE for the Test Agent feature
  const [testAgentId, setTestAgentId] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [reviewQueueCounts, setReviewQueueCounts] = useState({ practitioner: null, communityGivers: null, meetingSources: null });
  const [systemSettingsStatus, setSystemSettingsStatus] = useState({ state: "loading", message: "Loading saved settings…" });
  const [agentControls, setAgentControls] = useState({
    loading: true,
    error: null,
    enabled: {},
    implementedAgentIds: [],
    savingAgentId: null,
    notice: "",
  });

  // Hooks
  const {
    agents,
    getHealthSummary,
  } = useAgentsRegistry();

  const availableTestAgents = React.useMemo(() => agents.filter((agent) => (
    agentControls.implementedAgentIds.includes(agent.id)
    && agentControls.enabled[agent.id] === true
  )), [agents, agentControls.enabled, agentControls.implementedAgentIds]);

  React.useEffect(() => {
    if (!availableTestAgents.some((agent) => agent.id === testAgentId)) {
      setTestAgentId(availableTestAgents[0]?.id || "");
    }
  }, [availableTestAgents, testAgentId]);

  const refreshAgentControls = React.useCallback(async () => {
    setAgentControls((current) => ({ ...current, loading: true, error: null, notice: "" }));
    try {
      const controls = await getAdminAgentControls();
      setAgentControls({
        loading: false,
        error: null,
        enabled: controls.enabled || {},
        implementedAgentIds: controls.implementedAgentIds || [],
        savingAgentId: null,
        notice: "",
      });
    } catch (error) {
      setAgentControls((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Agent controls could not be loaded.",
      }));
    }
  }, []);

  React.useEffect(() => {
    refreshAgentControls();
  }, [refreshAgentControls]);

  const handleAgentControlChange = async (agentId, enabled) => {
    setAgentControls((current) => ({ ...current, savingAgentId: agentId, error: null, notice: "" }));
    try {
      const result = await setAdminAgentControl(agentId, enabled);
      setAgentControls((current) => ({
        ...current,
        enabled: { ...current.enabled, [agentId]: result.enabled },
        savingAgentId: null,
        notice: `${agents.find((agent) => agent.id === agentId)?.name || agentId} ${result.enabled ? "enabled" : "paused"}. New calls use this setting.`,
      }));
    } catch (error) {
      setAgentControls((current) => ({
        ...current,
        savingAgentId: null,
        error: error?.message || "The agent setting was not changed.",
      }));
    }
  };

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents,
  } = useAdminEvents({
    limit: 100,
    agentId: eventFilters.agentId || undefined,
    eventType: eventFilters.eventType || undefined,
  });

  const {
    metrics,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics,
  } = useSystemMetrics();

  const {
    warningCount,
    criticalCount,
    totalEvents,
    topEventTypes,
    dailyCounts,
    enabled: riskRadarEnabled,
    loading: riskRadarLoading,
    error: riskRadarError,
    sampled: riskRadarSampled,
    refresh: refreshRiskRadar,
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
    loadFromRemote: loadSystemSettings,
    saveToRemote,
  } = useSystemSettingsStore();

  React.useEffect(() => {
    let active = true;
    loadSystemSettings()
      .then((result) => {
        if (active) setSystemSettingsStatus({
          state: result.hasSavedSettings ? "saved" : "pending",
          message: result.updatedAt
            ? `Saved settings loaded · updated ${new Date(result.updatedAt).toLocaleString()}`
            : "Default settings loaded · save to store them for all admin sessions.",
        });
      })
      .catch((error) => {
        if (active) setSystemSettingsStatus({ state: "error", message: error?.message || "Saved settings could not be loaded." });
      });
    return () => { active = false; };
  }, [loadSystemSettings]);

  // Throttled update functions for performance
  const throttledUpdateThreshold = React.useMemo(
    () => throttle((key, value) => updateThreshold(key, value), 200),
    [updateThreshold]
  );

  React.useEffect(() => {
    let active = true;
    loadAdminApplicationQueueCounts()
      .then((counts) => {
        if (active) setReviewQueueCounts({
          practitioner: Number.isInteger(counts.practitioner) ? counts.practitioner : null,
          communityGivers: Number.isInteger(counts.communityGivers) ? counts.communityGivers : null,
          meetingSources: Number.isInteger(counts.meetingSources) ? counts.meetingSources : null,
        });
      })
      .catch(() => { if (active) setReviewQueueCounts({ practitioner: null, communityGivers: null, meetingSources: null }); });
    return () => { active = false; };
  }, []);

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

  // NEW FUNCTION - This runs when you click "Test Agent"
  const handleTestAgent = async () => {
    if (agentControls.loading || agentControls.error || !availableTestAgents.some((agent) => agent.id === testAgentId)) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await callAgent(testAgentId, { test: true, timestamp: new Date().toISOString() });
      setTestResult(result);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/telemetry")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/[0.04] px-4 text-xs font-medium text-amber-100 hover:bg-amber-100/[0.09] transition-colors"
            >
              <Activity className="h-4 w-4" aria-hidden="true" />
              Support Activity
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Back to profile
            </button>
          </div>
        </header>

        <AdminReviewQueues
          practitionerCount={reviewQueueCounts.practitioner}
          giverCount={reviewQueueCounts.communityGivers}
          meetingSourceCount={reviewQueueCounts.meetingSources}
        />
        <section className="flex flex-col justify-between gap-3 rounded-2xl border border-sky-200/15 bg-sky-100/[0.025] p-4 sm:flex-row sm:items-center" aria-label="Workspace access management">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100/[0.08] text-sky-100"><UserRoundCog className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Workspace access</h2><p className="mt-0.5 text-xs text-muted-foreground">Find an account by email and grant the practitioner workspace for their service.</p></div></div>
          <button type="button" onClick={() => navigate("/admin/user-access")} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-sky-100/20 px-3 text-xs font-medium text-sky-50 hover:bg-sky-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-100">Manage workspace access</button>
        </section>

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

          {metricsError && (
            <div role="status" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              System metrics are unavailable: {metricsError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="lux-card p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Users
                </p>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {metricsLoading || metricsError || metrics.totalUsers == null ? "—" : metrics.totalUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                {metricsError ? "Activity unavailable" : `${metrics.activeUsers ?? "—"} active (24h)`}
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
                {metricsLoading || metricsError || metrics.totalSessions == null ? "—" : metrics.totalSessions}
              </p>
              <p className="text-xs text-muted-foreground">
                Total records
              </p>
            </div>

            <div className="lux-card p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Check-ins
                </p>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-semibold">
                {metricsLoading || metricsError || metrics.totalCheckins == null ? "—" : metrics.totalCheckins}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.checkinsLast7Days ?? "—"} saved in the last 7 days · counts only
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
                {metricsLoading || metricsError || metrics.agentExecutions == null ? "—" : metrics.agentExecutions}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.avgResponseTime == null ? "No measured runs yet" : `${metrics.avgResponseTime}ms average · recent sample`}
              </p>
            </div>

            <div className={`lux-card p-4 text-sm space-y-2 ${
              metrics.systemHealth === "degraded" ? "border-destructive/30" :
              metrics.systemHealth === "watch" ? "border-amber-400/30" :
              ""
            }`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Agent Run Health
                </p>
                {metrics.systemHealth === "healthy" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                )}
              </div>
              <p className={`text-2xl font-semibold ${
                metrics.systemHealth === "healthy" ? "text-emerald-400" :
                metrics.systemHealth === "watch" ? "text-amber-400" :
                metrics.systemHealth === "degraded" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {metricsLoading ? "—" : metrics.systemHealth === "not_measured" ? "Not measured" : metrics.systemHealth}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics.errorRate == null ? "No agent runs in latest sample" : `${metrics.errorRate}% error rate (latest sample)`}
              </p>
            </div>
          </div>
        </section>

        {/* Agents Overview */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Agents Overview
          </h2>

          {/* NEW: Quick Agent Test Section */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={testAgentId}
              onChange={(e) => setTestAgentId(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Select agent to test…</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id} disabled={!availableTestAgents.some((available) => available.id === a.id)}>
                  {a.name}{availableTestAgents.some((available) => available.id === a.id) ? " · Live and enabled" : agentControls.implementedAgentIds.includes(a.id) ? " · Paused" : " · No production handler"}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={refreshAgentControls}
              disabled={agentControls.loading || agentControls.savingAgentId !== null}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${agentControls.loading ? "animate-spin" : ""}`} />
              Refresh controls
            </button>

            <button
              type="button"
              onClick={handleTestAgent}
              disabled={agentControls.loading || Boolean(agentControls.error) || !availableTestAgents.some((agent) => agent.id === testAgentId) || testLoading}
              title={agentControls.error ? "Controls could not be verified, so testing is safely paused" : agentControls.loading ? "Checking server controls" : availableTestAgents.length ? "Send a diagnostic request to the selected live agent" : "No enabled production agent is available to test"}
              className="inline-flex items-center gap-2 rounded-md border border-amber-400/50 bg-amber-400/10 px-4 py-1.5 text-sm hover:bg-amber-400/20 disabled:opacity-50"
            >
              {testLoading ? "Calling…" : "Test Agent"}
            </button>

            {agentControls.loading && <span role="status" className="text-xs text-muted-foreground">Checking server controls…</span>}
            {agentControls.error && <span role="alert" className="text-xs text-destructive">{agentControls.error} Testing is paused until status can be verified.</span>}
            {!agentControls.loading && !agentControls.error && !availableTestAgents.length && (
              <span className="text-xs text-amber-200/75">No enabled production agent is available. Enable a supported agent below.</span>
            )}
            {agentControls.notice && <span role="status" className="text-xs text-emerald-300">{agentControls.notice}</span>}

            {testResult && (
              <div className="text-xs text-muted-foreground ml-2">
                {testResult.error ? (
                  <span className="text-destructive">Error: {testResult.error}</span>
                ) : (
                  <span>Response from {testResult.agentName} received</span>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {agents.map((agent) => {
              const Icon = agentIcons[agent.id] || Activity;
              const productionEnabled = agentControls.implementedAgentIds.includes(agent.id)
                && agentControls.enabled[agent.id] === true;
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
                    {productionEnabled ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <div className="col-span-2">
                      <p className="text-[10px] text-muted-foreground">Production implementation</p>
                      <p className={`text-xs font-semibold ${agentControls.implementedAgentIds.includes(agent.id) ? "text-emerald-400" : "text-amber-300"}`}>
                        {agentControls.implementedAgentIds.includes(agent.id) ? "Production handler available" : "Registered · no production handler"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Runs</p>
                      <p className="text-sm font-semibold">{agent.runCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Health</p>
                      <p className={`text-sm font-semibold ${
                        agent.health === "healthy" ? "text-emerald-400" :
                        agent.health === "degraded" ? "text-amber-400" :
                        agent.health === "unknown" ? "text-muted-foreground" : "text-destructive"
                      }`}>
                        {agent.health}
                      </p>
                    </div>
                  </div>

                  {agentControls.implementedAgentIds.includes(agent.id) && (
                    <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                      <div>
                        <p className="text-xs font-medium">Live system control</p>
                        <p className="text-[11px] text-muted-foreground">
                          {agentControls.loading ? "Checking server…" : agentControls.error ? "Unavailable · fail-closed" : agentControls.enabled[agent.id] ? "Enabled for new requests" : "Paused for new requests"}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={agentControls.enabled[agent.id] === true}
                        aria-label={`${agentControls.enabled[agent.id] ? "Pause" : "Enable"} ${agent.name}`}
                        disabled={agentControls.loading || Boolean(agentControls.error) || agentControls.savingAgentId !== null}
                        onClick={() => handleAgentControlChange(agent.id, agentControls.enabled[agent.id] !== true)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${agentControls.enabled[agent.id] ? "border-emerald-300/40 bg-emerald-400/25" : "border-border bg-muted"}`}
                      >
                        <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${agentControls.enabled[agent.id] ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Health Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            <div className="lux-card p-3 text-xs">
              <p className="text-muted-foreground">Not yet measured</p>
              <p className="text-lg font-semibold text-muted-foreground mt-1">{healthSummary.unknown}</p>
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
                  <option value="agent_execution">Agent execution</option>
                  <option value="agent_execution_error">Agent error</option>
                  <option value="risk_signal">Risk signal</option>
                </select>
              </div>
              <button type="button" onClick={refreshEvents} disabled={eventsLoading} className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60">
                <RefreshCw className={`h-3 w-3 ${eventsLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="lux-card p-4 max-h-[400px] overflow-y-auto space-y-2">
          {eventsLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Loading events...
            </p>
          ) : eventsError ? (
            <p role="status" className="text-sm text-destructive text-center py-8">Event stream unavailable: {eventsError}</p>
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
                Operational risk signals only. Private check-in content and identity are not shown here.
              </p>
            </div>
            {riskRadarEnabled && <button type="button" onClick={refreshRiskRadar} disabled={riskRadarLoading} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60">
              <RefreshCw className={`h-3.5 w-3.5 ${riskRadarLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>}
          </div>

          {!riskRadarEnabled ? (
            <div className="lux-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Risk Radar is paused</p>
                <p className="text-sm text-muted-foreground">Risk-signal summaries are hidden. System metrics and the agent event feed remain available.</p>
              </div>
              <button type="button" onClick={() => document.getElementById("system-feature-toggles")?.scrollIntoView({ behavior: "smooth", block: "center" })} className="min-h-10 shrink-0 rounded-full border border-border px-4 text-sm text-foreground hover:bg-muted">
                Review feature setting
              </button>
            </div>
          ) : riskRadarError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Error loading risk data: {riskRadarError}
            </div>
          )}

          {riskRadarEnabled && (riskRadarLoading ? (
            <div className="lux-card p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading risk data...</p>
            </div>
          ) : (
            <div className="space-y-4">
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

              {totalEvents === 0 && !riskRadarLoading && !riskRadarError && (
                <div className="lux-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No risk events in the last 7 days.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Risk signals will appear here as they are detected.
                  </p>
                </div>
              )}
              {riskRadarSampled && (
                <p className="text-xs text-muted-foreground">Summary is based on a sample of the latest 500 operational events in the 7-day window.</p>
              )}
            </div>
          ))}
        </section>

        {/* System Settings Module */}
        <section className="lux-section space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                System Settings
              </p>
              <p className="text-xs text-muted-foreground">
                Settings are account-wide and saved securely for administrators.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  setSystemSettingsStatus({ state: "saving", message: "Saving settings…" });
                  try {
                    await saveToRemote();
                    refreshRiskRadar();
                    setSystemSettingsStatus({ state: "saved", message: `Saved just now · ${new Date().toLocaleTimeString()}` });
                  } catch (error) {
                    setSystemSettingsStatus({ state: "error", message: error?.message || "Settings were not saved. Your edits are still on this page; try again." });
                  }
                }}
                disabled={systemSettingsStatus.state === "saving" || systemSettingsStatus.state === "loading"}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-300 hover:bg-amber-400/20 disabled:opacity-60 transition-colors"
              >
                <Save className="h-3 w-3" />
                Save to Firestore
              </button>
              <button
                type="button"
                onClick={() => {
                  resetSettings();
                  setSystemSettingsStatus({ state: "pending", message: "Defaults restored on this page. Save to apply them across admin sessions." });
                }}
                className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          </div>
          <p role="status" aria-live="polite" className={`text-xs ${systemSettingsStatus.state === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            {systemSettingsStatus.message}
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div id="system-feature-toggles" className="lux-card p-4 space-y-4 scroll-mt-8">
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
                    className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {getFeatureSwitchPresentation(feature).label}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {getFeatureSwitchPresentation(feature).description}
                      </p>
                    </div>
                    {getFeatureSwitchPresentation(feature).connected ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={getFeatureSwitchPresentation(feature).label}
                        title={`Turn ${enabled ? "off" : "on"} ${getFeatureSwitchPresentation(feature).label.toLowerCase()}`}
                        onClick={() => {
                          throttle(() => updateFeature(feature, !enabled), 150)();
                        }}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          enabled ? "bg-emerald-500" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                            enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground">
                        Not connected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

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

            <AdminNotificationPolicy
              notifications={systemSettings.notifications}
              onChange={updateNotificationRule}
            />
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
