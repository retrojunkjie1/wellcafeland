// src/apps/ai/SessionPreviewPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSessionFromToken } from "../../services/shareableLinks";
import { trackPageView } from "../../services/telemetry";

const KIND_LABELS = {
  check_in: "Check-in",
  breath: "Breathwork",
  meditation: "Meditation",
  reflection: "Reflection",
  grounding: "Grounding",
  coaching: "Coaching",
};

const SessionPreviewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    trackPageView("session_preview");
    
    let cancelled = false;
    
    const loadSession = () => {
      if (!token) {
        if (!cancelled) {
          setError("Invalid preview link");
          setLoading(false);
        }
        return;
      }

      const sessionData = getSessionFromToken(token);
      
      if (cancelled) return;
      
      if (sessionData) {
        setSession(sessionData);
        document.title = `${sessionData.title || "Session"} - Preview - WellnessCafe`;
      } else {
        setError("This preview link is invalid or has expired.");
        document.title = "Preview not found - WellnessCafe";
      }
      
      setLoading(false);
    };
    
    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(loadSession, 0);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="lux-shell py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="lux-shell py-16">
          <div className="max-w-md mx-auto text-center space-y-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Preview not available
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {error || "This preview link is invalid or has expired."}
            </h1>
            <p className="text-sm text-muted-foreground">
              The link you're trying to access may have expired or been removed.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-foreground px-5 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Go to WellnessCafe
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = session.title || session.name || "Wellness session";
  const minutes =
    session.durationMinutes ||
    session.estimatedMinutes ||
    session.totalMinutes ||
    10;
  const steps = Array.isArray(session.steps) ? session.steps : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-8 space-y-6">
        {/* Preview badge */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/50">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Preview · Shared session
            </p>
            <p className="text-xs text-muted-foreground">
              You are viewing:{" "}
              <span className="font-medium text-foreground">{title}</span>{" "}
              · ~{minutes} min
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:bg-card transition-colors"
          >
            Visit WellnessCafe →
          </button>
        </div>

        {/* Header */}
        <header className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          {session.summary && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {session.summary}
            </p>
          )}
        </header>

        {/* Steps */}
        <section className="space-y-4">
          {steps.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This session doesn&apos;t have a detailed flow yet. You can still
              use the title and summary as a grounding prompt.
            </p>
          )}

          {steps.map((step, index) => {
            const kindLabel =
              KIND_LABELS[step.kind] || step.kind || `Step ${index + 1}`;

            return (
              <div
                key={step.id || index}
                className="lux-card px-4 py-4 text-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} · {kindLabel}
                  </p>
                  {step.estimatedMinutes && (
                    <p className="text-[11px] text-muted-foreground">
                      ~{step.estimatedMinutes} min
                    </p>
                  )}
                </div>

                {step.title && (
                  <h2 className="text-sm font-semibold">{step.title}</h2>
                )}

                {step.script && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {step.script}
                  </p>
                )}

                {step.questions && Array.isArray(step.questions) && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {step.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                )}

                {step.coachingNote && (
                  <p className="mt-2 text-xs text-muted-foreground/80 italic">
                    {step.coachingNote}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-border text-xs text-muted-foreground text-center">
          <p>
            This is a preview of a session shared from{" "}
            <span className="font-medium text-foreground">WellnessCafe</span>.
            To create your own sessions, visit the main site.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SessionPreviewPage;

