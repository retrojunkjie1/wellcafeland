// src/apps/dashboard/AdminConsolePage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminConfigStore } from "../../stores/adminConfigStore";
import { useUIStore } from "../../stores/uiStore";
import { getTelemetrySnapshot } from "../../services/telemetry";
import { getAdminStatus, getAdminKey, clearAdminKey, generateSubKey } from "../../services/adminAccess";
import AccessDeniedPage from "../auth/AccessDeniedPage";

const AdminConsolePage = () => {
  const navigate = useNavigate();
  const [isAdmin] = useState(() => getAdminStatus());
  const [adminKeyVisible, setAdminKeyVisible] = useState(false);
  const [newSubKey, setNewSubKey] = useState(null);
  const { config, updateConfig, resetConfig } = useAdminConfigStore();
  const { viewMode, setViewMode } = useUIStore();
  const [snapshot, setSnapshot] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(true);
  const [telemetryError, setTelemetryError] = useState(null);


  // Load telemetry every few seconds (only if admin)
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    async function loadTelemetry() {
      try {
        setTelemetryError(null);
        const snap = await Promise.resolve(getTelemetrySnapshot());
        if (!cancelled) {
          setSnapshot(snap || null);
          setLoadingTelemetry(false);
        }
      } catch (err) {
        console.error("Telemetry load error", err);
        if (!cancelled) {
          setTelemetryError("Telemetry is offline right now.");
          setLoadingTelemetry(false);
        }
      }
    }
    loadTelemetry();
    const id = setInterval(loadTelemetry, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const events = snapshot?.events ?? [];
  const counts = snapshot?.counts ?? {};
  const totalEvents = snapshot?.total ?? events.length;
  const lastUpdated = snapshot?.lastUpdated
    ? new Date(snapshot.lastUpdated).toLocaleTimeString()
    : null;

  function handleConfigChange(field, value) {
    updateConfig({ [field]: value });
  }

  function handleResetToDefaults() {
    if (window.confirm("Reset all admin text back to defaults?")) {
      resetConfig();
    }
  }

  const handleGenerateSubKey = (role) => {
    const key = generateSubKey(role);
    setNewSubKey(key);
  };

  const handleClearAdminKey = () => {
    if (window.confirm("Clear admin access? You will need to re-enter the admin key.")) {
      clearAdminKey();
      navigate("/");
    }
  };

  // Show access denied if not admin
  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  return (
    <div className="lux-shell py-8 md:py-10 lg:py-12 space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Admin · God-Eye Console
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              WellnessCafe OS control room
            </h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              This is your private control panel. You can watch how the OS is
              behaving and adjust the words, tone, and guidance it shows to
              everyone else.
            </p>
            
            {/* View mode toggle */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
              <span className="uppercase tracking-[0.18em] text-[10px]">
                View mode:
              </span>
              <button
                type="button"
                onClick={() => setViewMode("user")}
                className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                  viewMode === "user"
                    ? "bg-background text-foreground border-border"
                    : "border-transparent text-muted-foreground hover:border-border/50"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setViewMode("adminPreview")}
                className={`px-2 py-0.5 rounded-full text-[11px] border transition-colors ${
                  viewMode === "adminPreview"
                    ? "bg-background text-foreground border-border"
                    : "border-transparent text-muted-foreground hover:border-border/50"
                }`}
              >
                Admin preview
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="inline-flex items-center justify-center rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Reset all text to defaults
            </button>
          </div>
        </header>

        {/* Top row: System overview + Agents */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* System overview */}
          <section className="lux-card p-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              System overview
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Total events seen</p>
                <p className="text-lg font-semibold">
                  {loadingTelemetry ? "…" : totalEvents || 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">AI actions</p>
                <p className="text-lg font-semibold">
                  {counts.actions ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Page views</p>
                <p className="text-lg font-semibold">
                  {counts.pages ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Errors</p>
                <p className="text-lg font-semibold text-destructive">
                  {counts.errors ?? 0}
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {telemetryError
                ? telemetryError
                : lastUpdated
                  ? `Updated ${lastUpdated}`
                  : "Waiting for first events…"}
            </p>
          </section>

          {/* Agent status */}
          <section className="lux-card p-4 space-y-3 md:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              AI agents · quick view
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">
                  Seer
                </p>
                <p className="text-xs">
                  Reads patterns from telemetry and memory. Helps you see repeat
                  loops and stuck spots.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">
                  Oracle
                </p>
                <p className="text-xs">
                  Turns what it sees into clear guidance and next-right-step
                  suggestions.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">
                  Overseer
                </p>
                <p className="text-xs">
                  Watches the whole OS flow and keeps things aligned with your
                  intentions.
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/40 p-3">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">
                  Sentinel
                </p>
                <p className="text-xs">
                  Looks for risk, overwhelm, and crisis language so the OS can
                  slow down and respond with care.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              These descriptions are fixed so far. Later we can make each agent
              fully configurable from here.
            </p>
          </section>
        </div>

        {/* Middle: Live telemetry list */}
        <section className="lux-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Live event stream
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Showing the last {Math.min(events.length, 12)} events the OS saw.
            </p>
          </div>
          {loadingTelemetry && (
            <p className="text-xs text-muted-foreground">
              Listening for events…
            </p>
          )}
          {!loadingTelemetry && !events.length && (
            <p className="text-xs text-muted-foreground">
              No events yet. As you click around the OS, they will start to
              appear here.
            </p>
          )}
          {!loadingTelemetry && events.length > 0 && (
            <ul className="space-y-2 text-xs">
              {events.slice(0, 12).map((evt, idx) => {
                const type = evt.type || evt.kind || "event";
                const name = evt.name || evt.event || evt.label || "Unknown";
                const timeValue = evt.timestamp || evt.at || evt.time;
                const time =
                  timeValue != null
                    ? new Date(timeValue).toLocaleTimeString()
                    : "—";

                return (
                  <li
                    key={`${time}-${name}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {type}
                      </span>
                      <span className="text-xs font-medium">{name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {time}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Bottom: Content controls */}
        <section className="lux-card p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Words the world sees
              </h2>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                Change the copy that shows on the Home page and key cards. This
                lets you update language without touching code.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 text-xs">
            {/* Home hero text */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Home hero
              </p>
              <label htmlFor="homeHeroEyebrow" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Eyebrow line
                </span>
                <input
                  id="homeHeroEyebrow"
                  name="homeHeroEyebrow"
                  type="text"
                  value={config.homeHeroEyebrow}
                  onChange={(e) =>
                    handleConfigChange("homeHeroEyebrow", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label htmlFor="homeHeroHeadline" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Main headline
                </span>
                <input
                  id="homeHeroHeadline"
                  name="homeHeroHeadline"
                  type="text"
                  value={config.homeHeroHeadline}
                  onChange={(e) =>
                    handleConfigChange("homeHeroHeadline", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label htmlFor="homeHeroBody" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Body text
                </span>
                <textarea
                  id="homeHeroBody"
                  name="homeHeroBody"
                  rows={3}
                  value={config.homeHeroBody}
                  onChange={(e) =>
                    handleConfigChange("homeHeroBody", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label htmlFor="homeHeroPrimaryCta" className="block space-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    Primary button label
                  </span>
                  <input
                    id="homeHeroPrimaryCta"
                    name="homeHeroPrimaryCta"
                    type="text"
                    value={config.homeHeroPrimaryCta}
                    onChange={(e) =>
                      handleConfigChange("homeHeroPrimaryCta", e.target.value)
                    }
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label htmlFor="homeHeroSecondaryCta" className="block space-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    Secondary button label
                  </span>
                  <input
                    id="homeHeroSecondaryCta"
                    name="homeHeroSecondaryCta"
                    type="text"
                    value={config.homeHeroSecondaryCta}
                    onChange={(e) =>
                      handleConfigChange("homeHeroSecondaryCta", e.target.value)
                    }
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            </div>

            {/* Card text controls */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Card subtitles
              </p>
              <label htmlFor="recoverySubtitle" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Recovery card subtitle
                </span>
                <textarea
                  id="recoverySubtitle"
                  name="recoverySubtitle"
                  rows={2}
                  value={config.recoverySubtitle}
                  onChange={(e) =>
                    handleConfigChange("recoverySubtitle", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>
              <label htmlFor="toolsSubtitle" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Tools card subtitle
                </span>
                <textarea
                  id="toolsSubtitle"
                  name="toolsSubtitle"
                  rows={2}
                  value={config.toolsSubtitle}
                  onChange={(e) =>
                    handleConfigChange("toolsSubtitle", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>
              <label htmlFor="providersSubtitle" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Providers card subtitle
                </span>
                <textarea
                  id="providersSubtitle"
                  name="providersSubtitle"
                  rows={2}
                  value={config.providersSubtitle}
                  onChange={(e) =>
                    handleConfigChange("providersSubtitle", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>
              <label htmlFor="dashboardSubtitle" className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">
                  Dashboard card subtitle
                </span>
                <textarea
                  id="dashboardSubtitle"
                  name="dashboardSubtitle"
                  rows={2}
                  value={config.dashboardSubtitle}
                  onChange={(e) =>
                    handleConfigChange("dashboardSubtitle", e.target.value)
                  }
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </label>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Changes save instantly in your browser. Refresh the Home or
            Dashboard pages to see them live. Later we can move this into
            Firestore so your settings sync across devices.
          </p>
        </section>

        {/* Admin Management Section */}
        <section className="lux-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Admin Access Management
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage admin keys and access control
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Current Admin Key */}
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">Current Admin Key</p>
                <button
                  type="button"
                  onClick={() => setAdminKeyVisible(!adminKeyVisible)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  {adminKeyVisible ? "Hide" : "Show"}
                </button>
              </div>
              {adminKeyVisible && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getAdminKey() || "Not set"}
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(getAdminKey() || "");
                      alert("Admin key copied to clipboard");
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Generate Sub-Keys */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Generate Sub-Keys</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSubKey("viewer")}
                  className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Generate Viewer Key
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSubKey("editor")}
                  className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Generate Editor Key
                </button>
              </div>
              {newSubKey && (
                <div className="mt-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3">
                  <p className="text-[11px] text-amber-300 mb-1">New Sub-Key Generated:</p>
                  <code className="text-xs text-amber-200 break-all">{newSubKey}</code>
                  <p className="text-[10px] text-amber-300/80 mt-2">
                    Save this key securely. It can be shared with team members.
                  </p>
                </div>
              )}
            </div>

            {/* Clear Admin Key */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleClearAdminKey}
                className="rounded-full border border-destructive/60 px-3 py-1.5 text-[11px] text-destructive hover:bg-destructive/10 transition-colors"
              >
                Clear Admin Access
              </button>
              <p className="text-[10px] text-muted-foreground mt-1">
                This will log you out of admin mode. You&apos;ll need to re-enter the admin key.
              </p>
            </div>
          </div>
        </section>
    </div>
  );
};

export default AdminConsolePage;
