import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, MousePointer2 } from "lucide-react";

export default function GettingStartedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "How to use WellnessCafe";
  }, []);

  return (
    <main className="wc-getting-started mx-auto flex min-h-[calc(100dvh-9rem)] max-w-3xl items-center justify-center px-4 py-8 text-white sm:px-6">
      <section className="wc-getting-started__card w-full rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-100/[0.08] via-slate-900/90 to-slate-950 p-6 shadow-2xl sm:p-10" aria-labelledby="tour-title">
        <div className="wc-getting-started__icon flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200/25 bg-amber-200/[0.08] text-amber-100">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="wc-getting-started__eyebrow mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/75">A one-minute walkthrough</p>
        <h1 id="tour-title" className="wc-getting-started__title mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">See how WellnessCafe works</h1>
        <p className="wc-getting-started__description mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          We’ll take you to the home screen and point out the real controls as you move through them. Nothing to fill out, and you can leave the walkthrough at any time.
        </p>
        <button
          type="button"
          onClick={() => navigate("/home?tour=home")}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-200 px-6 text-base font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100"
        >
          <MousePointer2 className="h-4 w-4" aria-hidden="true" />
          Start the walkthrough
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="wc-getting-started__note mt-4 text-sm text-white/45">It highlights the actual home screen and menu. It does not change your account or settings.</p>
      </section>
    </main>
  );
}
