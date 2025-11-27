// src/services/emotionSensor.js
// Emotional sensor layer for real-time voice and text analysis

import { logError, logInfo } from "./logService";

/**
 * Detect risk phrases that indicate crisis
 * @param {string} text - Text to analyze
 * @returns {boolean}
 */
export function detectRiskPhrases(text) {
  if (!text || typeof text !== "string") return false;

  const lowerText = text.toLowerCase();
  
  const crisisPhrases = [
    "i can't do this anymore",
    "i want to die",
    "they'd be better without me",
    "i'm going to kill myself",
    "i want to kill myself",
    "i'm going to end it",
    "i should just die",
    "everyone would be better off",
    "i can't go on",
    "i don't want to live",
    "life isn't worth it",
    "i wish i was dead",
    "i'm going to hurt myself",
    "i want to hurt myself",
    "no reason to live",
    "kill myself",
  ];

  return crisisPhrases.some(phrase => lowerText.includes(phrase));
}

/**
 * Detect emotional state from text
 * @param {string} text - Text to analyze
 * @returns {Object} { emotionalState, intensity, tags }
 */
export function detectEmotionalState(text) {
  if (!text || typeof text !== "string") {
    return {
      emotionalState: "neutral",
      intensity: 1,
      tags: [],
    };
  }

  const lowerText = text.toLowerCase();
  let emotionalState = "neutral";
  let intensity = 1;
  const tags = [];

  // Anxiety indicators
  const anxietyKeywords = [
    "anxious", "anxiety", "worried", "worry", "nervous", "panic", "panicking",
    "can't breathe", "heart racing", "sweating", "shaking", "overwhelmed",
    "freaking out", "stressed", "stress", "terrified", "scared", "afraid"
  ];
  const anxietyCount = anxietyKeywords.filter(kw => lowerText.includes(kw)).length;
  if (anxietyCount > 0) {
    emotionalState = "anxious";
    intensity = Math.min(5, 2 + anxietyCount);
    tags.push("anxiety");
  }

  // Overwhelm indicators
  const overwhelmKeywords = [
    "overwhelmed", "too much", "can't handle", "drowning", "sinking",
    "breaking", "falling apart", "losing it", "can't cope", "exhausted",
    "burnt out", "drained", "empty"
  ];
  const overwhelmCount = overwhelmKeywords.filter(kw => lowerText.includes(kw)).length;
  if (overwhelmCount > 0 && intensity < overwhelmCount + 1) {
    emotionalState = "overwhelmed";
    intensity = Math.min(5, 2 + overwhelmCount);
    tags.push("overwhelm");
  }

  // Flat/depressed indicators
  const flatKeywords = [
    "numb", "empty", "nothing", "flat", "dead inside", "no feeling",
    "can't feel", "disconnected", "distant", "hollow", "void",
    "depressed", "sad", "hopeless", "helpless", "worthless"
  ];
  const flatCount = flatKeywords.filter(kw => lowerText.includes(kw)).length;
  if (flatCount > 0 && intensity < flatCount + 1) {
    emotionalState = "flat";
    intensity = Math.min(5, 2 + flatCount);
    tags.push("depression", "numbness");
  }

  // Craving/urge indicators
  const cravingKeywords = [
    "craving", "urge", "want to use", "tempted", "thinking about",
    "need a drink", "need to use", "want it", "can't stop thinking",
    "obsessing", "fixating", "triggers", "triggered"
  ];
  const cravingCount = cravingKeywords.filter(kw => lowerText.includes(kw)).length;
  if (cravingCount > 0 && intensity < cravingCount + 1) {
    emotionalState = "craving";
    intensity = Math.min(5, 2 + cravingCount);
    tags.push("urge", "craving");
  }

  // Lonely indicators
  const lonelyKeywords = [
    "lonely", "alone", "isolated", "no one", "nobody", "by myself",
    "no friends", "no support", "abandoned", "left out", "disconnected"
  ];
  const lonelyCount = lonelyKeywords.filter(kw => lowerText.includes(kw)).length;
  if (lonelyCount > 0 && intensity < lonelyCount + 1) {
    emotionalState = "lonely";
    intensity = Math.min(5, 2 + lonelyCount);
    tags.push("loneliness", "isolation");
  }

  // Grounded/calm indicators
  const groundedKeywords = [
    "calm", "peaceful", "centered", "grounded", "present", "okay",
    "better", "relief", "breathing", "safe", "stable", "clear",
    "focused", "grateful", "thankful", "hopeful"
  ];
  const groundedCount = groundedKeywords.filter(kw => lowerText.includes(kw)).length;
  if (groundedCount > 2 && emotionalState === "neutral") {
    emotionalState = "grounded";
    intensity = Math.max(1, 3 - groundedCount);
    tags.push("calm", "grounded");
  }

  // Intensity modifiers
  const intensityModifiers = [
    { pattern: /!{2,}/g, add: 1 }, // Multiple exclamation marks
    { pattern: /\b(very|extremely|incredibly|terribly|really)\b/g, add: 1 },
    { pattern: /\b(can't|cannot|won't|will not)\b/g, add: 0.5 },
  ];

  intensityModifiers.forEach(mod => {
    const matches = lowerText.match(mod.pattern);
    if (matches) {
      intensity = Math.min(5, intensity + (mod.add * matches.length));
    }
  });

  intensity = Math.round(intensity);

  return {
    emotionalState,
    intensity,
    tags: [...new Set(tags)], // Remove duplicates
  };
}

/**
 * Detect escalation patterns
 * @param {string} text - Text to analyze
 * @param {Object} previousState - Previous emotional state (optional)
 * @returns {Object} { escalated: boolean, reason?: string }
 */
export function detectEscalation(text, previousState = null) {
  const current = detectEmotionalState(text);
  const crisis = detectRiskPhrases(text);

  if (crisis) {
    return {
      escalated: true,
      reason: "crisis_language",
      level: "critical",
    };
  }

  if (previousState) {
    // Check if intensity increased significantly
    if (current.intensity >= 4 && previousState.intensity < 3) {
      return {
        escalated: true,
        reason: "intensity_spike",
        level: "high",
      };
    }

    // Check if emotional state shifted to more negative
    const negativeStates = ["anxious", "overwhelmed", "flat", "craving"];
    const wasNeutral = !negativeStates.includes(previousState.emotionalState);
    const isNegative = negativeStates.includes(current.emotionalState);
    
    if (wasNeutral && isNegative) {
      return {
        escalated: true,
        reason: "emotional_shift",
        level: "medium",
      };
    }
  }

  return {
    escalated: false,
    level: current.intensity >= 4 ? "high" : current.intensity >= 3 ? "medium" : "low",
  };
}

/**
 * Comprehensive emotional analysis
 * @param {string} text - Text to analyze
 * @param {Object} previousState - Previous emotional state (optional)
 * @returns {Object} { emotionalState, intensity, tags, crisis, escalation }
 */
export function analyzeEmotion(text, previousState = null) {
  const emotionalState = detectEmotionalState(text);
  const crisis = detectRiskPhrases(text);
  const escalation = detectEscalation(text, previousState);

  return {
    ...emotionalState,
    crisis,
    escalation: escalation.escalated,
    escalationLevel: escalation.level,
    escalationReason: escalation.reason,
  };
}

export default {
  detectRiskPhrases,
  detectEmotionalState,
  detectEscalation,
  analyzeEmotion,
};

