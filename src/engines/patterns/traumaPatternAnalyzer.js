// src/engines/patterns/traumaPatternAnalyzer.js
// Supportive, non-diagnostic pattern analysis
// Phase 42: Trauma Pattern Detection Layer

/**
 * Input: array of recentEvents:
 * [{ type: "tool", id: "panic-reset", ts: number }, { type: "topic", id: "Grief and Loss", ts }, ...]
 * and possibly session durations / streak gaps.
 * 
 * @param {Object} data - Activity data
 * @returns {Array} Detected patterns with supportive suggestions
 */
export function analyzeTraumaRelatedPatterns({ recentEvents = [], streakGaps = [] }) {
  const patterns = [];

  const panicResets = recentEvents.filter(
    (e) => e.type === "tool" && e.id === "panic-reset"
  );

  if (panicResets.length >= 3) {
    patterns.push({
      id: "frequent-panic-support",
      level: "attentive",
      summary: "You've reached for panic support several times recently.",
      suggestion:
        "This might mean life has been feeling especially intense. It could help to schedule calm moments even when nothing is on fire.",
    });
  }

  const griefTopics = recentEvents.filter(
    (e) => e.type === "topic" && e.id === "Grief and Loss"
  );

  if (griefTopics.length >= 3) {
    patterns.push({
      id: "ongoing-grief-focus",
      level: "gentle",
      summary: "You've been spending time with grief-related topics.",
      suggestion:
        "Grief often moves in waves. It might be supportive to balance this with grounding or self-compassion practices.",
    });
  }

  // Example: long gaps between sessions
  if (streakGaps.some((gap) => gap > 5)) {
    patterns.push({
      id: "long-gaps",
      level: "soft",
      summary: "There have been longer stretches without checking in.",
      suggestion:
        "Sometimes distance is a way of coping. When you're ready, even a 1-minute check-in can be a gentle way to return.",
    });
  }

  return patterns;
}

