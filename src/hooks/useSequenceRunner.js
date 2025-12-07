// src/hooks/useSequenceRunner.js
// ===========================================================
// Phase 48 — Sequence Runner Hook
// Drives linear + multi-path ritual sequences step-by-step
// ===========================================================

import { useMemo, useState } from "react";

/**
 * useSequenceRunner
 * @param {Object} sequence - ritual sequence from sequenceEngine
 */
export function useSequenceRunner(sequence) {
  const steps = useMemo(() => sequence?.steps || [], [sequence]);

  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([]);

  const currentStep = steps[index] || null;
  const atFirst = index <= 0;
  const atLast = index >= steps.length - 1;

  const goNext = () => {
    if (!steps.length) return;
    // Don't auto-advance branch steps; user must choose
    if (currentStep && currentStep.type === "branch") return;
    if (!atLast) {
      setHistory((h) => [...h, index]);
      setIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (!history.length) {
      if (!atFirst) setIndex((i) => Math.max(0, i - 1));
      return;
    }
    const newHistory = [...history];
    const prev = newHistory.pop();

    setHistory(newHistory);
    if (typeof prev === "number") {
      setIndex(prev);
    }
  };

  const chooseBranch = (option) => {
    if (!currentStep || currentStep.type !== "branch") return;
    if (!option) return;

    const targetIndex =
      typeof option.toIndex === "number" ? option.toIndex : index + 1;

    setHistory((h) => [...h, index]);
    setIndex(() =>
      targetIndex >= 0 && targetIndex < steps.length ? targetIndex : index + 1
    );
  };

  const reset = () => {
    setIndex(0);
    setHistory([]);
  };

  return {
    steps,
    index,
    currentStep,
    atFirst,
    atLast,
    goNext,
    goBack,
    chooseBranch,
    reset,
  };
}

