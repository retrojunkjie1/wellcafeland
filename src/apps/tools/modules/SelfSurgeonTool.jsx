// src/apps/tools/modules/SelfSurgeonTool.jsx
// Inner dialogue flow for self-compassion and reframing

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const SELF_SURGEON_STEPS = [
  {
    id: "situation",
    question: "What happened?",
    prompt: "Describe the situation or event that's troubling you. Be specific and honest.",
    placeholder: "What happened that's causing you distress?",
  },
  {
    id: "story",
    question: "What story are you telling yourself?",
    prompt: "Notice the narrative you're creating about this situation. What judgments or harsh thoughts are present?",
    placeholder: "What harsh or critical thoughts are you having about this?",
  },
  {
    id: "friend",
    question: "What would you say to a friend?",
    prompt: "If a close friend came to you with this same situation, what would you tell them?",
    placeholder: "What would you say to someone you care about in this situation?",
  },
  {
    id: "reframe",
    question: "What is a kinder reframe?",
    prompt: "Based on what you'd tell a friend, what's a more compassionate way to view this?",
    placeholder: "How can you offer yourself the same kindness?",
  },
];

const SelfSurgeonTool = ({ onComplete, onCancel, _initialContext, isEmbedded = false }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime] = useState(() => Date.now());

  const currentStep = SELF_SURGEON_STEPS[currentStepIndex];
  const isLast = currentStepIndex === SELF_SURGEON_STEPS.length - 1;

  const handleResponseChange = (stepId, value) => {
    setResponses((prev) => ({
      ...prev,
      [stepId]: value.trim(),
    }));
  };

  const handleNext = () => {
    if (!responses[currentStep.id]?.trim()) return;
    
    if (currentStepIndex < SELF_SURGEON_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    const result = createToolResult(
      "self_surgeon",
      "Self-Inquiry",
      `Completed self-inquiry session. Explored situation, harsh story, and found a kinder reframe.`,
      {
        stepsCompleted: SELF_SURGEON_STEPS.length,
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
  }, [startTime, responses, onComplete]);

  const handleCancel = useCallback(() => {
    safeCancel(onCancel);
  }, [onCancel]);

  const canProceed = responses[currentStep.id]?.trim();

  return (
    <div className="space-y-6">
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

      {/* Instructions */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2">
        <p className="text-base text-white/70">
          Explore what's present with curiosity and compassion. There's no right or wrong answer.
        </p>
        <p className="text-sm text-white/50">
          Step {currentStepIndex + 1} of {SELF_SURGEON_STEPS.length}
        </p>
      </div>

      {/* Current Question */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-5 animate-fade-in">
        <div>
          <h3 className="text-xl font-medium text-white mb-2">{currentStep.question}</h3>
          <p className="text-base text-white/60">{currentStep.prompt}</p>
        </div>

        <textarea
          value={responses[currentStep.id] || ""}
          onChange={(e) => handleResponseChange(currentStep.id, e.target.value)}
          placeholder={currentStep.placeholder}
          rows={8}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
        />

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-base text-white/70 transition hover:bg-white/10 hover:text-white min-h-[48px]"
            >
              ← Previous
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="rounded-lg bg-white/10 px-4 sm:px-6 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
          >
            {isLast ? "Complete" : "Next →"}
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {SELF_SURGEON_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`h-1.5 rounded-full transition-all ${
              responses[step.id]?.trim()
                ? "w-8 bg-white/40"
                : idx === currentStepIndex
                ? "w-6 bg-white/20"
                : "w-4 bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfSurgeonTool;
