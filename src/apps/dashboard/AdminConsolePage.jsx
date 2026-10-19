// src/apps/dashboard/AdminConsolePage.jsx
// Updated with "Test Agent" button for Phase 1

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgentsRegistry } from "../../hooks/useAgentsRegistry";
import { useAdminEvents } from "../../hooks/useAdminEvents";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { useRiskRadar } from "../../hooks/useRiskRadar";
import { useAdminClaim } from "@/hooks/useAdminClaim";
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
  MapPin,
  Wind,
  ScanHeart,
  UsersRound,
  Sprout,
  Sliders,
  Save,
  AlertTriangle,
  TrendingDown,
  UserRoundCog,
  Download,
  CircleDot,
  LayoutDashboard,
  ClipboardList,
  Bot,
  Radio,
  Siren,
  Settings2,
} from "lucide-react";

// NEW IMPORT - this is the only new import we added
import callAgent from "../../ai/agents/agentClient";
import { loadAdminApplicationQueueCounts } from "@/services/adminReviewQueues";
import { getAdminAgentControls, setAdminAgentControl } from "@/services/adminAgentControls";
import EventItem from "./components/EventItem";
import { getFeatureSwitchPresentation } from "./featureSwitchCatalog";
import AdminNotificationPolicy from "./AdminNotificationPolicy";
import AdminReviewQueues from "./AdminReviewQueues";
import PrivateFriendGroupReportsQueue from "./PrivateFriendGroupReportsQueue";
import { INTELLIGENCE_AGENTS, getAgentControlId } from "../../ai/agents/agentRegistry";
import { buildAgentSmokeTestPlan, canRunAdminAgentSmokeTest } from "./agentSmokeTest";
import { AgentHealthBar, AgentReadinessMeter, MemberBaseVisual, RiskSeverityMeter, RiskTrendChart, RingMeter } from "./components/ConsoleVisuals";
import "./components/GodEyeVisuals.css";

function presentAdminServiceError(error, fallback) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || error || "");
  if (code.includes("unauthenticated") || /^unauthenticated$/i.test(message)) {
    return "The server could not verify this admin session. Refresh access and try again.";
  }
  if (code.includes("permission-denied") || /permission denied/i.test(message)) {
    return "This admin assignment does not include permission for this service.";
  }
  return message || fallback;
}

