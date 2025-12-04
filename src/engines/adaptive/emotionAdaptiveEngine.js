// src/engines/adaptive/emotionAdaptiveEngine.js
// Emotion-Adaptive Content Engine - Intelligent Content Modulation
// Phase 40: Emotion-Adaptive Content Engine

import { getRecommendedTopics } from '@/engines/content/contentEngine';
import { logEvent } from '@/services/telemetry';

/**
 * Emotional state categories for content adaptation
 */
export const EmotionalStates = {
  CALM: 'calm',
  ANXIOUS: 'anxious',
  DISTRESSED: 'distressed',
  SHAME: 'shame',
  GRIEF: 'grief',
  AVOIDANCE: 'avoidance',
  NEUTRAL: 'neutral',
};

/**
 * Content safety filters based on emotional state
 */
export const SafetyFilters = {
  [EmotionalStates.DISTRESSED]: {
    excludeIntensity: ['high'],
    prioritizeThemes: ['calm', 'peace'],
    recommendTools: ['panic-reset', 'breathing', 'grounding'],
    toneModulation: 'gentle',
  },
  [EmotionalStates.ANXIOUS]: {
    excludeIntensity: [],
    prioritizeThemes: ['calm'],
    recommendTools: ['breathing', 'grounding'],
    toneModulation: 'reassuring',
  },
  [EmotionalStates.SHAME]: {
    excludeIntensity: [],
    prioritizeThemes: ['peace', 'reflection'],
    recommendTools: ['shame-release', 'journaling', 'self-surgeon'],
    toneModulation: 'compassionate',
  },
  [EmotionalStates.GRIEF]: {
    excludeIntensity: [],
    prioritizeThemes: ['peace'],
    recommendTools: ['journaling', 'body-scan', 'emotion-regulator'],
    toneModulation: 'gentle',
  },
  [EmotionalStates.AVOIDANCE]: {
    excludeIntensity: [],
    prioritizeThemes: ['focus'],
    recommendTools: ['journaling'],
    toneModulation: 'firm',
  },
};

/**
 * Detect user's current emotional state from recent activity
 */
export function detectEmotionalState(recentActivity = {}) {
  const {
    recentTools = [],
    recentTopics = [],
    sessionMetrics = {},
    currentRiskLevel = 'low',
  } = recentActivity;

  // High distress indicators
  if (currentRiskLevel === 'high') return EmotionalStates.DISTRESSED;
  if (recentTools.includes('panic-reset')) return EmotionalStates.DISTRESSED;
  
  // Panic tools usage suggests anxiety
  const panicToolCount = recentTools.filter(t => 
    ['panic-reset', 'breathing'].includes(t)
  ).length;
  if (panicToolCount >= 2) return EmotionalStates.ANXIOUS;

  // Shame-related content
  if (recentTopics.includes('shame-guilt')) return EmotionalStates.SHAME;
  if (recentTools.includes('shame-release')) return EmotionalStates.SHAME;

  // Grief-related
  if (recentTopics.includes('grief-loss')) return EmotionalStates.GRIEF;

  // Low engagement suggests avoidance
  if (sessionMetrics.completionRate < 30 && sessionMetrics.driftScore > 5) {
    return EmotionalStates.AVOIDANCE;
  }

  return EmotionalStates.NEUTRAL;
}

/**
 * Filter content based on emotional state
 */
export function filterContentByEmotionalState(topics, emotionalState) {
  const filter = SafetyFilters[emotionalState];
  
  if (!filter) return topics;

  return topics.filter(topic => {
    // Exclude high-intensity content if user is distressed
    if (filter.excludeIntensity && filter.excludeIntensity.includes(topic.intensity)) {
      return false;
    }

    return true;
  });
}

/**
 * Sort content by relevance to emotional state
 */
export function sortContentByRelevance(topics, emotionalState) {
  const filter = SafetyFilters[emotionalState];
  
  if (!filter) return topics;

  return [...topics].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Prioritize themes
    if (filter.prioritizeThemes) {
      if (filter.prioritizeThemes.includes(a.theme)) scoreA += 10;
      if (filter.prioritizeThemes.includes(b.theme)) scoreB += 10;
    }

    return scoreB - scoreA;
  });
}

/**
 * Get adaptive content recommendations
 */
export function getAdaptiveRecommendations(userState = {}) {
  const emotionalState = detectEmotionalState(userState);
  
  const recommendations = getRecommendedTopics({
    emotionalState,
    riskLevel: userState.currentRiskLevel || 'low',
    recentTools: userState.recentTools || [],
    preferredIntensity: emotionalState === EmotionalStates.DISTRESSED ? 'low' : 'medium',
  });

  const filter = SafetyFilters[emotionalState];

  logEvent('adaptive_recommendations', {
    emotionalState,
    recommendedTopics: recommendations,
    recommendedTools: filter?.recommendTools || [],
  });

  return {
    topics: recommendations,
    tools: filter?.recommendTools || [],
    emotionalState,
    toneModulation: filter?.toneModulation || 'neutral',
  };
}

/**
 * Modulate content tone based on emotional state
 */
export function modulateContentTone(content, emotionalState) {
  const filter = SafetyFilters[emotionalState];
  
  if (!filter || !filter.toneModulation) return content;

  // Add tone metadata for narration engine
  return {
    ...content,
    adaptiveTone: filter.toneModulation,
    emotionalContext: emotionalState,
  };
}

/**
 * Check if content is safe for current emotional state
 */
export function isContentSafeForState(topic, emotionalState) {
  const filter = SafetyFilters[emotionalState];
  
  if (!filter) return true;

  // Check intensity exclusions
  if (filter.excludeIntensity && filter.excludeIntensity.includes(topic.intensity)) {
    return false;
  }

  return true;
}

/**
 * Get safety recommendation message
 */
export function getSafetyRecommendation(emotionalState) {
  const messages = {
    [EmotionalStates.DISTRESSED]: {
      message: "You seem distressed right now. Would you like to try a grounding exercise first?",
      suggestedTools: ['panic-reset', 'breathing', 'grounding'],
      priority: 'high',
    },
    [EmotionalStates.ANXIOUS]: {
      message: "Feeling anxious? A breathing exercise might help before diving into content.",
      suggestedTools: ['breathing', 'grounding'],
      priority: 'medium',
    },
    [EmotionalStates.SHAME]: {
      message: "Processing shame takes courage. Take your time and be gentle with yourself.",
      suggestedTools: ['shame-release', 'journaling'],
      priority: 'medium',
    },
  };

  return messages[emotionalState] || null;
}

