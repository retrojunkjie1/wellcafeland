// src/apps/tools/modules/GroundingTool.jsx
// 5-4-3-2-1 Grounding exercise

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { createToolResult, safeComplete, safeCancel } from "@/utils/toolContract";
import { logToolUsage } from "@/services/toolTelemetry";

const GROUNDING_STEPS = [
  { sense: "see", count: 5, prompt: "Name 5 things you can see around you", icon: "👁️" },
  { sense: "feel", count: 4, prompt: "Name 4 things you can feel or touch", icon: "✋" },
  { sense: "hear", count: 3, prompt: "Name 3 things you can hear", icon: "👂" },
  { sense: "smell", count: 2, prompt: "Name 2 things you can smell", icon: "👃" },
  { sense: "taste", count: 1, prompt: "Name 1 thing you can taste", icon: "👅" },
];

const GroundingTool = ({ onComplete, onCancel, isEmbedded = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTime] = useState(() => Date.now());
  const [mostHelpfulSense, setMostHelpfulSense] = useState(null);

  const handleResponseChange = (senseId, value) => {
    setResponses((prev) => ({
      ...prev,
      [senseId]: value,
    }));
  };

  const handleComplete = useCallback(() => {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Determine most helpful sense (first one with a substantial response)
    const helpfulSense = mostHelpfulSense || GROUNDING_STEPS.find(
      step => responses[step.sense]?.trim() && responses[step.sense].trim().length > 10
    )?.sense || null;

    const result = createToolResult(
      "grounding_54321",
      "5-4-3-2-1 Grounding",
      `Ended the grounding exercise after visiting ${currentStep + 1} of ${GROUNDING_STEPS.length} steps.${helpfulSense ? ` Most helpful: ${helpfulSense}.` : ""}`,
      {
        stepsCompleted: GROUNDING_STEPS.filter((step) => responses[step.sense]?.trim()).length,
        stepsVisited: currentStep + 1,
        responses: Object.keys(responses).reduce((acc, sense) => {
          if (responses[sense]?.trim()) {
            acc[sense] = responses[sense].trim();
          }
          return acc;
        }, {}),
        mostHelpfulSense: helpfulSense,
        reflection: responses.reflection || null,
      },
      durationSeconds
    );

    // Log telemetry (non-blocking)
    logToolUsage("grounding_54321", {
      startedAt: startTime,
      completedAt: endTime,
      durationMs: durationSeconds * 1000,
      context: {
        stepsCompleted: GROUNDING_STEPS.filter((step) => responses[step.sense]?.trim()).length,
        stepsVisited: currentStep + 1,
        mostHelpfulSense: helpfulSense,
      },
    }).catch(err => console.warn("Tool telemetry failed:", err));

    safeComplete(onComplete, result);
  }, [startTime, responses, mostHelpfulSense, currentStep, onComplete]);

  const handleCancel = useCallback(() => {
    safeCancel(onCancel);
  }, [onCancel]);

  const handleNext = useCallback(() => {
    if (currentStep < GROUNDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const currentStepData = GROUNDING_STEPS[currentStep];
  return (
    <div className="space-y-6">
      {!isEmbedded && onCancel && (
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">5-4-3-2-1 Grounding</h3>
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
          If it feels useful, notice something around you with this sense. You can leave the response blank, skip any step, or stop at any time.
        </p>
        <p className="text-sm text-white/50">
          Step {currentStep + 1} of {GROUNDING_STEPS.length}
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-white/65 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
          >
            Stop practice
          </button>
        )}
      </div>

      {/* Current Step */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5 space-y-4 animate-fade-in w-full">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl sm:text-3xl">{currentStepData.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-white break-words">
              {currentStepData.count} Things You Can {currentStepData.sense.charAt(0).toUpperCase() + currentStepData.sense.slice(1)}
            </h3>
          </div>
        </div>

        <p className="text-sm sm:text-base text-white/80 break-words">{currentStepData.prompt}, if you want to</p>

        <textarea
          value={responses[currentStepData.sense] || ""}
          onChange={(e) => handleResponseChange(currentStepData.sense, e.target.value)}
          placeholder="Optional reflection"
          aria-label={`Optional reflection for ${currentStepData.sense}`}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none break-words"
        />

        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-lg bg-white/10 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium text-white transition hover:bg-white/20 min-h-[48px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold"
        >
          {currentStep < GROUNDING_STEPS.length - 1 ? "Continue" : "Finish for now"}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        {GROUNDING_STEPS.map((step, idx) => (
          <div
            key={step.sense}
            className={`h-1.5 rounded-full transition-all ${
              responses[step.sense]?.trim()
                ? "w-8 bg-white/40"
                : idx === currentStep
                ? "w-6 bg-white/20"
                : "w-4 bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Optional Reflection (on last step) */}
      {currentStep === GROUNDING_STEPS.length - 1 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3 animate-fade-in">
          <p className="text-base text-white/80">
            Which sense was most helpful for grounding you?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {GROUNDING_STEPS.map((step) => (
              <button
                key={step.sense}
                type="button"
                onClick={() => setMostHelpfulSense(step.sense)}
                className={`rounded-lg border p-3 text-center transition ${
                  mostHelpfulSense === step.sense
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
              >
                <div className="text-xl mb-1">{step.icon}</div>
                <div className="text-xs text-white/70 capitalize">{step.sense}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroundingTool;
