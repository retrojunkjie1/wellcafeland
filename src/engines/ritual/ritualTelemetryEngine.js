// src/engines/ritual/ritualTelemetryEngine.js

/**
 * Computes live telemetry for a ritual session.
 * Uses groundingLevel + optional triggerIntensity from ritualSequences.
 *
 * Input:
 *  - ritual: { name, steps: [...] }
 *  - currentStepIndex: number
 *
 * Output:
 *  - telemetry: {
 *      groundingScore: number (0–100)
 *      progressPercent: number (0–100)
 *      activationDelta: number (negative = calming)
 *      statusLabel: "arriving" | "stabilizing" | "reclaiming"
 *      recommendation: string
 *    }
 */

export function computeRitualTelemetry(ritual, currentStepIndex) {
  if (!ritual || !ritual.steps || ritual.steps.length === 0) {
    return {
      groundingScore: 0,
      progressPercent: 0,
      activationDelta: 0,
      statusLabel: "arriving",
      recommendation: "Tap Begin when you're ready to start this ritual.",
    };
  }

  const totalSteps = ritual.steps.length;
  const clampedIndex = Math.min(
    Math.max(currentStepIndex, 0),
    totalSteps - 1
  );

  const completedSteps = ritual.steps.slice(0, clampedIndex + 1);

  const totalGrounding = completedSteps.reduce(
    (sum, step) => sum + (step.groundingLevel ?? 0),
    0
  );

  const totalActivationDelta = completedSteps.reduce(
    (sum, step) => sum + (step.triggerIntensity ?? 0),
    0
  );

  const groundingScore = Math.min(
    100,
    Math.round(totalGrounding / (totalSteps * 1.2)) // dampen a bit for realism
  );

  const progressPercent = Math.round(
    ((clampedIndex + 1) / totalSteps) * 100
  );

  let statusLabel = "arriving";
  let recommendation =
    "Stay with this step. Nothing to fix. Just let your system notice you're here.";

  if (groundingScore >= 30 && groundingScore < 60) {
    statusLabel = "stabilizing";
    recommendation =
      "Your system is beginning to stabilize. Keep going at your own pace.";
  } else if (groundingScore >= 60) {
    statusLabel = "reclaiming";
    recommendation =
      "You're reclaiming ground. When you're ready, notice what feels slightly more possible now.";
  }

  // If activationDelta is strongly negative (=reducing activation), adjust message
  if (totalActivationDelta <= -25) {
    recommendation =
      "You've interrupted a strong surge. Give your body a moment to register: the wave is passing.";
  }

  return {
    groundingScore,
    progressPercent,
    activationDelta: totalActivationDelta,
    statusLabel,
    recommendation,
  };
}

