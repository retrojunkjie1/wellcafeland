// src/engines/ritual/ritualDecisionEngine.js
// Phase 48 — Ritual Path Decision Engine
// Chooses ritual intensity based on emotional state, trauma patterns, and session history

import { detectEmotionalState, EmotionalStates } from "@/engines/adaptive/emotionAdaptiveEngine";
import { analyzeTraumaRelatedPatterns } from "@/engines/patterns/traumaPatternAnalyzer";
import { memoryStore } from "@/store/memoryStore";

/**
 * Maps emotional states to intensity scores (0-100)
 */
const EMOTION_INTENSITY_MAP = {
  [EmotionalStates.DISTRESSED]: 80,
  [EmotionalStates.ANXIOUS]: 60,
  [EmotionalStates.SHAME]: 50,
  [EmotionalStates.GRIEF]: 55,
  [EmotionalStates.AVOIDANCE]: 30,
  [EmotionalStates.CALM]: 20,
  [EmotionalStates.NEUTRAL]: 25,
};

/**
 * Maps trauma pattern levels to activation scores
 */
const TRAUMA_LEVEL_MAP = {
  attentive: 40,
  gentle: 25,
  soft: 15,
};

/**
 * Get recent activity data from memory store and OS state
 */
function getRecentActivity() {
  const state = memoryStore.getState();
  const lastToolSession = state.lastToolSession || {};
  const lastEmotionSnapshot = state.lastEmotionSnapshot || {};
  
  // Build recent tools array
  const recentTools = lastToolSession.toolId ? [lastToolSession.toolId] : [];
  
  // Build recent topics array
  const recentTopics = state.lastTopicId ? [state.lastTopicId] : [];
  
  // Get session metrics
  const sessionMetrics = {
    completionRate: lastToolSession.metrics?.completionRate || 0,
    driftScore: lastToolSession.metrics?.driftScore || 0,
  };
  
  // Determine risk level from emotion snapshot
  const currentRiskLevel = lastEmotionSnapshot.intensity >= 70 ? "high" : 
                           lastEmotionSnapshot.intensity >= 40 ? "moderate" : "low";
  
  return {
    recentTools,
    recentTopics,
    sessionMetrics,
    currentRiskLevel,
  };
}

/**
 * Get recent events for trauma pattern analysis
 */
function getRecentEvents() {
  const state = memoryStore.getState();
  const events = [];
  
  // Add tool events
  if (state.lastToolSession?.toolId) {
    events.push({
      type: "tool",
      id: state.lastToolSession.toolId,
      ts: state.lastToolSession.updatedAt || Date.now(),
    });
  }
  
  // Add topic events
  if (state.lastTopicId) {
    events.push({
      type: "topic",
      id: state.lastTopicId,
      ts: state.lastTopicVisitedAt || Date.now(),
    });
  }
  
  return events;
}

/**
 * Calculate activation score from trauma patterns
 */
function calculateTraumaActivation(patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return { activation: 0, intrusiveThoughts: 0 };
  }
  
  let activation = 0;
  let intrusiveThoughts = 0;
  
  patterns.forEach((pattern) => {
    const levelScore = TRAUMA_LEVEL_MAP[pattern.level] || 0;
    activation += levelScore;
    
    // Patterns with "panic" or "frequent" suggest intrusive thoughts
    if (pattern.id.includes("panic") || pattern.id.includes("frequent")) {
      intrusiveThoughts += levelScore * 0.5;
    }
  });
  
  // Cap activation at 100
  activation = Math.min(activation, 100);
  intrusiveThoughts = Math.min(intrusiveThoughts, 50);
  
  return { activation, intrusiveThoughts };
}

/**
 * Choose ritual path based on emotional state, trauma patterns, and session history
 * 
 * @returns {string} "deep" | "mixed" | "light"
 *   - "deep": Ikuku-level stabilization (activationScore >= 70)
 *   - "mixed": Hybrid sequence (activationScore >= 40)
 *   - "light": Gentle ritual (activationScore < 40)
 */
export function chooseRitualPath() {
  // Get emotional state
  const recentActivity = getRecentActivity();
  const emotion = detectEmotionalState(recentActivity);
  const emotionIntensity = EMOTION_INTENSITY_MAP[emotion] || 25;
  
  // Get trauma patterns
  const recentEvents = getRecentEvents();
  const traumaPatterns = analyzeTraumaRelatedPatterns({
    recentEvents,
    streakGaps: [], // Could be enhanced with actual streak data
  });
  const trauma = calculateTraumaActivation(traumaPatterns);
  
  // Get last ritual result from memory store
  const state = memoryStore.getState();
  const lastRitualResult = state.lastToolSession?.metrics?.ritualResult || null;
  
  // Calculate activation score
  const activationScore =
    emotionIntensity +
    trauma.activation +
    trauma.intrusiveThoughts;
  
  // Adjust based on last ritual result
  // If last ritual was incomplete or ineffective, increase intensity slightly
  if (lastRitualResult === "incomplete" || lastRitualResult === "ineffective") {
    const adjustedScore = activationScore + 10;
    // Thresholds: mild < 40, moderate < 70, severe >= 70
    if (adjustedScore >= 70) return "deep";
    if (adjustedScore >= 40) return "mixed";
    return "light";
  }
  
  // Standard thresholds: mild < 40, moderate < 70, severe >= 70
  if (activationScore >= 70) return "deep";      // Ikuku-level stabilization
  if (activationScore >= 40) return "mixed";     // Hybrid sequence
  return "light";                                // Gentle ritual
}

/**
 * Get detailed ritual path analysis (for debugging or UI display)
 */
export function getRitualPathAnalysis() {
  const recentActivity = getRecentActivity();
  const emotion = detectEmotionalState(recentActivity);
  const emotionIntensity = EMOTION_INTENSITY_MAP[emotion] || 25;
  
  const recentEvents = getRecentEvents();
  const traumaPatterns = analyzeTraumaRelatedPatterns({
    recentEvents,
    streakGaps: [],
  });
  const trauma = calculateTraumaActivation(traumaPatterns);
  
  const activationScore =
    emotionIntensity +
    trauma.activation +
    trauma.intrusiveThoughts;
  
  const path = chooseRitualPath();
  
  return {
    path,
    activationScore,
    breakdown: {
      emotion: {
        state: emotion,
        intensity: emotionIntensity,
      },
      trauma: {
        patterns: traumaPatterns,
        activation: trauma.activation,
        intrusiveThoughts: trauma.intrusiveThoughts,
      },
      total: activationScore,
    },
  };
}

