// src/apps/ai/SessionTemplateDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { trackAction, trackPageView } from "../../services/telemetry";
import { callAiSession } from "@/services/aiSessionClient";

const SessionTemplateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Template may be passed from the list page via location.state
  const initialTemplate = location.state?.template || null;

  const [template, setTemplate] = useState(initialTemplate);
  const [sessionPlan, setSessionPlan] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const headline = template?.title || "Session";
    document.title = `${headline} - WellnessCafe Session`;
    trackPageView("session_template_detail");
  }, [template]);

  // If we ever want to hydrate template by ID from backend later,
  // we can add a fetch here. For now, we rely on passed state.
  useEffect(() => {
    if (!template && id) {
      // Fallback template if user hits URL directly
      setTemplate({
        id,
        title: decodeURIComponent(id),
        summary:
          "A guided session to help you slow down, breathe, and reconnect with yourself.",
      });
    }
  }, [id, template]);

  async function handleStartSession() {
    if (!template) return;

    try {
      setLoadingSession(true);
      setError(null);
      setSessionPlan(null);
      setStepIndex(0);

      trackAction("session_started", {
        templateId: template.id || template.slug || template.title,
      });

      const data = await callAiSession({
        mode: "session",
        templateId: template.id || template.slug || template.title,
      });
      const plan = data.sessionPlan || data.session || data.plan;

      if (!plan || !Array.isArray(plan.steps)) {
        throw new Error("Session plan missing or invalid.");
      }

      setSessionPlan(plan);
    } catch (err) {
      console.error("Session start error:", err);
      setError(
        err.code === "AUTH_REQUIRED" ? "Please sign in to continue." : "We couldn't start this session right now. Try again in a moment."
      );
    } finally {
      setLoadingSession(false);
    }
  }

  function handleBackToList() {
    navigate("/sessions/templates");
  }

  function handleNext() {
    if (!sessionPlan?.steps?.length) return;
    setStepIndex((prev) =>
      prev + 1 < sessionPlan.steps.length ? prev + 1 : prev
    );
  }

  function handlePrevious() {
    if (!sessionPlan?.steps?.length) return;
    setStepIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  }

  const currentStep =
    sessionPlan?.steps && sessionPlan.steps[stepIndex]
      ? sessionPlan.steps[stepIndex]
      : null;

  const headline = template?.title || "Session";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top back link */}
        <button
          type="button"
          onClick={handleBackToList}
          className="mb-6 text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back to sessions
        </button>

        {/* Header */}
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Guided session
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            {headline}
          </h1>
          <p className="text-sm text-muted-foreground">
            {template?.summary ||
              template?.aiSummary ||
              "A short practice you can use whenever you feel off-center, overwhelmed, or stuck."}
          </p>
        </header>

        {/* Meta row */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {template?.intent && (
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1">
              {template.intentLabel ||
                template.intent.replace(/_/g, " ").toLowerCase()}
            </span>
          )}
          {(template?.durationMinutes ||
            template?.totalMinutes ||
            template?.estimatedMinutes) && (
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1">
              ~
              {template.durationMinutes ||
                template.totalMinutes ||
                template.estimatedMinutes}{" "}
              min
            </span>
          )}
          {template?.difficulty && (
            <span className="inline-flex items-center rounded-full border border-border px-3 py-1">
              {template.difficulty}
            </span>
          )}
        </div>

        {/* If a session is not yet started, show intro + button */}
        {!sessionPlan && (
          <div className="mb-8 rounded-xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
            <p className="mb-3">
              When you start, we&apos;ll guide you step by step. You don&apos;t
              have to remember anything. Just follow the words, notice your
              body, and breathe.
            </p>
            <p className="mb-4">
              You can always pause, take your time, or leave and come back
              later.
            </p>

            {error && (
              <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleStartSession}
              disabled={loadingSession}
              className="inline-flex items-center justify-center rounded-full border border-foreground px-5 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-60"
            >
              {loadingSession ? "Preparing your session…" : "Start this session"}
            </button>
          </div>
        )}

        {/* If session is active, show simple player */}
        {sessionPlan && (
          <div className="rounded-xl border border-border bg-card/70 p-5">
            {error && (
              <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
                {error}
              </div>
            )}

            {/* We do NOT show "Step 1 of X"; just the current part */}
            {currentStep && (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  Current part
                </p>
                <h2 className="mb-2 text-sm font-semibold leading-snug">
                  {currentStep.title || "Guided step"}
                </h2>
                {currentStep.description && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    {currentStep.description}
                  </p>
                )}

                {/* Script or guidance */}
                {currentStep.script && (
                  <div className="mb-4 whitespace-pre-line rounded-lg bg-background/60 px-3 py-3 text-xs leading-relaxed">
                    {currentStep.script}
                  </div>
                )}

                {currentStep.prompt && !currentStep.script && (
                  <div className="mb-4 whitespace-pre-line rounded-lg bg-background/60 px-3 py-3 text-xs leading-relaxed">
                    {currentStep.prompt}
                  </div>
                )}

                {/* Very simple body for breathing / reflection steps */}
                {currentStep.kind === "breath" && !currentStep.script && (
                  <div className="mb-4 rounded-lg bg-background/60 px-3 py-3 text-xs leading-relaxed">
                    Follow the breathing cues in your own rhythm. Inhale,
                    exhale, and soften the muscles around your eyes, jaw, and
                    shoulders.
                  </div>
                )}

                {currentStep.kind === "reflection" && !currentStep.script && (
                  <div className="mb-4 rounded-lg bg-background/60 px-3 py-3 text-xs leading-relaxed">
                    Take a moment to notice what is coming up. You can name it
                    silently or write it down after this step if that helps.
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={stepIndex === 0}
                    className="rounded-full border border-border px-4 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    Back
                  </button>
                  <div className="flex-1 text-center text-[11px] text-muted-foreground">
                    You can always pause. Listen to your body.
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      !sessionPlan?.steps ||
                      stepIndex >= sessionPlan.steps.length - 1
                    }
                    className="rounded-full border border-foreground px-4 py-1.5 text-xs font-medium hover:bg-foreground hover:text-background disabled:opacity-40"
                  >
                    {stepIndex >= (sessionPlan?.steps?.length || 1) - 1
                      ? "End"
                      : "Next"}
                  </button>
                </div>
              </div>
            )}

            {!currentStep && (
              <div className="text-sm text-muted-foreground">
                This session has finished. Take a moment, breathe, and notice
                how you feel before you move on.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTemplateDetailPage;

