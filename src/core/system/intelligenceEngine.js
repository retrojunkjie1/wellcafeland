// src/core/system/intelligenceEngine.js
// Universal intelligence layer for system awareness and auto-correction

import { ContextMemory } from "@/services/contextMemory";
import { analyzeEmotionalState, analyzeMessageEmotion, detectTriggerDomains } from "@/services/emotionalAnalysis";
import { analyzeSpiritualState } from "@/services/spiritualAnalysis";
import { forecastRecoveryRisk } from "@/services/recoveryForecast";
import { evaluateMessageRisk } from "@/services/riskService";

// System states
export const SYSTEM_STATES = {
  CALM: "CALM",
  ANXIOUS: "ANXIOUS",
  OVERWHELMED: "OVERWHELMED",
  URGE: "URGE",
  CONFUSED: "CONFUSED",
  LOST: "LOST",
  SPIRITUAL: "SPIRITUAL",
  REFLECTIVE: "REFLECTIVE",
};

// Observation storage (in-memory, lightweight)
const observations = [];
const MAX_OBSERVATIONS = 100;

/**
 * Observe an event from any part of the system
 * @param {Object} event - Event data
 * @param {string} event.type - Event type (chat, tool, search, directory, video, audio, error)
 * @param {Object} event.data - Event-specific data
 */
