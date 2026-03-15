// src/apps/ai/SessionComposerPage.jsx

import React, { useEffect, useState } from "react";
import { trackPageView, trackAction } from "../../services/telemetry";
import { callAiSession } from "@/services/aiSessionClient";

const CATEGORIES = [
  { id: "grounding", label: "Grounding" },
  { id: "cravings", label: "Cravings / urges" },
  { id: "anxiety", label: "Anxiety / panic" },
  { id: "sleep", label: "Night / sleep reset" },
  { id: "spiritual_reset", label: "Spiritual reset" },
  { id: "before_group", label: "Before group / work" },
  { id: "after_conflict", label: "After conflict" },
];

const SessionComposerPage = () => {
  const [category, setCategory] = useState("grounding");
  const [tone, setTone] = useState("calm");
  const [notes, setNotes] = useState("");
  const [minutes, setMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Custom AI session - WellnessCafe";
    trackPageView("session_composer");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      trackAction("session_composer_submit", {
        category,
        tone,
        minutes,
      });

      // Generate correlation ID for tracing
      const correlationId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const data = await callAiSession({
        mode: "generate_session",
        supportType: category,
        tone: tone,
        minutes: minutes,
        note: notes,
        correlationId,
      });
      
      // Parse standardized response schema
      if (data.ok === false) {
        // Error response
        const errorText = data.message?.text || data.error?.message || "I'm having trouble building your session right now. Please try again in a moment.";
        setError(errorText);
        return;
      }

      // Success response - extract session from message.text or session object
      let session = null;
      
      if (data.session) {
        // Backward compatibility: session object exists
        session = data.session;
      } else if (data.message?.text) {
        // New format: session content in message.text, metadata in message.meta
        const meta = data.message.meta || {};
        session = {
          id: meta.sessionId,
          title: meta.title || category,
          durationMinutes: meta.durationMinutes || minutes,
          category: meta.category || category,
          // Parse text into structured format
          opening: data.message.text.split("\n\n")[0] || "",
          body: data.message.text.split("\n\n").slice(1) || [],
          closing: "",
        };
      } else {
        // Fallback
        session = data;
      }

      // Transform backend format to frontend format if needed
      if (session && session.steps && Array.isArray(session.steps)) {
        // Backend returns steps as objects with title/body
        const transformed = {
          ...session,
          opening: session.steps[0]?.body || "",
          body: session.steps.map(step => step.body || step.title || "").filter(Boolean),
          closing: session.steps[session.steps.length - 1]?.body || "",
        };
        setResult(transformed);
      } else if (session.opening || session.body) {
        // Already in frontend format
        setResult(session);
      } else {
        // Fallback: use text content
        setResult({
          opening: session.title || "",
          body: [data.message?.text || JSON.stringify(session)],
          closing: "",
        });
      }
    } catch (err) {
      console.error("Generate session error:", err);
      const errorMessage = err.code === "AUTH_REQUIRED"
        ? "Please sign in to continue."
        : err.message?.includes("status")
          ? "Connection issue. Please try again in a moment."
          : "I'm having trouble building your session right now. Please try again in a moment.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const durationLabel = `${minutes} minute${minutes === 1 ? "" : "s"}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-8 space-y-4">
        <header className="mb-6 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Home / Sessions / Create custom session
          </p>
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Build your own flow
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Create a custom AI-guided session
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Tell the OS what you&apos;re facing and how long you have. It will
            build a short script you can use for grounding, cravings, anxiety,
            sleep, or spiritual reset.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-card/60 p-4 md:p-5 space-y-4"
        >
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              What do you need support with?
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-full border px-3 py-1 ${
                    category === c.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  } transition-colors`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone + duration */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                How should this session feel?
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="calm">Calm and steady</option>
                <option value="firm">Firm but kind</option>
                <option value="gentle">Very gentle and soft</option>
                <option value="motivational">Motivational, forward-looking</option>
                <option value="spiritual">Spiritual and grounding</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                How much time do you have?
              </label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                The OS will keep the flow short and simple for {durationLabel}.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Anything you want it to know? (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Example: I just left group and feel shaky about court next week. I don't want heavy religion, just something grounded and honest."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full border border-foreground px-6 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors disabled:opacity-60"
            >
              {loading ? "Building your session…" : "Generate session"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              The OS does not store this in your name. It only uses this to
              shape the session.
            </p>
          </div>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        {result && (
          <section className="rounded-xl border border-border bg-card/40 p-4 md:p-5 text-sm leading-relaxed space-y-4">
            <header>
              <h2 className="text-base font-semibold mb-1">
                Your custom session
              </h2>
              <p className="text-xs text-muted-foreground">
                Read it slowly, or let someone you trust read it to you.
              </p>
            </header>

            <div className="space-y-4 whitespace-pre-line">
              {result.opening && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Opening
                  </h3>
                  <p>{result.opening}</p>
                </div>
              )}

              {result.body && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Main flow
                  </h3>
                  {Array.isArray(result.body) ? (
                    <ol className="list-decimal pl-4 space-y-2">
                      {result.body.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>{result.body}</p>
                  )}
                </div>
              )}

              {result.closing && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Closing
                  </h3>
                  <p>{result.closing}</p>
                </div>
              )}

              {/* Fallback if backend returns a single text blob */}
              {!result.opening && !result.body && !result.closing && (
                <p>
                  {typeof result === "string"
                    ? result
                    : JSON.stringify(result, null, 2)}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SessionComposerPage;

