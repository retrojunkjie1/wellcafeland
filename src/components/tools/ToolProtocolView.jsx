import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronRight, CircleHelp } from "lucide-react";
import { logToolSessionBegin, logToolSessionComplete } from "@/services/toolSessionLogger";

function SafetyDetails({ message }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="rounded-2xl border border-amber-200/15 bg-amber-100/[0.035] p-4 sm:p-5">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm font-medium text-amber-100/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <span className="inline-flex items-center gap-2"><CircleHelp aria-hidden="true" className="h-4 w-4" />Need more support?</span>
        {expanded ? <ChevronDown aria-hidden="true" className="h-4 w-4" /> : <ChevronRight aria-hidden="true" className="h-4 w-4" />}
      </button>
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-amber-100/10 pt-3 text-sm leading-relaxed text-white/70">
          <p>{message || "This practice is optional. You can stop and choose another kind of support at any time."}</p>
          <p>In the U.S., call or text <a className="font-medium text-amber-200 underline underline-offset-4" href="tel:988">988</a> for crisis support. If anyone is in immediate danger, contact local emergency services.</p>
        </div>
      )}
    </section>
  );
}

/** A brief, self-paced practice. Steps are invitations; nothing is timed or scored. */
export function ToolProtocolView({ tool, onClose }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const steps = Array.isArray(tool?.steps) ? tool.steps : [];
  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const progress = steps.length ? Math.round(((stepIndex + (completed ? 1 : 0)) / steps.length) * 100) : 0;

  if (!tool) return null;

  const close = () => {
    onClose?.();
    navigate("/tools");
  };

  const begin = async () => {
    setSessionStarted(true);
    try {
      await logToolSessionBegin(tool.slug || tool.id);
    } catch (error) {
      if (import.meta.env.DEV) console.debug("[ToolProtocolView] log begin", error?.message);
    }
  };

  const finish = () => {
    setCompleted(true);
    void logToolSessionComplete({ slug: tool.slug || tool.id, completed: true }).catch(() => {});
  };

  const leave = () => {
    if (sessionStarted && !completed) {
      void logToolSessionComplete({ slug: tool.slug || tool.id, completed: false }).catch(() => {});
    }
    close();
  };

  const next = () => {
    if (isLastStep) finish();
    else setStepIndex((index) => Math.min(steps.length - 1, index + 1));
  };

  const skip = () => {
    if (isLastStep) finish();
    else setStepIndex((index) => Math.min(steps.length - 1, index + 1));
  };

  return (
    <main className="wc-tool-detail mx-auto min-h-screen w-full max-w-3xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
      <button
        type="button"
        onClick={leave}
        className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.035] px-4 text-sm text-white/75 transition hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to practices
      </button>

      <header className="mb-6 space-y-3 sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-200/80">A practice, at your pace</p>
        <h1 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">{tool.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
          {tool.clinicalIntent || "A few optional ideas to try. Keep what helps, skip what does not, and stop whenever you like."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {(Array.isArray(tool.category) ? tool.category : [tool.category]).filter(Boolean).map((category) => (
            <span key={category} className="rounded-full border border-white/15 bg-white/[0.035] px-3 py-1 text-xs text-white/70">{category}</span>
          ))}
          {tool.durationSec > 0 && <span className="rounded-full border border-white/15 bg-white/[0.035] px-3 py-1 text-xs text-white/70">About {Math.max(1, Math.round(tool.durationSec / 60))} min · take less or more</span>}
        </div>
      </header>

      {!sessionStarted ? (
        <section className="wc-tool-session-panel space-y-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div>
            <h2 className="text-lg font-medium text-white">Make it your own</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/65">There are {steps.length} small invitations here. Follow one, skip any, or simply leave. Nothing is timed and there are no ratings to complete.</p>
          </div>
          <details className="group rounded-2xl border border-white/10 bg-black/10 p-4">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/80 [&::-webkit-details-marker]:hidden">
              <span>When this may fit</span><ChevronDown aria-hidden="true" className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            {tool.indications?.length > 0 && <p className="pt-2 text-sm leading-relaxed text-white/65">{tool.indications.join(" · ")}</p>}
            {tool.contraindications?.length > 0 && <p className="pt-3 text-sm leading-relaxed text-white/65">You can change or stop if any part does not feel right. {tool.contraindications.join(" ")}</p>}
          </details>
          <button type="button" onClick={begin} className="min-h-12 w-full rounded-full bg-amber-300 px-6 text-base font-semibold text-slate-950 shadow-[0_8px_28px_rgba(245,196,82,0.16)] transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
            Start when ready
          </button>
        </section>
      ) : completed ? (
        <section role="status" aria-live="polite" className="wc-tool-session-panel rounded-3xl border border-emerald-200/20 bg-emerald-100/[0.04] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-200/10 text-emerald-200"><Check aria-hidden="true" className="h-5 w-5" /></span>
            <div>
              <h2 className="text-xl font-medium text-white">You can leave it here.</h2>
              <p className="mt-2 text-base leading-relaxed text-white/70">Thank you for taking a moment. There is no need to explain how it went or make anything different before you move on.</p>
            </div>
          </div>
          {tool.aftercare?.length > 0 && <div className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4"><h3 className="text-sm font-medium text-white/85">If you want to carry something with you</h3><ul className="mt-2 space-y-2 text-sm leading-relaxed text-white/65">{tool.aftercare.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ul></div>}
          <button type="button" onClick={close} className="mt-6 min-h-12 w-full rounded-full bg-amber-300 px-6 text-base font-semibold text-slate-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Return to practices</button>
        </section>
      ) : (
        <section className="wc-tool-session-panel rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white/65">
              <span>Step {stepIndex + 1} of {steps.length}</span><span>{progress}%</span>
            </div>
            <div role="progressbar" aria-label="Practice progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={stepIndex + 1} className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-200 transition-[width] duration-500" style={{ width: `${Math.max(progress, Math.round((1 / steps.length) * 100))}%` }} />
            </div>
          </div>
          <div key={stepIndex} role="group" aria-live="polite" aria-atomic="true" className="min-h-44 rounded-2xl border border-amber-200/15 bg-amber-100/[0.035] p-5 sm:min-h-52 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/80">Take what is useful</p>
            <h2 className="mt-3 text-2xl font-medium leading-snug text-white sm:text-3xl">{currentStep?.label}</h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{currentStep?.description}</p>
            {currentStep?.durationSec && <p className="mt-4 text-sm text-white/50">A gentle suggestion: around {currentStep.durationSec} seconds. There is no timer.</p>}
          </div>
          <SafetyDetails message={tool.whenToEscalate} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={isFirstStep} className="min-h-12 rounded-full border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Previous</button>
            <button type="button" onClick={next} className="min-h-12 rounded-full bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">{isLastStep ? "Finish this practice" : "Continue"}</button>
          </div>
          {!isLastStep && <button type="button" onClick={skip} className="mt-3 min-h-11 w-full rounded-full text-sm text-white/55 underline decoration-white/25 underline-offset-4 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Skip this idea</button>}
          <button type="button" onClick={leave} className="mt-3 min-h-11 w-full text-sm text-white/55 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">End and leave</button>
        </section>
      )}

      {tool.whenToEscalate && !sessionStarted && <div className="mt-5"><SafetyDetails message={tool.whenToEscalate} /></div>}
    </main>
  );
}
