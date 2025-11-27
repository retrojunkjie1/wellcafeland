// src/ai/telemetry/emotionalMatrix.js

/**
 * Emotional Telemetry Matrix
 * Central configuration for mapping events to risk scores, tags, and agent recommendations
 */

/**
 * Default configuration values - used as fallbacks when config is missing
 */
export const DEFAULT_CONFIG = {
  riskScore: 1,
  tags: [],
  recommendedAgents: [],
  riskLevel: "LOW",
  thresholds: {
    low: 3,
    moderate: 6,
    high: 8,
    critical: 9,
  },
};

/**
 * Event type definitions with risk scoring rules
 */
export const EVENT_TYPES = {
  TOOL_USAGE: "tool_usage",
  CHAT_MESSAGE: "chat_message",
  SESSION_EVENT: "session_event",
};

/**
 * Chat message risk scoring configuration
 */
export const CHAT_RISK_CONFIG = {
  // Content length indicators
  contentLength: {
    veryShort: { threshold: 10, riskScore: 3 }, // < 10 chars - possible distress
    short: { threshold: 50, riskScore: 2 }, // 10-50 chars
    normal: { threshold: 500, riskScore: 1 }, // 50-500 chars
    long: { threshold: Infinity, riskScore: 1 }, // > 500 chars
  },
  // Distress markers (keywords/phrases that indicate high risk)
  distressMarkers: {
    crisis: {
      keywords: ["suicide", "kill myself", "end it", "no point", "give up", "hopeless"],
      riskScore: 10,
      tags: ["crisis", "despair"],
    },
    highUrge: {
      keywords: ["craving", "need to use", "can't resist", "urge", "want to relapse"],
      riskScore: 8,
      tags: ["high_urge", "cravings"],
    },
    shame: {
      keywords: ["ashamed", "disgusted", "hate myself", "worthless", "failure"],
      riskScore: 7,
      tags: ["shame", "self_worth"],
    },
    despair: {
      keywords: ["despair", "hopeless", "nothing matters", "alone", "isolated"],
      riskScore: 7,
      tags: ["despair", "lonely"],
    },
    anxiety: {
      keywords: ["anxious", "panic", "overwhelmed", "can't breathe", "racing thoughts"],
      riskScore: 5,
      tags: ["anxiety", "overwhelmed"],
    },
    grief: {
      keywords: ["grief", "loss", "mourning", "miss them", "gone"],
      riskScore: 4,
      tags: ["grief", "processing"],
    },
  },
  // Positive markers (reduce risk)
  positiveMarkers: {
    keywords: ["grateful", "better", "progress", "hope", "thankful", "improving"],
    riskReduction: 1,
    tags: ["positive", "progress"],
  },
};

/**
 * Session event risk scoring configuration
 */
export const SESSION_RISK_CONFIG = {
  // Group types and their baseline risk
  groupTypes: {
    MIR: { baselineRisk: 2, tags: ["group", "men"] },
    "Men's Group": { baselineRisk: 2, tags: ["group", "men"] },
    "Spiritual Concepts": { baselineRisk: 1, tags: ["group", "spiritual"] },
    "Women's Group": { baselineRisk: 2, tags: ["group", "women"] },
    "Mixed Group": { baselineRisk: 2, tags: ["group", "mixed"] },
    "Individual Session": { baselineRisk: 3, tags: ["individual", "focused"] },
  },
  // Progress vs distress indicators in summary text
  progressMarkers: {
    keywords: ["breakthrough", "insight", "growth", "understanding", "clarity", "progress"],
    riskReduction: 2,
    tags: ["progress", "breakthrough"],
  },
  distressMarkers: {
    keywords: ["struggling", "difficult", "challenging", "resistance", "blocked", "stuck"],
    riskBoost: 2,
    tags: ["distress", "struggling"],
  },
  crisisMarkers: {
    keywords: ["crisis", "urgent", "immediate", "critical", "escalation"],
    riskBoost: 5,
    tags: ["crisis", "urgent"],
  },
};

/**
 * Tool-specific risk scoring configurations
 */
