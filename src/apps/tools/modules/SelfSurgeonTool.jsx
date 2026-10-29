// src/apps/tools/modules/SelfSurgeonTool.jsx
// Inner dialogue flow for self-compassion and reframing

import React, { useState, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight, HeartHandshake, Lightbulb, MessageCircle, Pause, Play, Sparkles, Square, Volume2, X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";
import ToolCharacterGuide from "@/components/tools/ToolCharacterGuide";
import { useNaturalVoice } from "@/hooks/useNaturalVoice";

const STEP_ICONS = [MessageCircle, Lightbulb, HeartHandshake, Sparkles];
const STEP_LABELS = ["The moment", "The story", "A friend", "A fairer view"];

const SELF_SURGEON_STEPS = [
  {
    id: "situation",
    question: "What happened?",
    prompt: "Share only what feels manageable. A few words or no response is okay.",
    placeholder: "You can leave this blank or start with a few words...",
  },
  {
    id: "story",
    question: "What story are you telling yourself?",
    prompt: "If you want, notice any thoughts or interpretations that came up.",
    placeholder: "What thoughts have come up? (Optional)",
  },
  {
    id: "friend",
    question: "What would you say to a friend?",
    prompt: "If it feels useful, consider what you might say to someone you care about.",
    placeholder: "What would you say to someone you care about in this situation?",
  },
  {
    id: "reframe",
    question: "What is a kinder reframe?",
    prompt: "Is there another perspective that feels a little kinder or more balanced? You do not need to find one.",
    placeholder: "How can you offer yourself the same kindness?",
  },
];

const SelfSurgeonTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime] = useState(() => Date.now());
  const { status: voiceStatus, error: voiceError, playbackProgress, play, pause, resume, stop } = useNaturalVoice("marin");

  const currentStep = SELF_SURGEON_STEPS[currentStepIndex];
  const isLast = currentStepIndex === SELF_SURGEON_STEPS.length - 1;

  const handleResponseChange = (stepId, value) => {
    setResponses((prev) => ({
      ...prev,
      [stepId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStepIndex < SELF_SURGEON_STEPS.length - 1) {
      stop();
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      stop();
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleGoToStep = (index) => {
    stop();
    setCurrentStepIndex(index);
  };

  const handleHearPrompt = () => {
    // Speak only the fixed prompt. A user's written response is never sent to voice playback.
    void play(`${currentStep.question}. ${currentStep.prompt}`);
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    const answeredSteps = SELF_SURGEON_STEPS.filter((step) => responses[step.id]?.trim()).length;

    const result = createToolResult(
      "self_surgeon",
      "Self-Inquiry",
      "Completed a self-inquiry reflection at your own pace.",
      {
        stepsCompleted: answeredSteps,
        situation: responses.situation || null,
        harshStory: responses.story || null,
        friendResponse: responses.friend || null,
        kinderReframe: responses.reframe || null,
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage("self_surgeon", {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        stepsCompleted: SELF_SURGEON_STEPS.length,
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
    stop();
  }, [startTime, responses, onComplete, stop]);

  const handleCancel = useCallback(() => {
    stop();
    safeCancel(onCancel);
  }, [onCancel, stop]);

  return (
    <div className="space-y-6">
      {(voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing") && <ToolCharacterGuide
        mood={voiceStatus === "playing" ? "encouraging" : "listening"}
        speaking={voiceStatus === "playing"}
        speakingProgress={playbackProgress}
        message={voiceStatus === "playing" ? "Take in the prompt at your own pace." : currentStepIndex === 0 ? "We can look at one moment at a time." : currentStepIndex === 1 ? "A thought can be noticed without turning it into a verdict." : currentStepIndex === 2 ? "Try the care you might offer someone close to you." : "A kinder perspective can be small—or not arrive today."}
        context="Only the printed prompt can be spoken. Your written response stays out of voice playback."
      />}
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Self-Inquiry</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_12%_45%,rgba(177,199,183,.1),transparent_42%),linear-gradient(135deg,rgba(255,255,255,.035),rgba(5,10,16,.45))] p-4 sm:p-5" aria-label="Reflection path">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/50">A four-part reflection</p>
          <p className="text-xs tabular-nums text-amber-100/75">{String(currentStepIndex + 1).padStart(2, "0")} / 04</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2" role="group" aria-label="Choose a reflection step">
          {SELF_SURGEON_STEPS.map((step, index) => {
            const StepIcon = STEP_ICONS[index];
            const isCurrent = index === currentStepIndex;
            const isComplete = Boolean(responses[step.id]?.trim());
            return (
              <button key={step.id} type="button" aria-current={isCurrent ? "step" : undefined} aria-label={`Step ${index + 1}: ${STEP_LABELS[index]}${isComplete ? ", response entered" : ""}`} onClick={() => handleGoToStep(index)} className={`group flex min-h-[4.4rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200 ${isCurrent ? "border-amber-100/55 bg-amber-100/[.09] text-amber-50 shadow-[0_0_24px_rgba(229,207,152,.08)]" : isComplete ? "border-emerald-100/25 bg-emerald-100/[.045] text-emerald-50/85" : "border-white/[.08] bg-black/10 text-white/45 hover:border-white/20 hover:text-white/75"}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-full border ${isCurrent ? "border-amber-100/35 bg-amber-100/10" : isComplete ? "border-emerald-100/25 bg-emerald-100/[.07]" : "border-white/10 bg-white/[.025]"}`}>
                  {isComplete && !isCurrent ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <StepIcon aria-hidden="true" className="h-3.5 w-3.5" />}
                </span>
                <span className="truncate text-[9px] font-medium leading-tight sm:text-[11px]">{STEP_LABELS[index]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Current Question */}
      <section key={currentStep.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:p-5 space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[.17em] text-amber-100/60">{STEP_LABELS[currentStepIndex]} · optional</p>
            <h3 className="mt-1.5 text-xl font-medium text-white sm:text-2xl">{currentStep.question}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">{currentStep.prompt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={voiceStatus === "playing" ? () => void pause() : voiceStatus === "paused" ? () => void resume() : handleHearPrompt} disabled={voiceStatus === "preparing"} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100/20 bg-emerald-100/[.045] px-3.5 text-xs text-emerald-50/90 transition hover:bg-emerald-100/[.09] disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
              {voiceStatus === "playing" ? <Pause className="h-4 w-4" /> : voiceStatus === "paused" ? <Play className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {voiceStatus === "preparing" ? "Preparing…" : voiceStatus === "playing" ? "Pause prompt" : voiceStatus === "paused" ? "Resume prompt" : voiceStatus === "finished" ? "Replay prompt" : "Hear prompt"}
            </button>
            {(voiceStatus === "playing" || voiceStatus === "paused" || voiceStatus === "preparing") && <button type="button" onClick={stop} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-xs text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"><Square className="h-3.5 w-3.5" /> Stop</button>}
          </div>
        </div>

        <p role={voiceStatus === "unavailable" ? "alert" : "status"} aria-live="polite" className={`min-h-4 text-xs ${voiceStatus === "unavailable" ? "text-amber-100/85" : "text-white/40"}`}>
          {voiceStatus === "unavailable" ? voiceError || "Voice is unavailable. You can continue reading or try again." : voiceStatus === "preparing" ? "Preparing spoken prompt…" : voiceStatus === "playing" ? "Speaking the prompt only; your response is not included." : voiceStatus === "paused" ? "Prompt paused." : voiceStatus === "finished" ? "Prompt complete. Take your time." : "Use the optional voice or read the prompt silently."}
        </p>

        <textarea
          id={`inquiry-${currentStep.id}`}
          value={responses[currentStep.id] || ""}
          onChange={(e) => handleResponseChange(currentStep.id, e.target.value)}
          placeholder={currentStep.placeholder}
          rows={5}
          maxLength={5000}
          aria-label={currentStep.question}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[.025] px-4 text-sm text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
          )}
          <button type="button" onClick={() => currentStepIndex < SELF_SURGEON_STEPS.length - 1 ? handleNext() : handleComplete()} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 px-4 text-sm text-white/60 transition hover:bg-white/[.04] hover:text-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200">
            {isLast ? "Skip and finish" : "Skip this step"}<ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-amber-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          >
            {isLast ? "Finish reflection" : "Continue"}<ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default SelfSurgeonTool;
