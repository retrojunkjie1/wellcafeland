// src/engines/patterns/traumaPatternEngine.js
// Non-Diagnostic Trauma Pattern Detection - Supportive Only
// Phase 42: Trauma Pattern Detection Layer

import { logEvent } from '@/services/telemetry';

/**
 * ⚠️ CRITICAL: This is NOT clinical diagnosis
 * This engine detects behavioral patterns to provide supportive suggestions
 * NO medical advice, NO diagnosis, NO fear-inducing language
 */

/**
 * Pattern types (behavioral, not diagnostic)
 */
export const PatternTypes = {
  ANXIETY_SPIKE: 'anxiety_spike',
  SHAME_CYCLE: 'shame_cycle',
  AVOIDANCE: 'avoidance',
  PROGRESS: 'progress',
  CONSISTENCY: 'consistency',
  ISOLATION: 'isolation',
  OVERWHELM: 'overwhelm',
};

/**
 * Detect behavioral patterns from user activity
 * @param {Object} activityData - User activity data
 * @returns {Array} Detected patterns with supportive suggestions
 */
export function detectPatterns(activityData = {}) {
  const {
    recentTools = [],
    recentTopics = [],
    sessionMetrics = {},
    reflections = [],
    timeOfDay = new Date().getHours(),
  } = activityData;

  const patterns = [];

  // Anxiety spike pattern
  const panicToolsToday = recentTools.filter(t => 
    ['panic-reset', 'breathing'].includes(t)
  ).length;

  if (panicToolsToday >= 3) {
    patterns.push({
      type: PatternTypes.ANXIETY_SPIKE,
      severity: 'medium',
      message: "You've used calming tools several times today. Would grounding exercises help?",
      suggestions: [
        { type: 'tool', id: 'grounding', label: 'Try 5-4-3-2-1 Grounding' },
        { type: 'content', id: 'anxiety-panic', label: 'Learn about anxiety' },
        { type: 'action', id: 'reach-out', label: 'Talk to someone' },
      ],
      supportive: true,
    });
  }

  // Shame cycle pattern
  const shameContent = recentTopics.filter(t => t.includes('shame')).length;
  const shameTools = recentTools.filter(t => t === 'shame-release').length;

  if (shameContent + shameTools >= 2) {
    patterns.push({
      type: PatternTypes.SHAME_CYCLE,
      severity: 'low',
      message: "You've been exploring shame. Remember: you are worthy of compassion.",
      suggestions: [
        { type: 'content', id: 'self-compassion', label: 'Self-compassion practices' },
        { type: 'tool', id: 'journaling', label: 'Journal your feelings' },
        { type: 'affirmation', text: 'Shame is a feeling, not a truth' },
      ],
      supportive: true,
    });
  }

  // Avoidance pattern
  if (sessionMetrics.completionRate < 30 && sessionMetrics.driftScore > 5) {
    patterns.push({
      type: PatternTypes.AVOIDANCE,
      severity: 'low',
      message: "You've been starting but not finishing sessions. Everything okay?",
      suggestions: [
        { type: 'tool', id: 'journaling', label: 'Journal what\'s on your mind' },
        { type: 'content', id: 'nervous-system', label: 'Quick grounding read' },
        { type: 'action', id: 'shorter-sessions', label: 'Try shorter sessions' },
      ],
      supportive: true,
    });
  }

  // Progress pattern (positive!)
  if (sessionMetrics.calmScore > 70 && sessionMetrics.completionRate > 80) {
    patterns.push({
      type: PatternTypes.PROGRESS,
      severity: 'positive',
      message: "You're showing great consistency! Your practice is paying off.",
      suggestions: [
        { type: 'insight', text: 'Your calm score is improving' },
        { type: 'encouragement', text: 'Keep up the beautiful work' },
      ],
      supportive: true,
    });
  }

  // Consistency pattern (positive!)
  if (reflections.length >= 7) {
    const daysReflected = new Set(reflections.map(r => r.date)).size;
    if (daysReflected >= 5) {
      patterns.push({
        type: PatternTypes.CONSISTENCY,
        severity: 'positive',
        message: `${daysReflected} days of reflection! You're building a healing practice.`,
        suggestions: [
          { type: 'insight', text: 'Reflection builds self-awareness' },
          { type: 'encouragement', text: 'Your commitment matters' },
        ],
        supportive: true,
      });
    }
  }

  // Late night overwhelm
  if (timeOfDay >= 22 && panicToolsToday >= 2) {
    patterns.push({
      type: PatternTypes.OVERWHELM,
      severity: 'medium',
      message: "Late night can be hard. Would a sleep reset help?",
      suggestions: [
        { type: 'tool', id: 'sleep-reset', label: 'Sleep Reset Tool' },
        { type: 'content', id: 'sleep-recovery', label: 'Sleep and recovery' },
      ],
      supportive: true,
    });
  }

  // Log detected patterns
  if (patterns.length > 0) {
    logEvent('patterns_detected', {
      patternTypes: patterns.map(p => p.type),
      count: patterns.length,
    });
  }

  return patterns;
}

/**
 * Get supportive resource recommendations based on patterns
 */
export function getPatternBasedRecommendations(patterns) {
  const allSuggestions = patterns.flatMap(p => p.suggestions || []);

  // Deduplicate and prioritize
  const seen = new Set();
  const unique = [];

  allSuggestions.forEach(suggestion => {
    const key = `${suggestion.type}-${suggestion.id || suggestion.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(suggestion);
    }
  });

  return unique.slice(0, 5); // Top 5 recommendations
}

/**
 * Check if patterns indicate crisis risk
 * @returns {boolean} True if immediate support recommended
 */
export function detectCrisisRisk(patterns) {
  const highSeverityCount = patterns.filter(p => p.severity === 'high').length;
  const mediumSeverityCount = patterns.filter(p => p.severity === 'medium').length;

  // Multiple medium or any high severity patterns
  return highSeverityCount > 0 || mediumSeverityCount >= 3;
}

/**
 * Get crisis support message
 */
export function getCrisisSupportMessage() {
  return {
    message: "You seem to be having a difficult time. You don't have to go through this alone.",
    resources: [
      { type: 'hotline', name: '988 Suicide & Crisis Lifeline', phone: '988' },
      { type: 'hotline', name: 'SAMHSA National Helpline', phone: '1-800-662-4357' },
      { type: 'tool', id: 'panic-reset', label: 'Immediate Panic Reset' },
      { type: 'action', id: 'crisis-chat', label: 'Crisis text line: Text HOME to 741741' },
    ],
    priority: 'immediate',
  };
}