export const TOOL_RISK_CONFIG = {
  "urge-surfing": {
    // Urge surfing intensity thresholds
    intensityBefore: {
      low: [0, 3],      // riskScore: 1-2
      moderate: [4, 6], // riskScore: 4-5
      high: [7, 8],     // riskScore: 7-8
      critical: [9, 10], // riskScore: 9-10
    },
    intensityAfter: {
      // If intensity increases, that's concerning
      increased: { threshold: 2, riskBoost: 2 }, // If after > before + 2, add 2 to risk
      decreased: { threshold: -2, riskReduction: 1 }, // If after < before - 2, reduce by 1
    },
    tags: {
      high_urge: { threshold: 7, riskScore: 7 },
      escalating: { condition: "intensity_increased", riskScore: 8 },
      stable: { condition: "intensity_stable", riskScore: 3 },
      improving: { condition: "intensity_decreased", riskScore: 2 },
    },
  },
  "grounding": {
    // Grounding tool - generally low risk, but can indicate distress if used frequently
    feltGrounded: {
      false: { riskScore: 4 }, // If user didn't feel grounded, moderate concern
      true: { riskScore: 1 },
    },
    tags: {
      distress: { condition: "not_grounded", riskScore: 4 },
      seeking_stability: { riskScore: 2 },
    },
  },
  "breathing": {
    // Breathing exercises - generally positive, but very short sessions might indicate distress
    durationMs: {
      veryShort: { threshold: 60000, riskScore: 3 }, // < 1 min
      normal: { threshold: 300000, riskScore: 1 }, // 1-5 min
      extended: { threshold: Infinity, riskScore: 0 }, // > 5 min
    },
    tags: {
      seeking_calm: { riskScore: 2 },
      distress: { condition: "very_short_session", riskScore: 3 },
    },
  },
  "journaling": {
    // Journaling - word count and content can indicate state
    wordCount: {
      veryLow: { threshold: 10, riskScore: 3 }, // < 10 words
      low: { threshold: 50, riskScore: 2 }, // 10-50 words
      normal: { threshold: Infinity, riskScore: 1 },
    },
    tags: {
      processing: { riskScore: 2 },
      disengagement: { condition: "very_low_word_count", riskScore: 4 },
    },
  },
  "affirmations": {
    // Affirmations - concern type can indicate needs
    concernType: {
      cravings: { riskScore: 5 },
      shame: { riskScore: 4 },
      anxiety: { riskScore: 3 },
      grief: { riskScore: 4 },
      "self-worth": { riskScore: 3 },
      sleep: { riskScore: 2 },
    },
    tags: {
      seeking_support: { riskScore: 2 },
      high_need: { condition: "cravings_or_shame", riskScore: 5 },
    },
  },
};

/**
 * Risk score ranges and their meanings
 */
export const RISK_LEVELS = {
  LOW: { min: 0, max: 3, label: "Low", color: "emerald" },
  MODERATE: { min: 4, max: 6, label: "Moderate", color: "amber" },
  HIGH: { min: 7, max: 8, label: "High", color: "orange" },
  CRITICAL: { min: 9, max: 10, label: "Critical", color: "red" },
};

/**
 * Tag definitions with descriptions
 */
export const EMOTIONAL_TAGS = {
  high_urge: "Experiencing strong cravings or urges",
  escalating: "Situation is getting worse",
  stable: "Situation is stable",
  improving: "Situation is improving",
  distress: "Showing signs of distress",
  seeking_stability: "Actively seeking stability",
  seeking_calm: "Actively seeking calm",
  processing: "Processing emotions or experiences",
  disengagement: "Showing signs of disengagement",
  seeking_support: "Actively seeking support",
  high_need: "High support needs identified",
  despair: "Showing signs of despair",
  crisis: "Potential crisis situation",
};

/**
 * Agent recommendations based on risk level
 */
export const AGENT_RECOMMENDATIONS = {
  LOW: [], // No agent action needed
  MODERATE: ["seer"], // Seer observes patterns
  HIGH: ["seer", "sentinel"], // Both observe and monitor
  CRITICAL: ["sentinel", "oracle"], // Sentinel monitors, Oracle provides guidance
};

/**
 * Get risk level from score
 */
export function getRiskLevel(riskScore) {
  if (riskScore >= RISK_LEVELS.CRITICAL.min) return RISK_LEVELS.CRITICAL;
  if (riskScore >= RISK_LEVELS.HIGH.min) return RISK_LEVELS.HIGH;
  if (riskScore >= RISK_LEVELS.MODERATE.min) return RISK_LEVELS.MODERATE;
  return RISK_LEVELS.LOW;
}

/**
 * Get recommended agents for a risk level
 */
export function getRecommendedAgents(riskLevel) {
  return AGENT_RECOMMENDATIONS[riskLevel.label.toUpperCase()] || [];
}

