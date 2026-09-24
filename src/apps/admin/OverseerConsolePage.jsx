// src/apps/admin/OverseerConsolePage.jsx

import React, { useEffect, useState } from "react";
import { useAgentsRegistryStore } from "../../stores/agentsRegistryStore";
import { runSeer, runOracle, runOverseer, runSentinel } from "../../agents/aiAgents";
import { getTelemetrySnapshot } from "../../services/telemetry";
import { trackPageView, trackAction } from "../../services/telemetry";
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
  Play,
  Pause,
  Settings,
  RefreshCw,
  Zap,
  Shield,
  Eye,
  Compass,
  Flame,
} from "lucide-react";

const OverseerConsolePage = () => {
  const [isAdmin, setIsAdmin] = useState(hasAdminSession());
  const [unlockKey, setUnlockKey] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);

  const {
    loadRegistry,
    getAllAgents,
    toggleAgent,
    updateAgentConfig,
    resetAgent,
    getHealthSummary,
    recordRun,
  } = useAgentsRegistryStore();

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [runningAgent, setRunningAgent] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    if (!isAdmin) return;
    document.title = "Overseer Console - WellnessCafe Admin";
    trackPageView("overseer_console");
    loadRegistry();
  }, [isAdmin, loadRegistry]);

  const healthSummary = getHealthSummary();

  // Agent icons mapping
  const agentIcons = {
    seer: Eye,
    oracle: Flame,
    overseer: Compass,
    sentinel: Shield,
  };

  // Test agent execution
  const handleTestAgent = async (agentId) => {
    if (runningAgent) return;

    setRunningAgent(agentId);
    const startTime = Date.now();

    try {
      trackAction("overseer_test_agent", { agentId });

      let result = null;
      const telemetry = getTelemetrySnapshot();

      switch (agentId) {
        case "seer":
          result = await runSeer(telemetry, "What patterns do you see?");
          break;
        case "oracle":
          result = await runOracle({}, "What guidance can you offer?");
          break;
        case "overseer":
          result = await runOverseer({}, "Create a plan for recovery support");
          break;
        case "sentinel":
          result = await runSentinel(telemetry, {});
          break;
        default:
          throw new Error(`Unknown agent: ${agentId}`);
      }

      if (!result || result.success !== true) {
        throw new Error(result?.error?.message || `Agent ${agentId} returned no successful result.`);
      }

      const responseTime = Date.now() - startTime;
      recordRun(agentId, responseTime, true);

      setTestResults({
        ...testResults,
        [agentId]: {
          success: true,
          responseTime,
          result: result?.summary || result?.reply || JSON.stringify(result, null, 2),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      const responseTime = Date.now() - startTime;
      recordRun(agentId, responseTime, false);

      setTestResults({
        ...testResults,
        [agentId]: {
          success: false,
          responseTime,
          error: err.message || "Agent execution failed",
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setRunningAgent(null);
    }
  };

  const handleUnlock = async (e) => {
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
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setUnlockKey("");
    setUnlockError("");
  };

  // 🔒 Unlock screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Restricted area
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Overseer Console
            </h1>
            <p className="text-sm text-muted-foreground">
              This console manages the AI agents that power WellnessCafe OS.
              Admin access required.
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
        </div>
      </div>
    );
  }

  const agentsList = getAllAgents();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Admin · Overseer Console
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Agents Registry & Management
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Monitor, configure, and test the AI agents that power WellnessCafe OS.
              The Seer, Oracle, Overseer, and Sentinel work together to provide
              intelligent wellness guidance.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Sign out
            </button>
            <p className="text-[11px] text-muted-foreground">
              {getAdminKeyHint() || "Admin session active"}
            </p>
          </div>
        </header>

        {/* Health Summary */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="lux-card p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Total Agents
              </p>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold">{healthSummary.total}</p>
            <p className="text-xs text-muted-foreground">
              {healthSummary.active} active
            </p>
          </div>

          <div className="lux-card p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Healthy
              </p>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-semibold text-emerald-400">
              {healthSummary.healthy}
            </p>
            <p className="text-xs text-muted-foreground">Operational</p>
          </div>

          <div className="lux-card p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Degraded
              </p>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-semibold text-amber-400">
              {healthSummary.degraded}
            </p>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </div>

          <div className="lux-card p-4 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Down
              </p>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-semibold text-destructive">
              {healthSummary.down}
            </p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
        </section>

        {/* Agents List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Registered Agents
            </h2>
            <button
              type="button"
              onClick={() => {
                loadRegistry();
                trackAction("overseer_refresh_registry");
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {agentsList.map((agent) => {
              const Icon = agentIcons[agent.id] || Activity;
              const testResult = testResults[agent.id];
              const isRunning = runningAgent === agent.id;

              return (
                <div
                  key={agent.id}
                  className={`lux-card p-4 space-y-3 ${
                    agent.health === "down"
                      ? "border-destructive/30"
                      : agent.health === "degraded"
                      ? "border-amber-400/30"
                      : ""
                  }`}
                >
                  {/* Agent Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
                          agent.status === "active"
                            ? "bg-amber-400/10"
                            : "bg-muted"
                        }`}
                      >
                        {agent.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold truncate">
                            {agent.name}
                          </h3>
                          {agent.status === "active" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Pause className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleAgent(agent.id);
                        trackAction("overseer_toggle_agent", {
                          agentId: agent.id,
                          enabled: !agent.config.enabled,
                        });
                      }}
                      className={`h-7 w-12 rounded-full relative transition-colors flex-shrink-0 ${
                        agent.config.enabled
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-background absolute top-1 transition-transform ${
                          agent.config.enabled ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground">
                    {agent.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Runs</p>
                      <p className="text-sm font-semibold">
                        {agent.runCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Avg Time</p>
                      <p className="text-sm font-semibold">
                        {agent.avgResponseTime || 0}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Errors</p>
                      <p className="text-sm font-semibold text-destructive">
                        {agent.errorCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Last Run */}
                  {agent.lastRun && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Last run:{" "}
                        {new Date(agent.lastRun).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Test Button */}
                  <button
                    type="button"
                    onClick={() => handleTestAgent(agent.id)}
                    disabled={isRunning || !agent.config.enabled}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3" />
                        Test Agent
                      </>
                    )}
                  </button>

                  {/* Test Results */}
                  {testResult && (
                    <div
                      className={`rounded-md border p-2 text-xs ${
                        testResult.success
                          ? "border-emerald-400/30 bg-emerald-400/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={
                            testResult.success
                              ? "text-emerald-400"
                              : "text-destructive"
                          }
                        >
                          {testResult.success ? "✓ Success" : "✗ Failed"}
                        </span>
                        <span className="text-muted-foreground">
                          {testResult.responseTime}ms
                        </span>
                      </div>
                      {testResult.result && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2">
                          {testResult.result}
                        </p>
                      )}
                      {testResult.error && (
                        <p className="text-[10px] text-destructive">
                          {testResult.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* View Details */}
                  <button
                    type="button"
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border/50 bg-card/50 px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-3 w-3" />
                    Configure
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Agent Configuration Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="lux-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedAgent.icon} {selectedAgent.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedAgent.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAgent(null)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                {/* Auto-run Interval */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Auto-run Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedAgent.config.runInterval || ""}
                    onChange={(e) => {
                      const interval = e.target.value
                        ? parseInt(e.target.value, 10)
                        : null;
                      updateAgentConfig(selectedAgent.id, {
                        runInterval: interval,
                        autoRun: interval !== null,
                      });
                      setSelectedAgent({
                        ...selectedAgent,
                        config: {
                          ...selectedAgent.config,
                          runInterval: interval,
                          autoRun: interval !== null,
                        },
                      });
                    }}
                    placeholder="Manual only"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Set to 0 or empty for manual execution only
                  </p>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Temperature: {selectedAgent.config.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedAgent.config.temperature}
                    onChange={(e) => {
                      const temp = parseFloat(e.target.value);
                      updateAgentConfig(selectedAgent.id, { temperature: temp });
                      setSelectedAgent({
                        ...selectedAgent,
                        config: {
                          ...selectedAgent.config,
                          temperature: temp,
                        },
                      });
                    }}
                    className="w-full"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Lower = more focused, Higher = more creative
                  </p>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="100"
                    value={selectedAgent.config.maxTokens}
                    onChange={(e) => {
                      const tokens = parseInt(e.target.value, 10);
                      updateAgentConfig(selectedAgent.id, { maxTokens: tokens });
                      setSelectedAgent({
                        ...selectedAgent,
                        config: {
                          ...selectedAgent.config,
                          maxTokens: tokens,
                        },
                      });
                    }}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                {/* Reset */}
                <button
                  type="button"
                  onClick={() => {
                    resetAgent(selectedAgent.id);
                    loadRegistry();
                    setSelectedAgent(null);
                    trackAction("overseer_reset_agent", {
                      agentId: selectedAgent.id,
                    });
                  }}
                  className="w-full inline-flex items-center justify-center rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverseerConsolePage;