const AdminConsolePage = () => {
  const navigate = useNavigate();
  const { refreshClaims } = useAdminClaim();

  // Filters state
  const [eventFilters, setEventFilters] = useState({
    agentId: null,
    eventType: null,
  });

  // NEW STATE for the Test Agent feature
  const [testAgentId, setTestAgentId] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [pulseAssessment, setPulseAssessment] = useState(null);
  const [pulseAssessmentError, setPulseAssessmentError] = useState("");
  const [pulseAssessmentLoading, setPulseAssessmentLoading] = useState(false);
  const [seerAssessment, setSeerAssessment] = useState(null);
  const [seerAssessmentError, setSeerAssessmentError] = useState("");
  const [seerAssessmentLoading, setSeerAssessmentLoading] = useState(false);
  const [overseerGoal, setOverseerGoal] = useState("agent-health");
  const [overseerPlan, setOverseerPlan] = useState(null);
  const [overseerPlanError, setOverseerPlanError] = useState("");
  const [overseerPlanLoading, setOverseerPlanLoading] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("overview");
  const [activeSettingsTab, setActiveSettingsTab] = useState("features");
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const agentDetailsOpenerRef = React.useRef(null);
  const agentDetailsCloseRef = React.useRef(null);
  const [reviewQueueCounts, setReviewQueueCounts] = useState({ practitioner: null, communityGivers: null, meetingSources: null });
  const [refreshingAll, setRefreshingAll] = useState(false);
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
    error: agentMetricsError,
  } = useAgentsRegistry();

  const availableTestAgents = React.useMemo(() => agents.filter((agent) => {
    const controlId = getAgentControlId(agent);
    return canRunAdminAgentSmokeTest(agent.id)
      && controlId
      && agentControls.implementedAgentIds.includes(controlId)
      && agentControls.enabled[controlId] === true;
  }), [agents, agentControls.enabled, agentControls.implementedAgentIds]);

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
        error: presentAdminServiceError(error, "Agent controls could not be loaded."),
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
        notice: `${agents.find((agent) => getAgentControlId(agent) === agentId)?.name || agentId} ${result.enabled ? "enabled" : "paused"}. New calls use this setting.`,
      }));
    } catch (error) {
      setAgentControls((current) => ({
        ...current,
        savingAgentId: null,
        error: presentAdminServiceError(error, "The agent setting was not changed."),
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
    snapshotAt,
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
        if (active) setSystemSettingsStatus({ state: "error", message: presentAdminServiceError(error, "Saved settings could not be loaded.") });
      });
    return () => { active = false; };
  }, [loadSystemSettings]);

  // Throttled update functions for performance
  const throttledUpdateThreshold = React.useMemo(
    () => throttle((key, value) => updateThreshold(key, value), 200),
    [updateThreshold]
  );

  const refreshReviewQueueCounts = React.useCallback(async () => {
    try {
      const counts = await loadAdminApplicationQueueCounts();
      setReviewQueueCounts({
        practitioner: Number.isInteger(counts.practitioner) ? counts.practitioner : null,
        communityGivers: Number.isInteger(counts.communityGivers) ? counts.communityGivers : null,
        meetingSources: Number.isInteger(counts.meetingSources) ? counts.meetingSources : null,
      });
    } catch {
      setReviewQueueCounts({ practitioner: null, communityGivers: null, meetingSources: null });
    }
  }, []);

  React.useEffect(() => {
    refreshReviewQueueCounts();
  }, [refreshReviewQueueCounts]);

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
  const knownQueueCounts = Object.values(reviewQueueCounts);
  const pendingReviewCount = knownQueueCounts.every(Number.isInteger)
    ? knownQueueCounts.reduce((total, count) => total + count, 0)
    : null;
  const enabledProductionAgentCount = INTELLIGENCE_AGENTS
    .filter((agent) => agent.readiness === "implemented" && agent.handlerId
      && agentControls.implementedAgentIds.includes(agent.handlerId)
      && agentControls.enabled[agent.handlerId] === true).length;
  const implementedCatalogHandlerCount = INTELLIGENCE_AGENTS
    .filter((agent) => agent.readiness === "implemented" && agent.handlerId
      && agentControls.implementedAgentIds.includes(agent.handlerId)).length;
  const observedExecutionSuccess = metrics.systemHealth !== "not_measured" && Number.isFinite(metrics.errorRate)
    ? Math.max(0, 100 - metrics.errorRate)
    : null;
  const maxRecentRuns = Math.max(...agents.map((candidate) => Number(candidate.runCount) || 0), 0);
  const snapshotTime = snapshotAt ? new Date(snapshotAt) : null;
  const snapshotAgeSeconds = snapshotTime && Number.isFinite(snapshotTime.getTime())
    ? Math.max(0, Math.floor((Date.now() - snapshotTime.getTime()) / 1000))
    : null;
  const settingsUnavailable = systemSettingsStatus.state === "error";
  const adminServiceErrors = [metricsError, eventsError, riskRadarError, agentControls.error, settingsUnavailable ? systemSettingsStatus.message : null].filter(Boolean);
  const hasAdminServiceErrors = adminServiceErrors.length > 0;
  const adminSessionRejected = adminServiceErrors.some((message) => /unauthenticated|sign in with an administrator/i.test(String(message)));

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    refreshEvents();
    refreshRiskRadar();
    const refreshSettings = loadSystemSettings()
      .then((result) => setSystemSettingsStatus({
        state: result.hasSavedSettings ? "saved" : "pending",
        message: result.updatedAt
          ? `Saved settings loaded · updated ${new Date(result.updatedAt).toLocaleString()}`
          : "Default settings loaded · save to store them for all admin sessions.",
      }))
      .catch((error) => setSystemSettingsStatus({ state: "error", message: presentAdminServiceError(error, "Saved settings could not be loaded.") }));
    try {
      await Promise.allSettled([refreshMetrics(), refreshAgentControls(), refreshReviewQueueCounts(), refreshSettings]);
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleExportReport = () => {
    const report = {
      reportType: "wellnesscafe-admin-operational-summary",
      exportedAt: new Date().toISOString(),
      snapshotAt: snapshotAt || null,
      privacyNote: "Aggregate operational data only. No member identities, private reflections, or event payloads are included.",
      metrics: {
        totalUsers: metrics.totalUsers,
        activeUsers24h: metrics.activeUsers,
        totalSessions: metrics.totalSessions,
        totalCheckins: metrics.totalCheckins,
        checkinsLast7Days: metrics.checkinsLast7Days,
        agentExecutions: metrics.agentExecutions,
        agentRunHealth: metrics.systemHealth,
        errorRatePercent: metrics.errorRate,
        avgResponseTimeMs: metrics.avgResponseTime,
      },
      agents: {
        registered: agents.length,
        productionHandlers: agentControls.error ? null : implementedCatalogHandlerCount,
        enabledProductionHandlers: agentControls.error ? null : enabledProductionAgentCount,
        partialHandlers: agentControls.error ? null : INTELLIGENCE_AGENTS.filter((agent) => agent.readiness === "partial"
          && agent.handlerId && agentControls.implementedAgentIds.includes(agent.handlerId)).length,
      },
      riskSignals: riskRadarError
        ? { state: "unavailable" }
        : riskRadarEnabled ? { warningCount, criticalCount, totalEvents, window: "7 days" } : { state: "paused" },
      reviewQueues: {
        practitioner: reviewQueueCounts.practitioner,
        communityGivers: reviewQueueCounts.communityGivers,
        meetingSources: reviewQueueCounts.meetingSources,
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `wellnesscafe-operations-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };
  const selectedAgent = selectedAgentId
    ? agents.find((agent) => agent.id === selectedAgentId)
    : null;
  const selectedAgentDefinition = selectedAgentId
    ? INTELLIGENCE_AGENTS.find((agent) => agent.id === selectedAgentId)
    : null;
  const selectedAgentControlId = getAgentControlId(selectedAgentDefinition);

  React.useEffect(() => {
    if (!selectedAgentId) return undefined;
    agentDetailsCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setSelectedAgentId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      agentDetailsOpenerRef.current?.focus();
    };
  }, [selectedAgentId]);

  const agentIcons = {
    seer: Eye,
    oracle: Flame,
    overseer: Compass,
    sentinel: Shield,
    anchor: MapPin,
    breathkeeper: Wind,
    mirror: ScanHeart,
    shepherd: UsersRound,
    compass: Compass,
    gardener: Sprout,
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
      const smokePlan = buildAgentSmokeTestPlan(testAgentId, {
        snapshotAgeSeconds,
        agentExecutions: metrics.agentExecutions,
        errorRatePercent: metrics.errorRate,
        avgResponseTimeMs: metrics.avgResponseTime,
        systemHealth: metrics.systemHealth,
        enabledHandlers: enabledProductionAgentCount,
        implementedHandlers: implementedCatalogHandlerCount,
        riskSignals: {
          state: riskRadarError ? "unavailable" : riskRadarEnabled ? "available" : "paused",
          warningCount: riskRadarError || !riskRadarEnabled ? null : warningCount,
          criticalCount: riskRadarError || !riskRadarEnabled ? null : criticalCount,
          totalEvents: riskRadarError || !riskRadarEnabled ? null : totalEvents,
        },
        reviewQueues: {
          practitioner: reviewQueueCounts.practitioner,
          communityGivers: reviewQueueCounts.communityGivers,
          meetingSources: reviewQueueCounts.meetingSources,
        },
      });
      if (!smokePlan) throw new Error("This agent can only be tested from its authorized client workflow.");
      const result = await callAgent(smokePlan.agentId, smokePlan.payload);
      setTestResult(result);
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const handlePulseAssessment = async () => {
    if (pulseAssessmentLoading || metricsLoading || metricsError || agentControls.loading || agentControls.error
      || !agentControls.implementedAgentIds.includes("pulse") || agentControls.enabled.pulse !== true) return;
    setPulseAssessmentLoading(true);
    setPulseAssessment(null);
    setPulseAssessmentError("");
    try {
      const response = await callAgent("pulse", {
        metrics: {
          systemHealth: metrics.systemHealth,
          agentExecutions: metrics.agentExecutions,
          errorRate: metrics.errorRate,
          avgResponseTime: metrics.avgResponseTime,
        },
        snapshotAgeSeconds,
      });
      const result = response.result || response;
      if (typeof result.summary !== "string" || typeof result.healthStatus !== "string" || typeof result.nextCheck !== "string") {
        throw new Error("Pulse returned an incomplete operations summary. Refresh the snapshot and try again.");
      }
      setPulseAssessment({
        summary: result.summary,
        healthStatus: result.healthStatus,
        observations: Array.isArray(result.observations) ? result.observations.filter((item) => typeof item === "string").slice(0, 3) : [],
        nextCheck: result.nextCheck,
      });
    } catch (error) {
      setPulseAssessmentError(presentAdminServiceError(error, "Pulse could not assess this operations snapshot."));
    } finally {
      setPulseAssessmentLoading(false);
    }
  };

  const handleSeerAssessment = async () => {
    if (seerAssessmentLoading || metricsLoading || metricsError || agentControls.loading || agentControls.error
      || !agentControls.implementedAgentIds.includes("seer") || agentControls.enabled.seer !== true) return;
    setSeerAssessmentLoading(true);
    setSeerAssessment(null);
    setSeerAssessmentError("");
    try {
      const response = await callAgent("seer", {
        telemetry: {
          snapshotAgeSeconds,
          agentExecutions: metrics.agentExecutions,
          errorRatePercent: metrics.errorRate,
          avgResponseTimeMs: metrics.avgResponseTime,
          activeUsers24h: metrics.activeUsers,
          checkinsLast7Days: metrics.checkinsLast7Days,
          riskSignals: {
            state: riskRadarError ? "unavailable" : riskRadarEnabled ? "available" : "paused",
            warningCount: riskRadarError || !riskRadarEnabled ? null : warningCount,
            criticalCount: riskRadarError || !riskRadarEnabled ? null : criticalCount,
            totalEvents: riskRadarError || !riskRadarEnabled ? null : totalEvents,
            dailyCounts: riskRadarError || !riskRadarEnabled ? [] : dailyCounts,
          },
        },
        question: "Describe the evidence-backed operational patterns, data limitations, and one useful admin follow-up.",
      });
      const result = response.result || response;
      if (typeof result.summary !== "string" || !Array.isArray(result.insights)) {
        throw new Error("Seer returned an incomplete trend review. Refresh the snapshot and try again.");
      }
      setSeerAssessment({
        summary: result.summary,
        insights: result.insights.filter((item) => typeof item === "string").slice(0, 3),
        nextCheck: typeof result.nextCheck === "string" ? result.nextCheck : "No additional check was returned.",
      });
    } catch (error) {
      setSeerAssessmentError(presentAdminServiceError(error, "Seer could not review this aggregate snapshot."));
    } finally {
      setSeerAssessmentLoading(false);
    }
  };

  const handleOverseerPlan = async () => {
    if (overseerPlanLoading || metricsLoading || metricsError || agentControls.loading || agentControls.error
      || !agentControls.implementedAgentIds.includes("overseer") || agentControls.enabled.overseer !== true) return;
    setOverseerPlanLoading(true);
    setOverseerPlan(null);
    setOverseerPlanError("");
    try {
      const response = await callAgent("overseer", {
        goal: overseerGoal,
        state: {
          snapshotAgeSeconds,
          agentExecutions: metrics.agentExecutions,
          errorRatePercent: metrics.errorRate,
          avgResponseTimeMs: metrics.avgResponseTime,
          enabledHandlers: enabledProductionAgentCount,
          implementedHandlers: implementedCatalogHandlerCount,
          riskSignals: {
            state: riskRadarError ? "unavailable" : riskRadarEnabled ? "available" : "paused",
            warningCount: riskRadarError || !riskRadarEnabled ? null : warningCount,
            criticalCount: riskRadarError || !riskRadarEnabled ? null : criticalCount,
            totalEvents: riskRadarError || !riskRadarEnabled ? null : totalEvents,
          },
          reviewQueues: {
            practitioner: reviewQueueCounts.practitioner,
            communityGivers: reviewQueueCounts.communityGivers,
            meetingSources: reviewQueueCounts.meetingSources,
          },
        },
      });
      const result = response.result || response;
      if (typeof result.summary !== "string" || !Array.isArray(result.steps) || typeof result.evidenceLimit !== "string") {
        throw new Error("Overseer returned an incomplete operations plan. Refresh the snapshot and try again.");
      }
      setOverseerPlan({
        summary: result.summary,
        steps: result.steps.filter((step) => typeof step === "string").slice(0, 3),
        evidenceLimit: result.evidenceLimit,
      });
    } catch (error) {
      setOverseerPlanError(presentAdminServiceError(error, "Overseer could not prepare a plan from this operations snapshot."));
    } finally {
      setOverseerPlanLoading(false);
    }
  };

  return (
    <div className="god-eye-console min-h-screen bg-background text-foreground">
      <div className="lux-shell god-eye-shell py-8 sm:py-10 space-y-8 lg:space-y-10" style={{ maxWidth: "2320px", paddingInline: "clamp(1rem, 3vw, 4rem)" }}>
        {/* Header */}
        <header className="god-eye-header flex flex-col gap-6 rounded-[2rem] border border-emerald-100/10 bg-[radial-gradient(ellipse_at_top_left,rgba(96,147,111,0.18),transparent_48%),linear-gradient(125deg,rgba(14,31,24,0.96),rgba(17,22,28,0.98)_64%,rgba(31,27,19,0.8))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-7 xl:flex-row xl:items-end xl:justify-between xl:p-9">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-100/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-100">
                <CircleDot className={`h-3.5 w-3.5 ${metricsLoading ? "animate-pulse" : ""}`} aria-hidden="true" />
                {metricsError ? "Signals unavailable" : snapshotAgeSeconds === null ? "Waiting for first snapshot" : snapshotAgeSeconds <= 60 ? "Operational snapshot live" : "Snapshot may be stale"}
              </span>
              <span className="text-xs text-white/55">{snapshotTime && Number.isFinite(snapshotTime.getTime()) ? `Updated ${snapshotTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "No verified snapshot yet"}</span>
            </div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-100/75">WellnessCafe Alpha · God-Eye</p>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl xl:text-5xl">Command Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base">
              A live operational picture of WellnessCafe.
            </p>
            <p className="mt-2 text-xs text-emerald-50/50">Privacy-protected operational signals</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:max-w-[620px] xl:justify-end">
            <button type="button" onClick={handleRefreshAll} disabled={refreshingAll} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-100/20 bg-emerald-100/[0.08] px-4 text-sm font-medium text-emerald-50 transition hover:bg-emerald-100/[0.14] disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${refreshingAll ? "animate-spin" : ""}`} aria-hidden="true" />
              {refreshingAll ? "Refreshing" : "Refresh all"}
            </button>
            <button type="button" onClick={handleExportReport} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-100/20 bg-amber-100/[0.06] px-4 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[0.12]">
              <Download className="h-4 w-4" aria-hidden="true" /> Export report
            </button>
            <button type="button" onClick={() => setActiveConsoleTab("risk")} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-100/20 bg-rose-100/[0.05] px-4 text-sm font-medium text-rose-50 transition hover:bg-rose-100/[0.1]">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Signals <span className="rounded-full bg-rose-200/15 px-2 py-0.5 text-xs tabular-nums">{riskRadarEnabled ? (riskRadarLoading ? "…" : riskRadarError ? "—" : criticalCount + warningCount) : "Off"}</span>
            </button>
            <button type="button" onClick={() => navigate("/admin/telemetry")} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white">
              <Activity className="h-4 w-4" aria-hidden="true" /> Support activity
            </button>
            <button type="button" onClick={() => navigate("/profile")} className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-sm text-white/65 transition hover:bg-white/[0.06] hover:text-white">Profile</button>
          </div>
        </header>

        <nav role="tablist" aria-label="Command center sections" className="god-eye-tabs flex gap-2 overflow-x-auto border-b border-white/[0.07] pb-3">
          {[
            ["overview", "Overview", LayoutDashboard], ["queues", "Review queues", ClipboardList], ["agents", "Agents", Bot], ["events", "Event stream", Radio], ["risk", "Risk radar", Siren], ["controls", "Controls", Settings2],
          ].map(([id, label, Icon]) => <button key={id} id={`god-eye-tab-${id}`} type="button" role="tab" aria-selected={activeConsoleTab === id} aria-controls={`god-eye-panel-${id}`} tabIndex={activeConsoleTab === id ? 0 : -1} onClick={() => setActiveConsoleTab(id)} onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const tabs = Array.from(event.currentTarget.parentElement.querySelectorAll('[role="tab"]'));
            const currentIndex = tabs.indexOf(event.currentTarget);
            const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
            const nextTab = tabs[nextIndex];
            nextTab?.focus();
            const nextId = nextTab?.id.replace("god-eye-tab-", "");
            if (nextId) setActiveConsoleTab(nextId);
          }} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-100" aria-label={label}>
            <Icon className="h-4 w-4" aria-hidden="true" />{label}
          </button>)}
        </nav>

        {hasAdminServiceErrors && (
          <section role="alert" className="flex flex-col gap-4 rounded-2xl border border-amber-200/20 bg-amber-100/[.045] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-100" aria-hidden="true" />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-amber-50">Admin services need attention</h2>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  {adminSessionRejected
                    ? "The server could not verify this admin session for operational data. Handler availability and saved settings cannot be confirmed."
                    : "Some operational services could not be reached. Their data and controls are marked unavailable until the server responds."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => { await refreshClaims(); await handleRefreshAll(); }}
              disabled={refreshingAll}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-amber-100/20 px-4 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[.08] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingAll ? "animate-spin" : ""}`} aria-hidden="true" />
              {refreshingAll ? "Checking…" : "Refresh access and services"}
            </button>
          </section>
        )}

        <section id="god-eye-panel-overview" role="tabpanel" aria-labelledby="god-eye-tab-overview" hidden={activeConsoleTab !== "overview"} className="scroll-mt-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">System pulse</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">The system, at a glance</h2>
            </div>
            <p className="text-xs text-muted-foreground">Live operational measures</p>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <article className="god-eye-visual-panel rounded-3xl border border-emerald-100/10 bg-[linear-gradient(145deg,rgba(44,74,59,.25),rgba(10,18,24,.72))] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[.16em] text-emerald-100/55">Community footprint</p>
              <div className="mt-3"><MemberBaseVisual total={metrics.totalUsers} loading={metricsLoading} error={metricsError} /></div>
            </article>

            <article className="god-eye-visual-panel rounded-3xl border border-sky-100/10 bg-[linear-gradient(145deg,rgba(39,66,88,.25),rgba(10,18,24,.72))] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[.16em] text-sky-100/55">Agent readiness</p>
              <AgentReadinessMeter total={INTELLIGENCE_AGENTS.length} implemented={implementedCatalogHandlerCount} enabled={enabledProductionAgentCount} loading={agentControls.loading} error={agentControls.error} />
              <p className="mt-1 text-xs text-white/40">The count requires a catalog-to-server match. The legacy Healer mapping is marked partial in its card.</p>
            </article>

            <article className="god-eye-visual-panel rounded-3xl border border-amber-100/10 bg-[linear-gradient(145deg,rgba(80,61,33,.22),rgba(10,18,24,.72))] p-5 sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[.16em] text-amber-100/55">Observed run health</p>
              <div className="mt-5"><RingMeter value={metricsLoading || metricsError ? null : observedExecutionSuccess} label="Sample success rate" detail={metricsLoading ? "Loading" : metricsError ? "Unavailable" : metrics.systemHealth === "not_measured" ? "No runs yet" : metrics.systemHealth} note={metricsError ? "Operational snapshot could not be verified" : metricsLoading ? "Waiting for snapshot" : metrics.systemHealth === "not_measured" ? "Waiting for recorded activity" : "From recorded runs"} color="#f3d37a" /></div>
              <p className="mt-4 text-xs text-white/45">{metricsError ? "Run health unavailable" : "From recorded agent runs"}</p>
              <button type="button" onClick={handlePulseAssessment} disabled={pulseAssessmentLoading || metricsLoading || Boolean(metricsError) || agentControls.loading || Boolean(agentControls.error) || !agentControls.implementedAgentIds.includes("pulse") || agentControls.enabled.pulse !== true} className="mt-4 min-h-10 rounded-full border border-amber-100/20 px-4 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[.08] disabled:cursor-not-allowed disabled:opacity-50">
                {pulseAssessmentLoading ? "Reading snapshot…" : pulseAssessment ? "Refresh Pulse assessment" : "Ask Pulse to interpret"}
              </button>
              {agentControls.enabled.pulse === false && <p className="mt-2 text-xs text-white/50">Pulse is paused in agent controls.</p>}
              {pulseAssessmentError && <p role="alert" className="mt-3 text-sm text-amber-100">{pulseAssessmentError}</p>}
              {pulseAssessment && <div role="status" aria-live="polite" className="mt-4 space-y-2 rounded-xl border border-amber-100/15 bg-slate-950/35 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-white">Pulse: {pulseAssessment.healthStatus.replaceAll("_", " ")}</p><span className="text-[11px] text-white/45">Operational snapshot · aggregate only</span></div>
                <p className="text-sm leading-relaxed text-white/75">{pulseAssessment.summary}</p>
                {pulseAssessment.observations.map((observation, index) => <p key={`${index}-${observation}`} className="text-xs leading-relaxed text-white/65">• {observation}</p>)}
                <p className="border-t border-white/10 pt-2 text-xs leading-relaxed text-amber-50/75"><span className="font-medium">Next check:</span> {pulseAssessment.nextCheck}</p>
              </div>}
            </article>
          </div>

          <article className="god-eye-visual-panel rounded-3xl border border-cyan-100/10 bg-[linear-gradient(145deg,rgba(39,66,88,.2),rgba(10,18,24,.72))] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.16em] text-cyan-100/55">Aggregate pattern review</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Seer · operational trends</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55">Reviews only the verified system snapshot, including aggregate usage, agent health, and available seven-day signal counts. No member records or reflections are sent.</p>
              </div>
              <button type="button" onClick={handleSeerAssessment} disabled={seerAssessmentLoading || metricsLoading || Boolean(metricsError) || agentControls.loading || Boolean(agentControls.error) || !agentControls.implementedAgentIds.includes("seer") || agentControls.enabled.seer !== true} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-cyan-100/20 px-4 text-sm font-medium text-cyan-50 transition hover:bg-cyan-100/[.08] disabled:cursor-not-allowed disabled:opacity-50">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {seerAssessmentLoading ? "Reviewing snapshot…" : seerAssessment ? "Refresh Seer review" : "Ask Seer to review trends"}
              </button>
            </div>
            {agentControls.enabled.seer === false && <p className="mt-3 text-xs text-white/50">Seer is paused in agent controls.</p>}
            {seerAssessmentError && <p role="alert" className="mt-3 text-sm text-amber-100">{seerAssessmentError}</p>}
            {seerAssessment && <div role="status" aria-live="polite" className="mt-4 grid gap-4 rounded-2xl border border-cyan-100/10 bg-slate-950/35 p-4 lg:grid-cols-[1.3fr_1fr]">
              <div><p className="text-sm leading-relaxed text-white/80">{seerAssessment.summary}</p><p className="mt-3 text-[11px] text-white/40">Snapshot from {snapshotTime?.toLocaleString?.() || "the latest verified operational sample"} · aggregate only</p></div>
              <div className="space-y-2">
                {seerAssessment.insights.map((insight, index) => <p key={`${index}-${insight}`} className="text-xs leading-relaxed text-cyan-50/75">• {insight}</p>)}
                <p className="border-t border-white/10 pt-2 text-xs leading-relaxed text-amber-50/75"><span className="font-medium">Possible next check:</span> {seerAssessment.nextCheck}</p>
              </div>
            </div>}
          </article>

          <article className="god-eye-visual-panel rounded-3xl border border-amber-100/10 bg-[linear-gradient(145deg,rgba(80,61,33,.16),rgba(10,18,24,.72))] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[.16em] text-amber-100/55">Admin planning · aggregate only</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Overseer · prepare a review plan</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55">Choose an operational question. Overseer can suggest checks from the current snapshot; it cannot change settings or claim a service was checked beyond the data shown.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="overseer-review-goal">Operational review focus</label>
                <select id="overseer-review-goal" value={overseerGoal} onChange={(event) => { setOverseerGoal(event.target.value); setOverseerPlan(null); setOverseerPlanError(""); }} disabled={overseerPlanLoading} className="min-h-10 rounded-full border border-amber-100/15 bg-slate-950/55 px-4 text-sm text-white">
                  <option value="agent-health">Handler readiness</option>
                  <option value="signal-review">Seven-day signals</option>
                  <option value="service-baseline">Response and errors</option>
                </select>
                <button type="button" onClick={handleOverseerPlan} disabled={overseerPlanLoading || metricsLoading || Boolean(metricsError) || agentControls.loading || Boolean(agentControls.error) || !agentControls.implementedAgentIds.includes("overseer") || agentControls.enabled.overseer !== true} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-amber-100/20 px-4 text-sm font-medium text-amber-50 transition hover:bg-amber-100/[.08] disabled:cursor-not-allowed disabled:opacity-50">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  {overseerPlanLoading ? "Preparing plan…" : overseerPlan ? "Refresh plan" : "Prepare plan"}
                </button>
              </div>
            </div>
            {agentControls.enabled.overseer === false && <p className="mt-3 text-xs text-white/50">Overseer is paused in agent controls.</p>}
            {overseerPlanError && <p role="alert" className="mt-3 text-sm text-amber-100">{overseerPlanError}</p>}
            {overseerPlan && <div role="status" aria-live="polite" className="mt-4 grid gap-4 rounded-2xl border border-amber-100/10 bg-slate-950/35 p-4 lg:grid-cols-[1fr_1.2fr]">
              <div><p className="text-sm leading-relaxed text-white/80">{overseerPlan.summary}</p><p className="mt-3 text-xs leading-relaxed text-white/55"><span className="font-medium text-amber-50/80">Evidence limit:</span> {overseerPlan.evidenceLimit}</p></div>
              <ol className="space-y-2">{overseerPlan.steps.map((step, index) => <li key={`${index}-${step}`} className="flex gap-3 text-xs leading-relaxed text-amber-50/75"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-amber-100/15 text-[10px] tabular-nums">{index + 1}</span><span>{step}</span></li>)}</ol>
              <p className="text-[11px] text-white/40 lg:col-span-2">Operational snapshot · {snapshotTime?.toLocaleString?.() || "timestamp unavailable"} · suggested checks only</p>
            </div>}
          </article>

          <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <article className="god-eye-visual-panel god-eye-trend-panel rounded-3xl border border-white/[.08] bg-slate-950/25 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-medium uppercase tracking-[.16em] text-white/45">Seven-day signal history</p><h3 className="mt-1 text-lg font-semibold text-white">Risk activity</h3></div>
                <span className="rounded-full border border-amber-100/10 bg-amber-100/[.04] px-3 py-1 text-xs text-amber-100/70">7 days</span>
              </div>
              {riskRadarEnabled ? <RiskTrendChart days={dailyCounts} loading={riskRadarLoading} error={riskRadarError} /> : <div className="grid h-56 place-items-center text-sm text-white/50">Signal chart paused</div>}
            </article>
            <article className="god-eye-visual-panel rounded-3xl border border-white/[.08] bg-slate-950/25 p-5 sm:p-6">
              <div><p className="text-xs font-medium uppercase tracking-[.16em] text-white/45">Severity mix</p><h3 className="mt-1 text-lg font-semibold text-white">Signals needing attention</h3></div>
              {riskRadarEnabled ? riskRadarError ? <div className="mt-6 grid h-40 place-items-center text-sm text-amber-50/60">Signal totals unavailable</div> : <div className="mt-6"><RiskSeverityMeter warningCount={warningCount} criticalCount={criticalCount} totalEvents={totalEvents} /></div> : <div className="mt-6 grid h-40 place-items-center text-sm text-white/50">Signal summary paused</div>}
              {riskRadarSampled && <p className="mt-5 text-[11px] text-white/40">Latest 500 signals sampled</p>}
            </article>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Session records", value: metrics.totalSessions, Icon: Database, tone: "text-sky-200", accent: "bg-sky-200" },
              { label: "Check-ins · 7 days", value: metrics.checkinsLast7Days, Icon: CheckCircle2, tone: "text-teal-200", accent: "bg-teal-200" },
              { label: "Agent executions", value: metrics.agentExecutions, Icon: Zap, tone: "text-amber-100", accent: "bg-amber-100" },
              { label: "Avg. response", value: metrics.avgResponseTime == null ? null : `${metrics.avgResponseTime} ms`, Icon: Clock, tone: "text-violet-200", accent: "bg-violet-200" },
              { label: "Reviews waiting", value: pendingReviewCount, Icon: Database, tone: "text-rose-200", accent: "bg-rose-200" },
              { label: "Total accounts", value: metrics.totalUsers, Icon: Users, tone: "text-emerald-200", accent: "bg-emerald-200" },
            ].map(({ label, value, Icon, tone, accent }) => (
              <article key={label} className="god-eye-metric group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.05] sm:p-4">
                <div className="flex items-center justify-between gap-2"><p className="truncate text-[11px] font-medium text-white/55">{label}</p><Icon className={`h-3.5 w-3.5 shrink-0 ${tone}`} aria-hidden="true" /></div>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-3xl">{metricsLoading || metricsError ? "—" : value == null ? "—" : value.toLocaleString?.() ?? value}</p>
                <span className={`absolute inset-x-0 bottom-0 h-px ${accent} opacity-45`} />
              </article>
            ))}
          </div>
          <p className="sr-only">Values come from the live operational snapshot. Personal member reflections and health readings are excluded.</p>
        </section>

        <section id="god-eye-panel-queues" role="tabpanel" aria-labelledby="god-eye-tab-queues" hidden={activeConsoleTab !== "queues"} className="scroll-mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/65">Human review</p><h2 className="mt-1 text-xl font-semibold text-foreground">Work that needs an admin</h2></div>
            <span className="text-xs text-muted-foreground">Review decisions remain human-led.</span>
          </div>
          <AdminReviewQueues
            practitionerCount={reviewQueueCounts.practitioner}
            giverCount={reviewQueueCounts.communityGivers}
            meetingSourceCount={reviewQueueCounts.meetingSources}
          />
          <PrivateFriendGroupReportsQueue />
        </section>

        <section hidden={activeConsoleTab !== "queues"} className="flex flex-col justify-between gap-3 rounded-2xl border border-sky-200/15 bg-sky-100/[0.025] p-4 sm:flex-row sm:items-center" aria-label="Workspace access management">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-100/[0.08] text-sky-100"><UserRoundCog className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Workspace access</h2><p className="mt-0.5 text-xs text-muted-foreground">Find an account by email and grant the practitioner workspace for their service.</p></div></div>
          <button type="button" onClick={() => navigate("/admin/user-access")} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-sky-100/20 px-3 text-xs font-medium text-sky-50 hover:bg-sky-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-100">Manage workspace access</button>
        </section>

        {/* Agents Overview */}
        <section id="god-eye-panel-agents" role="tabpanel" aria-labelledby="god-eye-tab-agents" hidden={activeConsoleTab !== "agents"} className="scroll-mt-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">Intelligence layer</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">Agents &amp; service handlers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Registry visibility, server-backed availability, and safe controls for production handlers.</p>
          </div>

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
                  {a.name}{!canRunAdminAgentSmokeTest(a.id) ? " · Test in authorized client timeline" : agentControls.loading ? " · Checking status" : agentControls.error ? " · Status unavailable" : availableTestAgents.some((available) => available.id === a.id) ? " · Live and enabled" : getAgentControlId(a) && agentControls.implementedAgentIds.includes(getAgentControlId(a)) ? " · Paused" : a.readiness === "partial" ? " · Partial handler" : " · No production handler"}
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
            {testAgentId === "witness" && (
              <span className="text-xs text-white/55">Witness must be tested in a verified provider workspace with the client’s active sharing permission.</span>
            )}
            {agentControls.notice && <span role="status" className="text-xs text-emerald-300">{agentControls.notice}</span>}
          </div>

          {testResult && (
            testResult.error ? (
              <div
                role="alert"
                className="lux-card mt-3 border-destructive/40 bg-destructive/10 p-4"
              >
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-semibold">Agent test failed</p>
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {String(testResult.error)}
                </p>
              </div>
            ) : (
              <div
                role="status"
                aria-live="polite"
                className="lux-card mt-3 space-y-3 border-emerald-300/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Test response
                    </p>
                    <p className="mt-1 truncate text-base font-semibold text-foreground">
                      {testResult.agentName ||
                        agents.find((agent) => agent.id === testAgentId)?.name ||
                        testAgentId}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-1 text-xs font-medium text-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Completed
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                  {[
                    testResult.reply,
                    testResult.result?.reply,
                    testResult.data?.message,
                    testResult.result?.summary,
                    testResult.message,
                  ].find((value) => typeof value === "string" && value.trim()) ||
                    "The agent completed the call but did not return a readable response."}
                </p>
              </div>
            )
          )}

          <div className="grid gap-4 md:grid-cols-4">
            {agents.map((agent) => {
              const Icon = agentIcons[agent.id] || Activity;
              const controlId = getAgentControlId(agent);
              const handlerAvailable = Boolean(controlId && agentControls.implementedAgentIds.includes(controlId));
              const handlerKnown = !agentControls.loading && !agentControls.error;
              const productionEnabled = handlerKnown && handlerAvailable && agentControls.enabled[controlId] === true;
              const runWidth = maxRecentRuns ? Math.max(agent.runCount > 0 ? 3 : 0, (Number(agent.runCount) || 0) / maxRecentRuns * 100) : 0;
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
                    <button type="button" onClick={(event) => { agentDetailsOpenerRef.current = event.currentTarget; setSelectedAgentId(agent.id); }} aria-label={`Open ${agent.name} details`} className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${
                      agent.status === "active" ? "bg-amber-400/10" : "bg-muted"
                    }`}>
                      {agent.icon}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {agent.role}
                      </p>
                    </div>
                    {!handlerKnown ? (
                      <CircleDot className="h-3.5 w-3.5 shrink-0 text-amber-100/70" aria-label="Handler status unavailable" />
                    ) : productionEnabled ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      agentDetailsOpenerRef.current = event.currentTarget;
                      setSelectedAgentId(agent.id);
                    }}
                    className="inline-flex min-h-9 w-full items-center justify-between rounded-lg border border-border/60 px-3 text-left text-xs font-medium text-foreground/85 transition hover:border-amber-200/35 hover:bg-amber-100/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
                    aria-label={`View ${agent.name} details`}
                  >
                    <span>Agent details</span>
                    <span aria-hidden="true">→</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <div className="col-span-2">
                      <p className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${!handlerKnown ? "border-amber-100/15 bg-amber-100/[.04] text-amber-50/65" : handlerAvailable && agent.readiness === "partial" ? "border-amber-200/20 bg-amber-200/[.06] text-amber-100" : handlerAvailable ? "border-emerald-200/20 bg-emerald-200/[.06] text-emerald-200" : "border-white/10 bg-white/[.03] text-white/50"}`}>
                        {!handlerKnown ? "Status unavailable" : handlerAvailable && agent.readiness === "partial" ? "Partial handler" : handlerAvailable ? "Production handler" : "No production handler"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2"><p className="text-[10px] text-muted-foreground">Recent runs</p><p className="text-sm font-semibold tabular-nums">{agentMetricsError ? "—" : agent.runCount || 0}</p></div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label={`${agent.name}: ${agentMetricsError ? "run count unavailable" : `${agent.runCount || 0} recent runs`}`}><span className="block h-full rounded-full bg-sky-200/80 transition-[width] duration-500" style={{ width: `${agentMetricsError ? 0 : runWidth}%` }} /></div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Health</p>
                      <p className={`text-sm font-semibold ${
                        agent.health === "healthy" ? "text-emerald-400" :
                        agent.health === "degraded" ? "text-amber-400" :
                        agent.health === "unknown" ? "text-muted-foreground" : "text-destructive"
                      }`}>
                        {agentMetricsError ? "unavailable" : agent.health}
                      </p>
                    </div>
                  </div>

                  {handlerAvailable && (
                    <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                      <div>
                        <p className="text-xs font-medium">Live system control</p>
                        <p className="text-[11px] text-muted-foreground">
                          {agentControls.loading ? "Checking server…" : agentControls.error ? "Unavailable · fail-closed" : agentControls.enabled[controlId] ? "Enabled for new requests" : "Paused for new requests"}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={agentControls.enabled[controlId] === true}
                        aria-label={`${agentControls.enabled[controlId] ? "Pause" : "Enable"} ${agent.name}`}
                        disabled={agentControls.loading || Boolean(agentControls.error) || agentControls.savingAgentId !== null}
                        onClick={() => handleAgentControlChange(controlId, agentControls.enabled[controlId] !== true)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${agentControls.enabled[controlId] ? "border-emerald-300/40 bg-emerald-400/25" : "border-border bg-muted"}`}
                      >
                        <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${agentControls.enabled[controlId] ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedAgent && (
            <div
              className="fixed inset-0 z-[150] grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSelectedAgentId(null);
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="agent-details-title"
                tabIndex={-1}
                onKeyDown={(event) => {
                  if (event.key !== "Tab") return;
                  const focusable = event.currentTarget.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
                  if (!focusable.length) return;
                  const first = focusable[0];
                  const last = focusable[focusable.length - 1];
                  if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                  } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                  }
                }}
                className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-amber-100/15 bg-slate-900 p-5 text-white shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-100/15 bg-amber-100/[0.06] text-2xl" aria-hidden="true">
                      {selectedAgent.icon || "✦"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/65">Agent profile</p>
                      <h3 id="agent-details-title" className="mt-1 text-2xl font-semibold tracking-tight">
                        {selectedAgent.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/60">{selectedAgent.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    ref={agentDetailsCloseRef}
                    onClick={() => setSelectedAgentId(null)}
                    aria-label="Close agent details"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-white/65 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-5 text-sm leading-6 text-white/75">
                  {selectedAgentDefinition?.notes || selectedAgent.description || "No description has been added to this agent’s registry entry yet."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs uppercase tracking-wide text-white/45">Production readiness</p>
                    <p className={`mt-1 text-sm font-semibold ${selectedAgentControlId && agentControls.implementedAgentIds.includes(selectedAgentControlId) ? selectedAgent.readiness === "partial" ? "text-amber-100" : "text-emerald-200" : "text-amber-100"}`}>
                      {selectedAgentControlId && agentControls.implementedAgentIds.includes(selectedAgentControlId) ? selectedAgent.readiness === "partial" ? "Partial handler · identity mapping needed" : "Production handler available" : "Registered · handler not connected"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">
                      {selectedAgentControlId && agentControls.implementedAgentIds.includes(selectedAgentControlId)
                        ? agentControls.error ? "Server control status could not be verified." : agentControls.enabled[selectedAgentControlId] ? "Enabled for new requests." : "Paused for new requests."
                        : "This agent is visible in the registry but cannot run in production yet."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                    <p className="text-xs uppercase tracking-wide text-white/45">Priority and scope</p>
                    <p className="mt-1 text-sm font-semibold text-white/90">Priority {selectedAgentDefinition?.priority ?? "—"} · {selectedAgentDefinition?.scope || "Scope not recorded"}</p>
                    <p className="mt-1 text-xs text-white/50">Health: {selectedAgent.health || "unknown"}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Measured runs</p>
                    <p className="mt-1 text-lg font-semibold">{selectedAgent.runCount ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Recorded errors</p>
                    <p className="mt-1 text-lg font-semibold">{selectedAgent.errorCount ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs text-white/45">Average response</p>
                    <p className="mt-1 text-lg font-semibold">{selectedAgent.avgResponseTime > 0 ? `${Math.round(selectedAgent.avgResponseTime)} ms` : "Not measured"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">When it is called</h4>
                    {selectedAgentDefinition?.triggersWhen?.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {selectedAgentDefinition.triggersWhen.map((trigger) => (
                          <li key={trigger} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/70">
                            {trigger.replaceAll(".", " · ").replaceAll("_", " ")}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="mt-1 text-sm text-white/50">No trigger signals are listed.</p>}
                  </div>
                  {selectedAgentDefinition?.produces?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold">What it contributes</h4>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {selectedAgentDefinition.produces.map((item) => (
                          <li key={item} className="rounded-full border border-emerald-100/10 bg-emerald-100/[0.04] px-3 py-1.5 text-xs text-emerald-50/75">
                            {item.replaceAll(".", " · ").replaceAll("_", " ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          <AgentHealthBar summary={healthSummary} error={agentMetricsError} />
        </section>

        {/* Live Event Stream */}
        <section id="god-eye-panel-events" role="tabpanel" aria-labelledby="god-eye-tab-events" hidden={activeConsoleTab !== "events"} className="scroll-mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/65">Operations trail</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">Live event stream</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sanitized service events only; private reflection content is excluded.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
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
              <button type="button" onClick={refreshEvents} disabled={eventsLoading} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60">
                <RefreshCw className={`h-3.5 w-3.5 ${eventsLoading ? "animate-spin" : ""}`} />
                Refresh events
              </button>
            </div>
          </div>

          <div className="lux-card p-4 max-h-[400px] overflow-y-auto space-y-2">
          {eventsLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Loading events...
            </p>
          ) : eventsError ? (
              <p role="status" className="text-sm text-destructive text-center py-8">Event stream unavailable: {presentAdminServiceError(eventsError, "Please refresh to try again.")}</p>
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
        <section id="god-eye-panel-risk" role="tabpanel" aria-labelledby="god-eye-tab-risk" hidden={activeConsoleTab !== "risk"} className="lux-section scroll-mt-6 space-y-4">
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
              <button type="button" onClick={() => setActiveConsoleTab("controls")} className="min-h-10 shrink-0 rounded-full border border-border px-4 text-sm text-foreground hover:bg-muted">
                Review feature setting
              </button>
            </div>
          ) : riskRadarError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Risk data unavailable: {presentAdminServiceError(riskRadarError, "Please refresh to try again.")}
            </div>
          )}

          {riskRadarEnabled && (riskRadarError ? null : riskRadarLoading ? (
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
        <section id="god-eye-panel-controls" role="tabpanel" aria-labelledby="god-eye-tab-controls" hidden={activeConsoleTab !== "controls"} className="lux-section scroll-mt-6 space-y-6">
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
                    setSystemSettingsStatus({ state: "error", message: presentAdminServiceError(error, "Settings were not saved. Your edits are still on this page; try again.") });
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
                disabled={settingsUnavailable}
                className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Reset to defaults
              </button>
            </div>
          </div>
          <p role="status" aria-live="polite" className={`text-xs ${systemSettingsStatus.state === "error" ? "text-destructive" : "text-muted-foreground"}`}>
            {systemSettingsStatus.message}
          </p>

          <nav role="tablist" aria-label="System settings categories" className="god-eye-tabs flex gap-2 overflow-x-auto border-b border-white/[0.07] pb-3">
            {[["features", "Features", Sliders], ["thresholds", "Risk thresholds", TrendingUp], ["notifications", "Notifications", Bell], ["copy", "Home page copy", Database]].map(([id, label, Icon]) => (
              <button key={id} id={`god-eye-settings-tab-${id}`} type="button" role="tab" aria-selected={activeSettingsTab === id} aria-controls={`god-eye-settings-panel-${id}`} tabIndex={activeSettingsTab === id ? 0 : -1} onClick={() => setActiveSettingsTab(id)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] px-4 text-sm text-white/65 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-100">
                <Icon className="h-4 w-4" aria-hidden="true" />{label}
              </button>
            ))}
          </nav>

          <div className="grid items-start gap-6">
            <div id="god-eye-settings-panel-features" role="tabpanel" aria-labelledby="god-eye-settings-tab-features" hidden={activeSettingsTab !== "features"} className="lux-card p-4 space-y-4 scroll-mt-8">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Feature Toggles
                </h3>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                {Object.entries(systemSettings.features).map(([feature, enabled]) => (
                  <div
                    key={feature}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white/[0.02] p-3"
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
                        disabled={settingsUnavailable}
                        title={`Turn ${enabled ? "off" : "on"} ${getFeatureSwitchPresentation(feature).label.toLowerCase()}`}
                        onClick={() => {
                          throttle(() => updateFeature(feature, !enabled), 150)();
                        }}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          enabled ? "bg-emerald-500" : "bg-muted"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
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

            <div id="god-eye-settings-panel-thresholds" role="tabpanel" aria-labelledby="god-eye-settings-tab-thresholds" hidden={activeSettingsTab !== "thresholds"} className="lux-card p-4 space-y-4">
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
                    disabled={settingsUnavailable}
                    onChange={(e) =>
                      updateThreshold("riskLevelLow", parseInt(e.target.value, 10))
                    }
                    className="w-full disabled:opacity-50"
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
                    disabled={settingsUnavailable}
                    onChange={(e) =>
                      updateThreshold("riskLevelMedium", parseInt(e.target.value, 10))
                    }
                    className="w-full disabled:opacity-50"
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
                    disabled={settingsUnavailable}
                    onChange={(e) =>
                      throttledUpdateThreshold("riskLevelHigh", parseInt(e.target.value, 10))
                    }
                    className="w-full disabled:opacity-50"
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
                    disabled={settingsUnavailable}
                    onChange={(e) =>
                      updateThreshold("errorRateThreshold", parseFloat(e.target.value))
                    }
                    className="w-full disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <AdminNotificationPolicy
              notifications={systemSettings.notifications}
              onChange={updateNotificationRule}
              disabled={settingsUnavailable}
              hidden={activeSettingsTab !== "notifications"}
            />
          </div>
        </section>

        {/* Content controls */}
        <section id="god-eye-settings-panel-copy" role="tabpanel" aria-labelledby="god-eye-settings-tab-copy" hidden={activeConsoleTab !== "controls" || activeSettingsTab !== "copy"} className="lux-section space-y-6">
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

          <div className="grid min-w-0 gap-4 text-sm xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
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
              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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

              <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Recovery tile subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={recoverySubtitle}
                    onChange={(e) =>
                      updateConfig({ recoverySubtitle: e.target.value })
                    }
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Tools tile subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={toolsSubtitle}
                    onChange={(e) =>
                      updateConfig({ toolsSubtitle: e.target.value })
                    }
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Providers tile subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={providersSubtitle}
                    onChange={(e) =>
                      updateConfig({ providersSubtitle: e.target.value })
                    }
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Dashboard tile subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={dashboardSubtitle}
                    onChange={(e) =>
                      updateConfig({ dashboardSubtitle: e.target.value })
                    }
                    className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs leading-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
