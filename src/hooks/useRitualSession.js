// src/hooks/useRitualSession.js

import { useState, useMemo } from "react";
import { getActiveRitual } from "@/engines/ritual/runRitual";
import { computeRitualTelemetry } from "@/engines/ritual/ritualTelemetryEngine";

export function useRitualSession() {
  const [ritual, setRitual] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const telemetry = useMemo(
    () => computeRitualTelemetry(ritual, currentStepIndex),
    [ritual, currentStepIndex]
  );

  const beginNewRitual = () => {
    const active = getActiveRitual();
    setRitual(active);
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const goToNextStep = () => {
    if (!ritual || !ritual.steps) return;
    setCurrentStepIndex((prev) =>
      Math.min(prev + 1, ritual.steps.length - 1)
    );
  };

  const goToPrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const endSession = () => {
    setIsActive(false);
  };

  return {
    ritual,
    currentStepIndex,
    isActive,
    telemetry,
    beginNewRitual,
    goToNextStep,
    goToPrevStep,
    endSession,
  };
}

