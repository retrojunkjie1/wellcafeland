// src/apps/recovery/RecoveryPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { trackPageView, trackAction } from "../../services/telemetry";
import {
  getLastSession,
  getStreakStats,
} from "../../services/sessionHistory";
import PageHeader from "@/components/navigation/PageHeader";

const RecoveryPage = () => {
  const navigate = useNavigate();
  const [lastSession, setLastSession] = useState(null);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastSessionAt: null,
  });

  useEffect(() => {
    document.title = "Recovery - WellnessCafe";
    trackPageView("recovery");

    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setLastSession(getLastSession());
      setStreak(getStreakStats());
    }, 0);
  }, []);

  const shortLastTitle = useMemo(() => {
    if (!lastSession?.title) return null;
    if (lastSession.title.length <= 36) return lastSession.title;
    return lastSession.title.slice(0, 33) + "…";
  }, [lastSession]);

  function handleRepeatLast() {
    if (!lastSession) return;

    trackAction("recovery_repeat_last_from_recovery", {
      id: lastSession.id,
    });

    navigate(
      `/sessions/view/${encodeURIComponent(
        lastSession.id || "last-session"
      )}`,
      { state: { session: lastSession, from: "recovery_repeat_last" } }
    );
  }

  function handleOpenSessions() {
    trackAction("recovery_open_sessions");
    navigate("/sessions/templates");
  }

  function handleOpenComposer(preset) {
    trackAction("recovery_open_composer_from_recommendation", preset || {});
    navigate("/sessions/templates/new", {
      state: { preset: preset || null },
    });
  }

  // 🧠 very small local "recommender" using time of day + streak + last session
  const recommendations = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const isLate = hour >= 21 || hour < 5;

    const base = [];

    if (streak.currentStreak === 0) {
      base.push({
        id: "start-today",
        title: "Start your first recovery streak",
        summary:
          "A gentle 5-minute grounding flow to mark today as Day 1.",
        supportType: "grounding",
        minutes: 5,
        tone: "calm_and_steady",
        label: "Grounding · 5 min",
      });
    } else {
      base.push({
        id: "keep-streak-alive",
        title: "Keep today's streak alive",
        summary:
          "Short check-in and breathwork to keep your streak going without pressure.",
        supportType: "after_group",
        minutes: 7,
        tone: "calm_and_steady",
        label: "Short reset · 7 min",
      });
    }

    if (isLate || lastSession?.supportType === "sleep") {
      base.push({
        id: "night-reset",
        title: "Night / sleep reset",
        summary:
          "Slow, soft flow to help you come down, breathe, and hand the night over.",
        supportType: "sleep_reset",
        minutes: 10,
        tone: "soft_and_slow",
        label: "Sleep support · 10 min",
      });
    } else {
      base.push({
        id: "craving-reset",
        title: "Cravings / urges reset",
        summary:
          "Fast craving intervention: ride the wave, remember your why, and move your body.",
        supportType: "cravings",
        minutes: 8,
        tone: "firm_and_supportive",
        label: "Cravings · 8 min",
      });
    }

    return base;
  }, [streak.currentStreak, lastSession]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader 
        title="Recovery" 
        subtitle="Track sobriety, urges, triggers, and wins in one calm space"
      />
      <div className="lux-shell py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Client OS · Recovery
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Track sobriety, urges, triggers, and wins in one calm space.
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Start wherever you are. The OS will remember what works and
            gently suggest the next right step.
          </p>
        </header>

        {/* Top row: streak + last session & recommendations */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Streak card */}
          <div className="lux-card p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Recovery streak
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We quietly count days you showed up – not days you
                  failed.
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold leading-none">
                  {streak.currentStreak || 0}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {streak.currentStreak === 0
                    ? "days in a row — start today"
                    : "days in a row"}
                </div>
              </div>
            </div>

            {/* progress bar */}
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/80 transition-all"
                style={{
                  width: `${
                    Math.min(streak.currentStreak || 0, 7) * (100 / 7)
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Longest streak:{" "}
                <span className="font-medium">
                  {streak.longestStreak || 0} days
                </span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/milestones")}
                  className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  <Trophy className="h-3 w-3" />
                  Milestones
                </button>
                <button
                  type="button"
                  onClick={handleOpenSessions}
                  className="underline-offset-2 hover:underline"
                >
                  Sessions
                </button>
              </div>
            </div>

            {/* Last session pill inside card */}
            {lastSession && (
              <button
                type="button"
                onClick={handleRepeatLast}
                className="mt-3 inline-flex items-center justify-between rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
              >
                <span className="truncate">
                  Last session:{" "}
                  <span className="font-medium text-foreground">
                    {shortLastTitle}
                  </span>
                </span>
                <span className="ml-2 shrink-0 text-[10px]">
                  Repeat ▶
                </span>
              </button>
            )}
          </div>

          {/* Recommended panel */}
          <div className="lux-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Recommended for you
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick flows the OS suggests based on your streak, time
                  of day, and last session.
                </p>
              </div>
            </div>

            <div className="mt-1 space-y-2">
              {recommendations.map((rec) => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleOpenComposer(rec)}
                  className="w-full rounded-lg border border-border bg-card/70 px-3 py-3 text-left text-xs hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {rec.label}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Build ▶
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {rec.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {rec.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecoveryPage;
