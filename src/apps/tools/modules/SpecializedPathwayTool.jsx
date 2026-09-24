import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X, RotateCcw } from "lucide-react";
import { createToolResult, safeCancel, safeComplete } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const PATHWAYS = {
  "emotion-regulator": {
    title: "Emotion Support",
    method: "Notice your state → choose the kind of support that fits → leave with one doable option",
    introduction: "This is not a test of how calm you can become. Some moments call for movement, practical help, connection, or fewer demands. Choose what fits; you can change direction at any time.",
    steps: [
      { id: "feeling", title: "What is your current state asking you to notice?", detail: "Pick a word, choose more than one, or skip the label. There is no need to explain or justify the feeling.", options: ["Angry or activated", "Afraid or on alert", "Sad or grieving", "Numb or far away", "Overloaded or scattered", "Steady but needing support"] },
      { id: "need", title: "Which kind of support seems most useful?", detail: "You do not have to calm down. Pick a direction that matches the moment, or choose unsure and keep the next step very small.", options: ["Move: walk, stretch, or use safe energy", "Orient: notice a place, object, or sound", "Connect: contact someone trustworthy", "Reduce: pause a task or lower stimulation", "Understand: name what set this off", "Practical help: food, water, transport, or a task"] },
      { id: "nextStep", title: "Make a ten-minute plan you can actually use", detail: "What is the smallest first action? Include where, when, or who could help if that makes it easier. You can also choose rest or no action for now.", placeholder: "For example: ‘Step outside the busy room for two minutes’…" },
    ],
    closing: (answers) => answers.nextStep?.trim()
      ? `Your chosen direction was ${answers.need || "a direction you selected"}. Your next step: ${answers.nextStep.trim()}`
      : `Your chosen direction was ${answers.need || "a direction you selected"}. You can leave the plan open and return when you are ready.`,
  },
  "shame-release": {
    title: "Shame & Repair",
    method: "Separate what happened from what shame says it means → consider impact and repair → choose a fair next step",
    introduction: "You can work with a small, current situation. Do not use this as pressure to revisit trauma or disclose anything. Accountability can be honest without turning into self-punishment.",
    steps: [
      { id: "facts", title: "Describe only the observable facts", detail: "What would a neutral camera or message log show? Leave out labels about your character. You can keep this to a few words.", placeholder: "What happened, without the verdict?…" },
      { id: "verdict", title: "What meaning or identity label got added?", detail: "Notice words like ‘always,’ ‘never,’ ‘bad person,’ or ‘hopeless.’ You do not have to argue with the thought; just separate it from the event.", placeholder: "The judgment or prediction (optional)…" },
      { id: "repair", title: "What is fair care, responsibility, or repair?", detail: "Consider who was affected, what can be repaired, what boundary is needed, and what is outside your control. You may choose to wait until you feel supported.", placeholder: "One proportionate next step…" },
    ],
    closing: (answers) => answers.repair?.trim()
      ? `A fair next step you identified: ${answers.repair.trim()} Remember, repair can be specific and proportionate; it does not require attacking yourself.`
      : "You do not need to force a resolution now. You can return to the facts and consider repair with support when you are ready.",
  },
  "sleep-reset": {
    title: "Sleep Landing",
    method: "Make the room a little easier → park unfinished thoughts → choose a low-pressure rest plan",
    introduction: "This is a practical wind-down, not a promise that you will fall asleep. There is no required breathing pattern, body scan, or perfect bedtime routine.",
    steps: [
      { id: "environment", title: "Choose one small adjustment to your setting", detail: "Pick something you can change without turning bedtime into another project. If nothing needs changing, that is a valid choice.", options: ["Dim a light or reduce screen brightness", "Adjust temperature, bedding, or position", "Get water, medication, or another bedtime need", "Reduce one noise or interruption", "Ask someone to handle one task", "Keep the setting as it is"] },
      { id: "unload", title: "Give one unfinished thought a place to wait", detail: "Write a short reminder, the first step for tomorrow, or simply name what is looping. You do not need to solve it tonight.", placeholder: "‘Tomorrow, I will start by…’ (optional)" },
      { id: "landing", title: "Pick a rest option that does not demand sleep", detail: "If sleep does not come quickly, rest still counts. Choose something quiet and comfortable, or leave this blank and stop here.", options: ["Read or listen to familiar, low-stakes material", "Choose a comfortable position or gentle movement", "Use quiet music or steady background sound", "Put tomorrow’s first task somewhere visible", "Sit with a familiar comforting object", "Let go of the routine and rest as I am"] },
    ],
    closing: (answers) => `Tonight’s plan: ${answers.landing || "rest in the way that feels most manageable"}. If sleep is not immediate, you have not failed; you can keep the goal to resting comfortably.`,
  },
};

