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
      <section className="rounded-2xl border border-emerald-200/20 bg-emerald-100/[0.05] p-5 text-white" aria-live="polite">
        <div className="flex items-center gap-2 text-emerald-100"><Check aria-hidden="true" className="h-5 w-5" /><h2 className="font-semibold">Your plan is ready</h2></div>
        <p className="mt-3 text-sm leading-relaxed text-white/80">{capacity === "none" ? "For now, I can" : `For the next ${capacity === "brief" ? "couple of minutes" : "ten minutes"}, I can`} {action.charAt(0).toLowerCase() + action.slice(1)}.</p>
        <p className="mt-2 text-xs leading-relaxed text-white/55">You can pause, change this, or ask someone to join you. This is a small option, not another task you have to complete.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5 text-white">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <h2 className="text-lg font-semibold">What feels most important right now?</h2>
        <p className="mt-1 text-sm leading-relaxed text-white/65">Choose one area. You do not have to catch up on everything.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {NEEDS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-pressed={need === id} onClick={() => { setNeed(id); setCapacity(""); setAction(""); }} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-left text-sm text-white/80 transition hover:border-sky-200/40 hover:bg-white/[0.06] aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50">
              {React.createElement(Icon, { "aria-hidden": true, className: "h-4 w-4 shrink-0 text-sky-200" })}
              {label}
            </button>
          ))}
        </div>
      </section>

      {need && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5" aria-live="polite">
          <h2 className="text-base font-semibold">How much capacity do you have for this?</h2>
          <p className="mt-1 text-sm text-white/60">There is no wrong answer, including ‘not right now.’</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: "brief", label: "About 2 minutes" },
              { id: "fuller", label: "About 10 minutes" },
              { id: "none", label: "Not able right now" },
            ].map((option) => (
              <button key={option.id} type="button" aria-pressed={capacity === option.id} onClick={() => { setCapacity(option.id); setAction(""); }} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/75 hover:bg-white/5 aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50">
                {option.label}
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
              <button key={option} type="button" aria-pressed={action === option} onClick={() => setAction(option)} className="min-h-12 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-left text-sm text-white/80 hover:bg-white/[0.06] aria-pressed:border-sky-200/50 aria-pressed:bg-sky-100/[0.08] aria-pressed:text-sky-50">
                {option}
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
