// src/apps/ai/SessionsTemplatesPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackPageView, trackAction } from "../../services/telemetry";
import { useUIStore } from "../../stores/uiStore";
import { callAiSession } from "@/services/aiSessionClient";

const SessionsTemplatesPage = () => {
  const navigate = useNavigate();
  const { viewMode } = useUIStore();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Legacy AI – restricted scope: Session templates only
  // This uses /aiSession (legacy endpoint) for admin template management
  // NOT for primary conversational AI (that uses /multimodalChat via guideEngine)
  useEffect(() => {
    document.title = "Session Templates - WellnessCafe";
    trackPageView("sessions_templates");
    fetchTemplates();
  }, []);

  async function fetchTemplates(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await callAiSession({
        mode: "templates",
        intent: "recovery_mix",
      });
      const list =
        data.templates ||
        data.sessions ||
        data.items ||
        [];

      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Template load error:", err);
      setError(
        err.code === "AUTH_REQUIRED" ? "Please sign in to continue." : "We couldn't load your sessions right now. Try again in a moment."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleOpenTemplate(template) {
    trackAction("session_template_open", {
      templateId: template.id || template.slug || template.title,
    });

    navigate(
      `/sessions/view/${encodeURIComponent(
        template.id || template.slug || template.title
      )}`,
      {
        state: { template },
      }
    );
  }

  function handleGenerateNew() {
    trackAction("session_template_generate_new", {});
    navigate("/sessions/templates/new");
  }

  return (
    <div className="lux-shell py-10 md:py-12 lg:py-14">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Home / Sessions / Browse templates
          </p>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            Guided support · In your own space
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                AI-guided{" "}
                <span className="underline underline-offset-[6px] decoration-[1.5px]">
                  wellness sessions
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                Short, focused sessions you can use for grounding, cravings,
                anxiety, sleep, and spiritual reset. Choose one that fits how
                you feel right now.
              </p>
              {/* Admin preview hint */}
              {viewMode === "adminPreview" && (
                <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] text-amber-300/90 max-w-md">
                  <p className="font-semibold uppercase tracking-wide mb-1">Admin view</p>
                  <p className="text-[10px] text-amber-200/70">
                    You&apos;re seeing admin preview. Regular users won&apos;t see this hint.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateNew}
                className="inline-flex items-center justify-center rounded-full border border-foreground/30 px-5 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                Generate a custom session
              </button>
              <button
                onClick={() => fetchTemplates(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-60"
              >
                {refreshing ? "Refreshing…" : "Refresh list"}
              </button>
            </div>
          </div>
        </header>

        {/* Search + Filter row */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search for anxiety, cravings, sleep, grounding…"
              className="w-full rounded-full border border-border bg-background/60 px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={() => {
                // placeholder – later we can wire this to local filtering
              }}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              Search
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {["Grounding", "Cravings", "Anxiety", "Sleep", "Spiritual reset"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && !templates.length && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Preparing sessions for you…
          </div>
        )}

        {/* Templates grid */}
        {!loading && templates.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                AI-Suggested Sessions
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Based on common struggles we see every day.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                const id = t.id || t.slug || t.title;
                const duration =
                  t.durationMinutes ||
                  t.estimatedMinutes ||
                  t.totalMinutes ||
                  10;
                const category =
                  t.category ||
                  t.intentLabel ||
                  (t.intent ? t.intent.replace(/_/g, " ") : "General support");

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleOpenTemplate(t)}
                    className="group flex flex-col items-stretch rounded-xl border border-border bg-card/60 px-4 py-4 text-left transition hover:border-foreground/40 hover:bg-card"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        {category}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ~{duration} min
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-semibold leading-snug">
                      {t.title || "Session"}
                    </h3>
                    <p className="mb-3 line-clamp-3 text-xs text-muted-foreground">
                      {t.summary ||
                        t.aiSummary ||
                        "A guided practice to help you settle, breathe, and reconnect to yourself."}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Tap to see details</span>
                      <span className="opacity-80 group-hover:opacity-100">
                        Start ▶
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!loading && !templates.length && !error && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No sessions available yet. Try generating a custom one.
          </div>
        )}

        {/* Secondary section (static, non-technical) */}
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Ways you can use these sessions
          </h2>
          <div className="grid gap-4 md:grid-cols-3 text-xs text-muted-foreground">
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <p className="font-medium text-foreground mb-1">
                Daily reset
              </p>
              <p>
                Use a 5–10 minute session after work or group to clear your
                head and land back in your body.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <p className="font-medium text-foreground mb-1">
                Before hard conversations
              </p>
              <p>
                Run a grounding session before calls with family, court,
                employers, or anyone that spikes your stress.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <p className="font-medium text-foreground mb-1">
                Night support
              </p>
              <p>
                Use slower, softer flows when your mind races at night and you
                need something to hold you steady.
              </p>
            </div>
          </div>
        </section>
      </div>
  );
};

export default SessionsTemplatesPage;
