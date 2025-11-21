// src/apps/ai/SessionViewerPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { trackPageView, trackAction } from "../../services/telemetry";
import {
  getLastSession,
  saveLastSession,
} from "../../services/sessionHistory";
import { createShareableLink, copyToClipboard } from "../../services/shareableLinks";
import { Share2, Check } from "lucide-react";

const KIND_LABELS = {
  check_in: "Check-in",
  breath: "Breathwork",
  meditation: "Meditation",
  reflection: "Reflection",
  grounding: "Grounding",
  coaching: "Coaching",
};

const SessionViewerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // 1. Decide which session to show
  const session = useMemo(() => {
    // a) Prefer session passed via navigation state
    if (location.state && location.state.session) {
      return location.state.session;
    }
    if (location.state && location.state.template) {
      return location.state.template;
    }

    // b) Fallback to last saved session
    const last = getLastSession();
    if (last) return last;

    return null;
  }, [location.state]);

  // 2. Save as "last session" when opened
  useEffect(() => {
    trackPageView("session_viewer");

    if (session) {
      saveLastSession(session);
    }
  }, [session]);

  // 3. Basic safety: if nothing to show, send them back to Sessions list
  useEffect(() => {
    if (!session) {
      // small delay so it doesn't feel like a hard jump
      const timeout = setTimeout(() => {
        navigate("/sessions/templates");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [session, navigate]);

  if (!session) {
    return (
      <div className="lux-shell py-10 text-sm text-muted-foreground">
        <p>We couldn&apos;t find a session to show. Taking you back to Sessions…</p>
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


  function handleBegin() {
    trackAction("session_viewer_begin", { routeId, minutes });
  }

  function handleRepeat() {
    trackAction("session_viewer_repeat", { routeId, minutes });
    // Use the same viewer route; session is already in storage
    navigate(`/sessions/view/${encodeURIComponent(routeId || title)}`, {
      state: { session },
    });
  }

  function handleDone() {
    trackAction("session_viewer_done", { routeId });
    navigate("/dashboard");
  }

  function handleShare() {
    trackAction("session_viewer_share", { routeId });
    const linkData = createShareableLink(session);
    if (linkData) {
      setShareLink(linkData.url);
    }
  }

  async function handleCopyLink() {
    if (!shareLink) return;
    const success = await copyToClipboard(shareLink);
    if (success) {
      setCopied(true);
      trackAction("session_viewer_copy_link", { routeId });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-8 space-y-6">
        {/* Back + breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
          >
            <span aria-hidden="true">←</span>
            <span>Back to sessions</span>
          </button>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Sessions · Viewer
          </p>
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

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleBegin}
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
          >
            Begin session
          </button>
          <button
            onClick={handleRepeat}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Repeat this session
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button
            onClick={handleDone}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            I&apos;m done for now
          </button>
        </div>

        {/* Share link display */}
        {shareLink && (
          <div className="lux-card px-4 py-3 space-y-2">
            <p className="text-xs font-medium text-foreground">Shareable preview link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-foreground px-3 py-1.5 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  "Copy link"
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Anyone with this link can preview this session. The link doesn&apos;t expire.
            </p>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default SessionViewerPage;
