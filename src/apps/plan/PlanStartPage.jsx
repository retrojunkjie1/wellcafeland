import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, ArrowRight, Brain, HeartHandshake, HeartPulse, Sparkles } from "lucide-react";
import { navigateToTool } from "@/navigation/toolReturn";

const DOMAIN_ICONS = { body: Activity, mind: Brain, spirit: Sparkles };
const DOMAIN_LABELS = { body: "Body", mind: "Mind", spirit: "Spirit" };
const PLAN_ACTIONS = [
  {
    title: "Try a practice",
    detail: "Choose a visual or spoken practice at your own pace.",
    action: "Open Daily Practice",
    icon: Activity,
    path: "/tools",
    tone: "amber",
  },
  {
    title: "Check in",
    detail: "Save what you choose to share with yourself.",
    action: "Start a check-in",
    icon: HeartPulse,
    path: "/check-in",
    tone: "teal",
  },
  {
    title: "Find human support",
    detail: "Explore local resources or professional support.",
    action: "Explore support",
    icon: HeartHandshake,
    path: "/assistance",
    tone: "sage",
  },
];

const PlanStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan || null;
  const planReason = location.state?.reason || "";
  const summary = plan?.summary || null;
  const firstThree = Array.isArray(summary?.firstThree) ? summary.firstThree : [];
  const riskLevel = summary?.riskLevel || "green";
  const escalationPhrase = summary?.escalationPhrase || null;
  const showSafetyNotice = Boolean(escalationPhrase) && ["yellow", "orange", "red"].includes(riskLevel);
  const hasGeneratedPlan = Boolean(plan?.ok && summary);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_top_right,rgba(220,190,112,0.12),transparent_45%),linear-gradient(145deg,rgba(25,37,45,0.96),rgba(10,15,25,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-10">
          <div className="flex items-center gap-3 text-amber-200/80">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-100/20 bg-amber-100/[0.06]">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Your next step</span>
          </div>
          {hasGeneratedPlan ? (
            <>
              <h1 className="mt-6 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">{summary.headline || "A plan shaped by your choices"}</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/65">This is a starting point from the choices you shared. Keep what fits, skip what doesn’t, and change direction any time.</p>
              {summary.todayPriority && (
                <div className="mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border border-amber-100/20 bg-amber-100/[0.06] px-4 py-3">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(253,230,138,0.65)]" />
                  <span className="min-w-0 text-sm text-amber-50 sm:text-base">{summary.todayPriority}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-6 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">No personal plan is available here</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/65">{planReason === "account-required" ? "A personal plan can be created with a signed-in account. You can sign in and finish setup, or continue with the guest support options below." : "There are no generated recommendations to show in this view. Choose any next step below, or return home."}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {planReason === "account-required" && <button type="button" onClick={() => navigate("/login", { state: { from: { pathname: "/onboarding", search: "?retryPlan=1" } } })} className="min-h-11 rounded-full bg-amber-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Sign in to create your plan</button>}
                <button type="button" onClick={() => navigate("/onboarding?retryPlan=1")} className="min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/80 transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Return to setup</button>
              </div>
            </>
          )}
        </header>

        {showSafetyNotice && (
          <section role="status" className="mb-7 rounded-2xl border border-amber-300/25 bg-amber-300/[0.07] p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-amber-100">{escalationPhrase}</p>
          </section>
        )}

        {hasGeneratedPlan && firstThree.length > 0 && (
          <section className="mb-8">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">From your plan</p>
                <h2 className="mt-1 text-xl font-medium">A few options to consider</h2>
              </div>
              <span className="hidden text-xs text-white/40 sm:inline">You choose what fits</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {firstThree.map((item, index) => {
                const domain = ["body", "mind", "spirit"].includes(item.domain) ? item.domain : "mind";
                const Icon = DOMAIN_ICONS[domain];
                const path = domain === "body" ? "/tools/breathing" : domain === "mind" ? "/tools/grounding" : "/tools/journaling";
                return (
                  <button key={item.id || `${domain}-${index}`} type="button" onClick={() => navigateToTool(navigate, path, location)} className="group min-h-36 rounded-3xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:-translate-y-0.5 hover:border-amber-100/30 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                    <div className="flex items-center justify-between gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/20 text-amber-100/80"><Icon aria-hidden="true" className="h-5 w-5" /></span>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/45">{DOMAIN_LABELS[domain]}</span>
                    </div>
                    <span className="mt-5 block text-base font-medium text-white/90">{item.title || "Explore this option"}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-100/70">{Number.isFinite(item.durationMinutes) && item.durationMinutes > 0 ? `${item.durationMinutes} min · ` : ""}Open option <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section aria-label="Choose a WellnessCafe pathway">
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Choose your path</p>
            <h2 className="mt-1 text-xl font-medium">What would help now?</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {PLAN_ACTIONS.map(({ title, detail, action, icon: _Icon, path, tone }) => (
              <button key={title} type="button" onClick={() => navigate(path)} className="group flex min-h-44 flex-col rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 text-left shadow-[0_14px_40px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:p-6">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${tone === "amber" ? "border-amber-100/20 bg-amber-100/[0.07] text-amber-100" : tone === "teal" ? "border-teal-100/20 bg-teal-100/[0.06] text-teal-100" : "border-emerald-100/20 bg-emerald-100/[0.06] text-emerald-100"}`}><_Icon aria-hidden="true" className="h-5 w-5" /></span>
                <span className="mt-5 text-lg font-medium">{title}</span>
                <span className="mt-1 flex-1 text-sm leading-relaxed text-white/55">{detail}</span>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-amber-100/85">{action}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </button>
            ))}
          </div>
        </section>

        <button type="button" onClick={() => navigate("/")} className="mt-7 min-h-11 rounded-full px-4 text-sm text-white/55 underline decoration-white/20 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200">Return to WellnessCafe home</button>
      </div>
    </main>
  );
};

export default PlanStartPage;
