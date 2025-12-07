// ===========================================================
// HOOK: useAdaptiveRitual
// Fetches correct version of ritual + memoization
// ===========================================================

import { useMemo } from "react";
import { getAdaptiveRitualSequence } from "@/engines/rituals/ritualSequenceEngine";

/**
 * Hook to get adaptive ritual sequence
 * @param {string} id - Ritual sequence ID
 * @returns {Object|null} Adaptive ritual sequence
 */
export function useAdaptiveRitual(id) {
  return useMemo(() => {
    if (!id) return null;
    return getAdaptiveRitualSequence(id);
  }, [id]);
}