export default function SpecializedPathwayTool({ tool, onComplete, onCancel }) {
  const pathway = useMemo(() => PATHWAYS[tool?.id] || PATHWAYS["emotion-regulator"], [tool?.id]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(() => Date.now());
  const step = pathway.steps[stepIndex];

  const setAnswer = (value) => setAnswers((previous) => ({ ...previous, [step.id]: value }));
  const finish = () => {
    setIsFinished(true);
  };

  const complete = () => {
    const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const result = createToolResult(tool?.id || "specialized-support", pathway.title, `Completed ${pathway.title}: ${pathway.method}.`, {
      method: pathway.method,
      stepsCompleted: pathway.steps.length,
    }, durationSeconds);
    logToolUsage(tool?.id || "specialized-support", {
      startedAt,
      completedAt: Date.now(),
      durationMs: durationSeconds * 1000,
      context: { stepsCompleted: pathway.steps.length },
    }).catch(() => {});
    safeComplete(onComplete, result);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200/15 bg-amber-100/[0.04] p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-100/75">A different kind of support</p>
        <p className="mt-2 text-sm leading-relaxed text-white/75">{pathway.method}. Every prompt is optional; you can skip or stop at any time.</p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{pathway.introduction}</p>
      </div>

      {isFinished ? (
        <section className="rounded-xl border border-white/10 bg-white/[0.035] p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-100/70">Your takeaway</p>
          <p className="mt-3 text-base leading-relaxed text-white/85">{pathway.closing(answers)}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/55">This practice does not measure success. Keep what helps, change the plan, or leave it here.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setIsFinished(false)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/75"><RotateCcw aria-hidden="true" className="h-4 w-4" /> Review answers</button>
            <button type="button" onClick={complete} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950"><Check aria-hidden="true" className="h-4 w-4" /> Save completion</button>
          </div>
        </section>
      ) : (
      <>
      <section className="rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:p-5" aria-live="polite">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-xs text-white/50">Step {stepIndex + 1} of {pathway.steps.length}</span>
          <button type="button" onClick={() => safeCancel(onCancel)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-white/55 hover:bg-white/5 hover:text-white">
            <X aria-hidden="true" className="h-4 w-4" /> Stop
          </button>
        </div>
        <h2 className="text-lg font-medium text-white">{step.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{step.detail}</p>

        {step.options ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {step.options.map((option) => (
              <button key={option} type="button" aria-pressed={answers[step.id] === option} onClick={() => setAnswer(option)} className="min-h-12 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-sm text-white/80 transition hover:border-amber-200/35 aria-pressed:border-amber-200/50 aria-pressed:bg-amber-100/[0.08]">
                {option}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[step.id] || ""}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={step.placeholder}
            rows={4}
            maxLength={1200}
            className="mt-5 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/35 focus:border-amber-200/40 focus:outline-none"
          />
        )}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/75 disabled:opacity-35">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
        </button>
        <button type="button" onClick={() => (stepIndex === pathway.steps.length - 1 ? finish() : setStepIndex((index) => index + 1))} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-200 px-5 text-sm font-medium text-slate-950 hover:bg-amber-100">
          {stepIndex === pathway.steps.length - 1 ? <>See my takeaway <ArrowRight aria-hidden="true" className="h-4 w-4" /></> : <>Continue <ArrowRight aria-hidden="true" className="h-4 w-4" /></>}
        </button>
      </div>
      </>
      )}
    </div>
  );
}
