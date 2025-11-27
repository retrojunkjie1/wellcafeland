// src/ai/predictive/predictiveConfig.js

/**
 * Predictive Recovery Engine Configuration
 * Tunable weights, thresholds, and parameters for risk scoring
 */

/**
 * Risk score weights for different event types
 * Positive values increase risk, negative values decrease risk
 */
export const RISK_WEIGHTS = {
  // High-intensity tool usage
  highUrgeToolUsage: 15, // Per high-intensity urge surfing event (intensity >= 8)
  moderateUrgeToolUsage: 8, // Per moderate-intensity event (intensity 4-7)
  
  // Agent events
  criticalAgentEvent: 20, // Per critical severity agent event
  warningAgentEvent: 10, // Per warning severity agent event
  
  // Chat message distress markers
  crisisChatMessage: 25, // Per crisis-tagged chat message
  highUrgeChatMessage: 15, // Per high-urge-tagged chat message
  despairChatMessage: 12, // Per despair-tagged chat message
  shameChatMessage: 10, // Per shame-tagged chat message
  
  // Session events
  crisisSessionEvent: 20, // Per crisis-tagged session event
  distressSessionEvent: 8, // Per distress-tagged session event
  
  // Disengagement patterns
  noHealthyTools3Days: 10, // 3+ consecutive days with 0 healthy tool usage
  noHealthyTools5Days: 20, // 5+ consecutive days with 0 healthy tool usage
  noHealthyTools7Days: 30, // 7+ consecutive days with 0 healthy tool usage
  
  // Positive signals (reduce risk)
  consistentHealthyUsage5Days: -10, // 5+ consecutive days with healthy tools
  consistentHealthyUsage7Days: -15, // 7+ consecutive days with healthy tools
  gratitudePattern: -5, // Gratitude markers in chat/sessions
  progressPattern: -8, // Progress markers in sessions
  insightPattern: -6, // Insight markers in sessions
};

/**
 * Risk level thresholds
 */
export const RISK_THRESHOLDS = {
  low: { min: 0, max: 33 },
  moderate: { min: 34, max: 66 },
  high: { min: 67, max: 100 },
};

/**
 * Healthy tools (protective factors)
 * Tools that indicate positive engagement
 */
export const HEALTHY_TOOLS = [
  "breathing",
  "meditation",
  "grounding",
  "journaling",
  "body-scan",
];

/**
 * High-intensity tools (risk indicators when used frequently)
 */
export const HIGH_INTENSITY_TOOLS = [
  "urge-surfing",
];

/**
 * Days to consider for analysis
 */
export const DEFAULT_ANALYSIS_WINDOW_DAYS = 7;

/**
 * Minimum data points required for reliable analysis
 */
export const MIN_DATA_POINTS_FOR_ANALYSIS = 3;

/**
 * Tags that indicate positive signals
 */
export const POSITIVE_TAGS = [
  "gratitude",
  "hope",
  "progress",
  "insight",
  "growth",
  "engagement",
  "breakthrough",
];

/**
 * Tags that indicate negative signals
 */
export const NEGATIVE_TAGS = [
  "crisis",
  "despair",
  "high_urge",
  "shame",
  "lonely",
  "anxiety",
  "disengagement",
  "distress",
];

/**
 * Summary text templates
 */
export const SUMMARY_TEMPLATES = {
  lowRisk: {
    title: "Stable Recovery Pattern",
    tone: "supportive",
  },
  moderateRisk: {
    title: "Mixed Recovery Signals",
    tone: "observational",
  },
  highRisk: {
    title: "Increased Support Needed",
    tone: "supportive",
  },
  insufficientData: {
    title: "Building Recovery Profile",
    tone: "neutral",
  },
};

/**
 * Get risk level label from score
 * @param {number|null} score - Risk score (0-100) or null
 * @returns {string} Risk level label
 */
export function getRiskLevelFromScore(score) {
  if (score === null || score === undefined) {
    return "insufficient_data";
  }
  
  if (score <= RISK_THRESHOLDS.low.max) {
    return "low";
  } else if (score <= RISK_THRESHOLDS.moderate.max) {
    return "moderate";
  } else {
    return "high";
  }
}

/**
 * Get risk level color (for UI)
 * @param {string} riskLevel - Risk level
 * @returns {string} Tailwind color class
 */
export function getRiskLevelColor(riskLevel) {
  switch (riskLevel) {
    case "low":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    case "moderate":
      return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "high":
      return "text-destructive border-destructive/30 bg-destructive/10";
    default:
      return "text-muted-foreground border-border/30 bg-muted/10";
  }
}

