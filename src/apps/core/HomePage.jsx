// src/apps/core/HomePage.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackAction, trackPageView } from "../../services/telemetry";
import { useAIStore } from "../ai/useAIStore";
import { useAdminConfigStore } from "../../stores/adminConfigStore";

const HomePage = () => {
  const navigate = useNavigate();
  const { startWithPrompt } = useAIStore();
  const { config } = useAdminConfigStore();

  const {
    homeHeroEyebrow,
    homeHeroHeadline,
    homeHeroBody,
    homeHeroPrimaryCta,
    homeHeroSecondaryCta,
    recoverySubtitle,
    toolsSubtitle,
    providersSubtitle,
    dashboardSubtitle,
  } = config;

  useEffect(() => {
    document.title = "WellnessCafe OS - Home";
    trackPageView("home");
  }, []);

  function handleReadMyDay() {
    trackAction("home_read_my_day", {});
    startWithPrompt(
      "Read my day and gently reflect back what you see. Help me notice patterns, stress points, and any small next step I can take."
    );
  }

  function handleBrowseAISessions() {
    trackAction("home_browse_ai_sessions", {});
    navigate("/sessions/templates");
  }

  function handleOpenRecovery() {
    trackAction("home_open_recovery_card", {});
    navigate("/recovery");
  }

  function handleOpenTools() {
    trackAction("home_open_tools_card", {});
    navigate("/tools");
  }

  function handleOpenProviders() {
    trackAction("home_open_providers_card", {});
    navigate("/providers");
  }

  function handleOpenDashboard() {
    trackAction("home_open_dashboard_card", {});
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-amber-50/60 via-background to-background">
        <div className="lux-shell py-10 md:py-14 lg:py-16">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            {homeHeroEyebrow}
          </p>
          <h1 className="text-4xl md:text-[2.8rem] lg:text-[3.2rem] font-semibold tracking-tight leading-[1.15] max-w-3xl">
            Your wellness guide for{" "}
            <span className="underline underline-offset-[6px] decoration-[1.5px]">
              {homeHeroHeadline}
            </span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-2xl">
            {homeHeroBody}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleReadMyDay}
              className="inline-flex items-center justify-center rounded-full border border-foreground px-6 py-2 text-sm font-medium tracking-tight hover:bg-foreground hover:text-background transition-colors"
            >
              {homeHeroPrimaryCta}
            </button>
            <button
              onClick={handleBrowseAISessions}
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-2 text-sm font-medium tracking-tight text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {homeHeroSecondaryCta}
            </button>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            Hint: the orb at the bottom-right speaks OS intelligence.
          </p>
        </div>
      </section>

      {/* Core modules */}
      <section className="lux-shell py-10 md:py-12 lg:py-14 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Your Wellness Tools
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Start anywhere. We&apos;ll connect the dots.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Recovery */}
          <button
            type="button"
            onClick={handleOpenRecovery}
            className="lux-card flex flex-col items-start p-4 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Client OS
            </p>
            <h3 className="mt-1 text-sm font-semibold">Recovery</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {recoverySubtitle}
            </p>
            <span className="mt-3 text-[11px] text-muted-foreground">
              Open →
            </span>
          </button>

          {/* Tools */}
          <button
            type="button"
            onClick={handleOpenTools}
            className="lux-card flex flex-col items-start p-4 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Daily practice
            </p>
            <h3 className="mt-1 text-sm font-semibold">Tools</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {toolsSubtitle}
            </p>
            <span className="mt-3 text-[11px] text-muted-foreground">
              Open →
            </span>
          </button>

          {/* Providers */}
          <button
            type="button"
            onClick={handleOpenProviders}
            className="lux-card flex flex-col items-start p-4 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Network
            </p>
            <h3 className="mt-1 text-sm font-semibold">Providers</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {providersSubtitle}
            </p>
            <span className="mt-3 text-[11px] text-muted-foreground">
              Open →
            </span>
          </button>

          {/* Dashboard */}
          <button
            type="button"
            onClick={handleOpenDashboard}
            className="lux-card flex flex-col items-start p-4 text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Insights
            </p>
            <h3 className="mt-1 text-sm font-semibold">Dashboard</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {dashboardSubtitle}
            </p>
            <span className="mt-3 text-[11px] text-muted-foreground">
              Open →
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