export function observe(event) {
  if (!event || !event.type) {
    console.warn("[intel] Invalid observation:", event);
    return;
  }

  const observation = {
    ...event,
    timestamp: Date.now(),
    id: `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  observations.push(observation);
  
  // Keep only last MAX_OBSERVATIONS
  if (observations.length > MAX_OBSERVATIONS) {
    observations.shift();
  }

  console.warn("[intel] observation:", observation.type, observation.data || {});

  // Auto-interpret and adapt
  const interpreted = interpret(observation);
  if (interpreted) {
    adapt(interpreted);
  }

  return observation;
}

/**
 * Interpret an observation to determine system state
 * @param {Object} observation - Observation data
 * @returns {Object|null} Interpreted state
 */
export function interpret(observation) {
  if (!observation) return null;

  const { type, data } = observation;
  let interpretedState = null;

  if (type === "chat" && data?.text) {
    const text = data.text;
    const emotion = analyzeEmotionalState(text);
    const spirit = analyzeSpiritualState(text);
    const forecast = forecastRecoveryRisk(emotion.emotion, text);

    // Determine system state
    let systemState = SYSTEM_STATES.CALM;
    
    if (emotion.emotion === "panic" || emotion.intensity >= 4) {
      systemState = SYSTEM_STATES.ANXIOUS;
    } else if (emotion.emotion === "urge" || forecast.riskLevel === "relapse-risk") {
      systemState = SYSTEM_STATES.URGE;
    } else if (emotion.emotion === "overwhelm" || emotion.emotion === "dissociation") {
      systemState = SYSTEM_STATES.OVERWHELMED;
    } else if (isConfusion(text)) {
      systemState = SYSTEM_STATES.CONFUSED;
    } else if (spirit.spiritualNeed === "identity" || spirit.spiritualNeed === "alignment") {
      systemState = SYSTEM_STATES.LOST;
    } else if (spirit.spiritualNeed) {
      systemState = SYSTEM_STATES.SPIRITUAL;
    } else if (emotion.intensity <= 2 && emotion.emotion === "neutral") {
      systemState = SYSTEM_STATES.REFLECTIVE;
    }

    interpretedState = {
      systemState,
      emotion,
      spirit,
      forecast,
      needsAudio: emotion.intensity >= 4 || forecast.riskLevel === "relapse-risk",
      needsVideo: forecast.recommendedIntervention === "grounding" || spirit.spiritualNeed === "grounding",
      recommendTool: forecast.recommendedIntervention,
    };
  } else if (type === "search_failure" || type === "api_error") {
    interpretedState = {
      systemState: SYSTEM_STATES.CONFUSED,
      error: true,
      needsRetry: true,
    };
  } else if (type === "tool_completion") {
    interpretedState = {
      systemState: SYSTEM_STATES.REFLECTIVE,
      toolUsed: data?.toolId,
    };
  }

  if (interpretedState) {
    console.warn("[intel] decision:", interpretedState);
  }

  return interpretedState;
}

/**
 * Adapt system behavior based on interpreted state
 * @param {Object} interpretedState - Interpreted state from interpret()
 */
export function adapt(interpretedState) {
  if (!interpretedState) return;

  const { systemState, needsAudio, needsVideo, recommendTool, error } = interpretedState;

  // Store in context memory
  if (systemState) {
    ContextMemory.setLastEmotionalState({
      systemState,
      ...interpretedState,
    });
  }

  // Auto-correction for errors
  if (error && interpretedState.needsRetry) {
    console.warn("[intel] Auto-correction triggered for error");
    // This will be handled by the calling service
  }

  return interpretedState;
}

/**
 * Optimize system based on current state
 * @param {Object} systemState - Current system state
 * @returns {Object} Optimization recommendations
 */
export function optimize(systemState) {
  const recentObservations = observations.slice(-20);
  
  // Detect patterns
  const panicCount = recentObservations.filter(o => 
    o.type === "chat" && isPanic(o.data?.text || "")
  ).length;
  
  const overwhelmCount = recentObservations.filter(o => 
    o.type === "chat" && isOverwhelm(o.data?.text || "")
  ).length;
  
  const urgeCount = recentObservations.filter(o => 
    o.type === "chat" && isUrge(o.data?.text || "")
  ).length;

  // Detect loops (repeated similar messages)
  const isLooping = isLoop(recentObservations.filter(o => o.type === "chat").map(o => o.data?.text).filter(Boolean));

  const recommendations = {
    mode: systemState?.preferredMode || "text",
    escalate: panicCount >= 2 || urgeCount >= 2,
    recommendTool: null,
    openWorkspace: null,
  };

  if (panicCount >= 2 || systemState?.systemState === SYSTEM_STATES.ANXIOUS) {
    recommendations.recommendTool = "grounding";
    recommendations.openWorkspace = "video";
    recommendations.mode = "video";
  } else if (urgeCount >= 2 || systemState?.systemState === SYSTEM_STATES.URGE) {
    recommendations.recommendTool = "urge-surfing";
    recommendations.mode = "audio";
  } else if (overwhelmCount >= 2 || systemState?.systemState === SYSTEM_STATES.OVERWHELMED) {
    recommendations.recommendTool = "breathing";
    recommendations.mode = "audio";
  }

  if (isLooping) {
    recommendations.escalate = true;
    recommendations.recommendTool = "grounding";
  }

  console.warn("[intel] optimization:", recommendations);

  return recommendations;
}

// Classification helpers

/**
 * Check if text indicates panic
 */
export function isPanic(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return lower.includes("panic") || 
         lower.includes("can't breathe") || 
         lower.includes("freaking out") ||
         lower.includes("help") && lower.includes("urgent");
}

/**
 * Check if text indicates overwhelm
 */
export function isOverwhelm(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return lower.includes("overwhelmed") || 
         lower.includes("too much") || 
         lower.includes("can't handle") ||
         lower.includes("drowning");
}

/**
 * Check if text indicates urge/craving
 */
export function isUrge(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return lower.includes("craving") || 
         lower.includes("urge") || 
         lower.includes("tempted") ||
         lower.includes("want to use");
}

/**
 * Check if text indicates confusion
 */
export function isConfusion(text) {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  return lower.includes("confused") || 
         lower.includes("don't understand") || 
         lower.includes("don't know") ||
         lower.includes("what do i do") ||
         lower.includes("how do i");
}

/**
 * Check if messages show a loop (repeated similar content)
 */
export function isLoop(messages) {
  if (!Array.isArray(messages) || messages.length < 3) return false;
  
  // Check if last 3 messages are very similar
  const last3 = messages.slice(-3);
  const words = last3.map(m => m.toLowerCase().split(/\s+/).slice(0, 10).join(" "));
  
  // Simple similarity check
  const similarity = words.filter((w, i) => {
    if (i === 0) return false;
    const prev = words[i - 1];
    // Check if 70% of words overlap
    const wWords = w.split(/\s+/);
    const prevWords = prev.split(/\s+/);
    const overlap = wWords.filter(word => prevWords.includes(word)).length;
    return overlap / Math.max(wWords.length, prevWords.length) > 0.7;
  }).length;

  return similarity >= 2;
}

/**
 * Get recent observations
 */
export function getRecentObservations(limit = 20) {
  return observations.slice(-limit);
}

/**
 * Clear observations (for testing or reset)
 */
export function clearObservations() {
  observations.length = 0;
}

/**
 * Enrich a message object with emotion analysis
 * @param {Object} message - Message object with role and content
 * @returns {Object} Message with emotion field attached (if user message)
 */
export function enrichMessageWithEmotion(message) {
  try {
    if (!message || typeof message !== "object") {
      return message;
    }

    // Only enrich user messages with non-empty content
    if (message.role === "user" && message.content && typeof message.content === "string" && message.content.trim()) {
      const emotion = analyzeMessageEmotion(message.content);
      return {
        ...message,
        emotion,
      };
    }

    return message;
  } catch (err) {
    console.warn("[intel] Failed to enrich message with emotion:", err);
    return message; // Return original on error
  }
}

/**
 * Analyze message signals (triggers and risk)
 * @param {Object} message - Message object (should have content and optionally emotion)
 * @returns {Object} { triggers, risk }
 */
export function analyzeMessageSignals(message) {
  try {
    if (!message || typeof message !== "object" || !message.content || typeof message.content !== "string") {
      return {
        triggers: [],
        risk: { riskLevel: "low", reasons: [], domains: [] },
      };
    }

    const triggerDomains = detectTriggerDomains(message.content);
    const risk = evaluateMessageRisk({
      text: message.content,
      emotion: message.emotion,
      triggers: triggerDomains,
    });

    return {
      triggers: triggerDomains,
      risk,
    };
  } catch (err) {
    console.warn("[intel] Failed to analyze message signals:", err);
    return {
      triggers: [],
      risk: { riskLevel: "low", reasons: [], domains: [] },
    };
  }
}

/**
 * Get recommended tool based on message, emotion, triggers, and risk
 * @param {Object} params
 * @param {Object} params.message - Message object
 * @param {Object} params.emotion - Emotion analysis result
 * @param {string[]} params.triggers - Trigger domains
 * @param {Object} params.risk - Risk analysis result
 * @returns {Object|null} Recommendation object or null
 */
export function getRecommendedTool({ message, emotion, triggers, risk }) {
  try {
    if (!message || !emotion || !triggers || !risk) {
      return null;
    }

    // Cravings → urge-surfing
    if (triggers.includes("cravings") || risk.domains.includes("cravings")) {
      return {
        kind: "tool",
        toolId: "urge-surfing",
        reason: "Because you mentioned cravings, we can try a short urge surfing exercise.",
      };
    }

    // Anxious or overwhelmed → breathing or grounding
    if (emotion.label === "anxious" || emotion.label === "overwhelmed" || emotion.intensity >= 0.7) {
      // Prefer grounding if very intense, breathing if moderate
      if (emotion.intensity >= 0.8) {
        return {
          kind: "tool",
          toolId: "grounding",
          reason: "Because you're feeling overwhelmed, we can try a grounding exercise to help you feel more present.",
        };
      }
      return {
        kind: "tool",
        toolId: "breathing",
        reason: "Because you're feeling anxious, we can try a breathing exercise to help you calm down.",
      };
    }

    // Shame or guilt → journaling or self-surgeon
    if (triggers.includes("shame") || triggers.includes("guilt")) {
      // Prefer self-surgeon for shame, journaling for guilt
      if (triggers.includes("shame")) {
        return {
          kind: "tool",
          toolId: "self-surgeon",
          reason: "Because you mentioned shame, we can try a self-inquiry exercise to help you reframe these feelings.",
        };
      }
      return {
        kind: "tool",
        toolId: "journaling",
        reason: "Because you mentioned guilt, we can try journaling to help you process these feelings.",
      };
    }

    // High risk → grounding (safest option)
    if (risk.riskLevel === "high") {
      return {
        kind: "tool",
        toolId: "grounding",
        reason: "Based on what you just shared, we can try a grounding exercise to help you feel more stable.",
      };
    }

    // Moderate risk with isolation → journaling
    if (risk.riskLevel === "moderate" && triggers.includes("isolation")) {
      return {
        kind: "tool",
        toolId: "journaling",
        reason: "Because you mentioned feeling isolated, we can try journaling to help you process your thoughts.",
      };
    }

    return null;
  } catch (err) {
    console.warn("[intel] Failed to get recommended tool:", err);
    return null;
  }
}

export default {
  observe,
  interpret,
  adapt,
  optimize,
  isPanic,
  isOverwhelm,
  isUrge,
  isConfusion,
  isLoop,
  getRecentObservations,
  clearObservations,
  enrichMessageWithEmotion,
  analyzeMessageSignals,
  getRecommendedTool,
  SYSTEM_STATES,
};

