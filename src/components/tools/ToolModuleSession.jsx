import React from "react";
import { ArrowLeft, CircleCheck } from "lucide-react";

export default function ToolModuleSession({
  title,
  description,
  onClose,
  completed = false,
  children,
}) {
  return (
    <main className="mx-auto min-h-full w-full max-w-3xl px-4 py-5 pb-10 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm text-white/65 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to tools
      </button>

      <header className="mb-6 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200/65">Daily practice</p>
        <h1 className="text-2xl font-light tracking-wide text-white sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-white/60">{description}</p>}
      </header>

      {completed ? (
        <section aria-live="polite" className="rounded-2xl border border-emerald-200/15 bg-emerald-100/[0.04] p-6 sm:p-8">
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
        </section>
      ) : (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          {children}
        </section>
      )}
    </main>
  );
}
