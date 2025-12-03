// src/hooks/useTraumaPatterns.js
// React hook for trauma pattern analysis
// Phase 42: Trauma Pattern Detection Layer

import { useMemo } from "react";
import { analyzeTraumaRelatedPatterns } from "@/engines/patterns/traumaPatternAnalyzer";

/**
 * Accepts telemetry data from parent
 * Does not fetch data itself to stay flexible
 * @param {Object} data - Activity data
 * @returns {Array} Detected patterns
 */
export function useTraumaPatterns({ recentEvents, streakGaps }) {
  return useMemo(
    () => analyzeTraumaRelatedPatterns({ recentEvents, streakGaps }),
    [recentEvents, streakGaps]
  );
}

