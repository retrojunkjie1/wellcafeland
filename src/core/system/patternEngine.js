// src/core/system/patternEngine.js
// Wraps Phase 24 pattern detection helpers

import {
  detectEmotionalDrift,
  detectPatternCluster,
  forecastEmotionalDirection,
} from "./intelligenceEngine"; // re-use existing implementations

/**
 * Compute emotional trajectory from history and last emotion.
 * @param {Array} history
 * @param {object|null} lastEmotion
 * @returns {{ drift: object, cluster: object, forecast: { forecast: string, confidence: number } }}
 */
export function computeEmotionalTrajectory(history, lastEmotion) {
  try {
    const safeHistory = Array.isArray(history) ? history : [];
    const drift = detectEmotionalDrift(safeHistory);
    const cluster = detectPatternCluster(safeHistory);
    const forecast = forecastEmotionalDirection({
      drift,
      cluster,
      lastEmotion: lastEmotion || null,
    });

    return { drift, cluster, forecast };
  } catch (err) {
    console.warn("[patternEngine] computeEmotionalTrajectory failed:", err);
    return {
      drift: { direction: "stable", rate: 0 },
      cluster: { cluster: null, confidence: 0 },
      forecast: { forecast: "unknown", confidence: 0 },
    };
  }
}

