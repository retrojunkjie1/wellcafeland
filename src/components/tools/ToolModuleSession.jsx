import React from "react";
import { ArrowLeft, ChevronDown, CircleCheck, HeartHandshake, HeartPulse } from "lucide-react";

export default function ToolModuleSession({
  title,
  description,
  onClose,
  onCheckIn,
  onFindSupport,
  completed = false,
  children,
}) {
  return (
    <main className="wc-tool-detail mx-auto min-h-full w-full max-w-3xl px-4 py-5 pb-10 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm text-white/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to tools
      </button>

      <header className="mb-6 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/80">Daily practice</p>
        <h1 className="text-2xl font-light tracking-wide text-white sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-white/60">{description}</p>}
      </header>

      {completed ? (
        <section aria-live="polite" className="wc-tool-session-panel rounded-2xl border border-emerald-200/15 bg-emerald-100/[0.04] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <CircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
            <div>
              <h2 className="text-lg font-medium text-white">Practice complete</h2>
              <p className="mt-1 text-sm leading-relaxed text-white/65">Thank you for taking this time. There’s no need to do anything else before you leave.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/85 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
          >
            Return to tools
          </button>
          {(onCheckIn || onFindSupport) && (
            <details className="mt-4 rounded-xl border border-white/10 bg-black/10 p-3 text-left">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 text-sm font-medium text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
                <span>Need another kind of support?</span>
                <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
              </summary>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {onFindSupport && <button type="button" onClick={onFindSupport} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200/15 px-3 text-left text-sm text-white/80 transition hover:bg-emerald-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-200"><HeartHandshake aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-200" />Find real-world help</button>}
                {onCheckIn && <button type="button" onClick={onCheckIn} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-amber-200/15 px-3 text-left text-sm text-white/80 transition hover:bg-amber-100/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><HeartPulse aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-200" />Check in with myself</button>}
              </div>
            </details>
          )}
        </section>
      ) : (
        <section className="wc-tool-session-panel rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          {children}
        </section>
      )}
    </main>
  );
}
