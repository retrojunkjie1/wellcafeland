import React, { useState } from "react";
import { Check, HandHeart, Moon, Utensils, ClipboardList, UsersRound } from "lucide-react";
import { createToolResult, safeComplete } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const NEEDS = [
  { id: "daily-needs", label: "Food, water, or something basic", icon: Utensils },
  { id: "basic-care", label: "Basic care for myself", icon: HandHeart },
  { id: "responsibility", label: "One thing I need to handle", icon: ClipboardList },
  { id: "connection", label: "Getting help from someone", icon: UsersRound },
  { id: "rest", label: "Rest or fewer demands", icon: Moon },
];

const ACTIONS = {
  "daily-needs": {
    brief: ["Put a drink within reach", "Choose the easiest food available", "Ask someone to bring food or water"],
    fuller: ["Prepare a simple snack or drink", "Gather what I need for the next few hours", "Ask someone to help me get food or water"],
  },
  "basic-care": {
    brief: ["Change position or sit somewhere comfortable", "Use the bathroom or wash my hands", "Check my usual plan for a basic care task"],
    fuller: ["Change into comfortable clothes or wash up", "Set out one thing that will help later", "Take care of one small item from my regular routine"],
  },
  responsibility: {
    brief: ["Start the first two minutes", "Write down the next single step", "Send a short message asking for more time"],
    fuller: ["Work on one small part, then reassess", "Send a brief update to someone waiting on me", "Ask someone to help with one piece"],
  },
  connection: {
    brief: ["Text someone: ‘Could you check in with me today?’", "Open a recovery or peer-support contact", "Ask someone to sit with me or stay on the phone"],
    fuller: ["Call someone I trust for a short check-in", "Choose a recovery or peer-support meeting", "Ask someone to help me make one next-step call"],
  },
  rest: {
    brief: ["Pause one demand for now", "Make my current spot a little more comfortable", "Choose a quiet activity that asks very little"],
    fuller: ["Take a real break from one task", "Ask someone to cover or delay one responsibility", "Settle into a comfortable, low-demand activity"],
  },
};

export default function LowEnergyPlanTool({ onComplete }) {
  const [need, setNeed] = useState("");
  const [capacity, setCapacity] = useState("");
  const [action, setAction] = useState("");
  const [finished, setFinished] = useState(false);

  const actions = capacity === "none"
    ? ["Pause without deciding right now", "Tell someone: ‘I could use help with one small thing’"]
    : ACTIONS[need]?.[capacity] || [];

  const complete = () => {
    const now = Date.now();
    setFinished(true);
    logToolUsage("low-energy-plan", {
      startedAt: now,
      completedAt: now,
      durationMs: 0,
      context: { planCreated: true },
    }).catch(() => {});
    safeComplete(onComplete, createToolResult(
      "low-energy-plan",
      "One Small Step",
      "Chose one low-pressure next step for a low-energy moment.",
      { planCreated: true },
      0
    ));
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <section className="rounded-2xl border border-emerald-200/20 bg-gradient-to-br from-emerald-100/[0.08] to-white/[0.02] p-5 text-white sm:p-6" aria-live="polite">
          <div className="flex items-center gap-3 text-emerald-100"><span className="grid h-10 w-10 place-items-center rounded-full border border-emerald-100/20 bg-emerald-100/10"><Check aria-hidden="true" className="h-5 w-5" /></span><h2 className="text-lg font-semibold">Your next step</h2></div>
          <p className="mt-4 text-lg leading-relaxed text-white/90">{capacity === "none" ? "For now, I can" : `For the next ${capacity === "brief" ? "couple of minutes" : "ten minutes"}, I can`} {action.charAt(0).toLowerCase() + action.slice(1)}.</p>
          <p className="mt-3 text-sm leading-relaxed text-white/60">You can pause, change this, or ask someone to join you. This is an option, not another task you have to complete.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-white">
      <div className="grid grid-cols-3 gap-2" aria-label="Plan steps">
        {[{ label: "Need", done: Boolean(need) }, { label: "Capacity", done: Boolean(capacity) }, { label: "Next step", done: Boolean(action) }].map((step, index) => (
          <div key={step.label} className={`relative overflow-hidden rounded-xl border px-3 py-2.5 ${step.done ? "border-emerald-100/25 bg-emerald-100/[0.07]" : "border-white/10 bg-white/[0.025]"}`}>
            <span className={`block text-[10px] font-semibold uppercase tracking-[.16em] ${step.done ? "text-emerald-100" : "text-white/40"}`}>0{index + 1}</span>
            <span className="mt-1 block text-xs text-white/80">{step.label}</span>
            <span className={`absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-500 ${step.done ? "scale-x-100 bg-emerald-200/75" : "scale-x-0 bg-transparent"}`} />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <h2 className="text-lg font-semibold">What feels most important right now?</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/65">Choose one area. You do not have to catch up on everything.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {NEEDS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={need === id} onClick={() => { setNeed(id); setCapacity(""); setAction(""); }} className="group flex min-h-[4.5rem] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-left text-sm text-white/80 transition hover:-translate-y-0.5 hover:border-sky-200/40 hover:bg-white/[0.06] aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.055] text-sky-200 transition group-hover:scale-105 group-aria-pressed:bg-sky-100/10">{React.createElement(Icon, { "aria-hidden": true, className: "h-5 w-5" })}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {need && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5" aria-live="polite">
          <h2 className="text-base font-semibold">How much capacity do you have for this?</h2>
          <p className="mt-1 text-sm text-white/60">There is no wrong answer, including ‘not right now.’</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { id: "brief", label: "About 2 minutes" },
              { id: "fuller", label: "About 10 minutes" },
              { id: "none", label: "Not able right now" },
            ].map((option) => (
              <button key={option.id} type="button" aria-pressed={capacity === option.id} onClick={() => { setCapacity(option.id); setAction(""); }} className="min-h-[4.25rem] rounded-xl border border-white/15 px-2 py-2 text-xs text-white/75 transition hover:bg-white/5 aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50 sm:text-sm">
                <span className="block text-lg font-medium text-sky-100/80">{option.id === "none" ? "—" : option.id === "brief" ? "02" : "10"}</span><span className="mt-1 block">{option.id === "none" ? "Not now" : "minutes"}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {capacity && (
        <section className="rounded-2xl border border-sky-200/20 bg-sky-100/[0.04] p-4 sm:p-5" aria-live="polite">
          <h2 className="text-base font-semibold">Pick one option—or stop here</h2>
          <div className="mt-3 grid gap-2">
            {actions.map((option) => (
            <button key={option} type="button" aria-pressed={action === option} onClick={() => setAction(option)} className="flex min-h-14 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-left text-sm text-white/80 transition hover:border-sky-200/30 hover:bg-white/[0.06] aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-sky-100/25 text-[10px] text-sky-100/80">{actions.indexOf(option) + 1}</span><span>{option}</span>
              </button>
            ))}
          </div>
          {action && (
            <button type="button" onClick={complete} className="mt-4 min-h-11 rounded-full bg-sky-200 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-100">
              Make this my plan
            </button>
          )}
        </section>
      )}

      <p className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-xs leading-relaxed text-white/55">Nothing is timed or tracked here. Your choices are not included in usage analytics, and it is okay to leave without making a plan.</p>
    </div>
  );
}
