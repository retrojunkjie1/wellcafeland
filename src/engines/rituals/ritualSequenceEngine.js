// ===========================================================
// RITUAL SEQUENCE ENGINE — Adaptive Ritual Selection
// Phase 47
// ===========================================================

import { ritualSequences } from "@/data/ritualSequences";
import { detectEmotionalState } from "@/engines/adaptive/emotionAdaptiveEngine";
import { memoryStore } from "@/store/memoryStore";
import { getLastSession } from "@/services/sessionHistory";

/**
 * Get emotional state for ritual adaptation
 * @returns {string} Emotional state key
 */
function getEmotionalState() {
  const lastToolSession = memoryStore.getState().lastToolSession;
  const lastSession = getLastSession();

  const userState = {
    recentTools: lastToolSession?.toolId ? [lastToolSession.toolId] : [],
    currentRiskLevel: "low",
    sessionMetrics: {
      completionRate: lastSession ? 100 : 0,
      driftScore: 0,
    },
  };

  return detectEmotionalState(userState);
}

/**
 * Get adaptive ritual sequence based on emotional state
 * @param {string} id - Ritual sequence ID
 * @returns {Object|null} Ritual sequence with adapted steps
 */
export function getAdaptiveRitualSequence(id) {
  const ritual = ritualSequences[id];
  if (!ritual) return null;

  const emotionalState = getEmotionalState();

  // Map emotional states to variant keys
  const variantMap = {
    distressed: "anxious",
    anxious: "anxious",
    shame: "low",
    grief: "low",
    avoidance: "low",
    neutral: null,
  };

  const variantKey = variantMap[emotionalState];

  // Use variant if available
  if (variantKey && ritual.variants && ritual.variants[variantKey]) {
    return {
      ...ritual,
      steps: ritual.variants[variantKey],
    };
  }

  // Default sequence
  return ritual;
}

