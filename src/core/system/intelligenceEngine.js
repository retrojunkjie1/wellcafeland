// src/core/system/intelligenceEngine.js
// Universal intelligence layer for system awareness and auto-correction
// Phase 25: Aligned to use sub-engines (emotionEngine, riskEngine, patternEngine)

import { ContextMemory } from "@/services/contextMemory";
import { analyzeEmotionalState } from "@/services/emotionalAnalysis";
import { analyzeSpiritualState } from "@/services/spiritualAnalysis";
import { forecastRecoveryRisk } from "@/services/recoveryForecast";
import { EMOTIONAL_STATES, TRIGGER_DOMAINS } from "@/ai/human/humanMap";
import { analyzeIdentitySignals } from "@/ai/human/identityModel";
import { analyzeRelationshipSignals } from "@/ai/relationship/relationshipModel";
import { enrichMessageWithEmotionSafe } from "./emotionEngine";
import { analyzeMessageSignalsSafe } from "./riskEngine";
import { getPhrasingStyle, buildAssistantResponse } from "./phrasingEngine";
import { computeMessageDrift } from "./behavioralDriftEngine";

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

  const { systemState, needsAudio: _needsAudio, needsVideo: _needsVideo, recommendTool: _recommendTool, error } = interpretedState;

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
 * Phase 25: Delegates to emotionEngine for consistency.
 * @param {Object} message - Message object with role and content
 * @returns {Object} Message with emotion field attached (if user message)
 */
export function enrichMessageWithEmotion(message) {
  return enrichMessageWithEmotionSafe(message);
}

/**
 * Analyze message signals (triggers and risk)
 * Phase 25: Delegates to riskEngine for consistency.
 * @param {Object} message - Message object (should have content and optionally emotion)
 * @returns {Object} { triggers, risk }
 */
export function analyzeMessageSignals(message) {
  return analyzeMessageSignalsSafe(message);
}

/**
 * Enrich a message with relationship stress mapping.
 * Phase 29: Relationship Stress Mapping Engine
 * @param {Object} message - Message object with content and optionally emotion
 * @returns {Object} Message with relationship field attached
 */
export function enrichMessageWithRelationship(message) {
  try {
    if (!message || typeof message !== "object" || !message.content) {
      return message;
    }

    const relationship = analyzeRelationshipSignals(message);
    return {
      ...message,
      relationship,
    };
  } catch (err) {
    console.warn("[intel] Failed to enrich relationship signals:", err);
    return message;
  }
}

/**
 * Enrich a message with identity fracture modeling.
 * @param {Object} message
 * @returns {Object} message with identity field
 */
export function enrichMessageWithIdentity(message) {
  try {
    if (!message || typeof message !== "object") return message;
    if (!message.content || typeof message.content !== "string") return message;

    const identity = analyzeIdentitySignals(message);
    return {
      ...message,
      identity,
    };
  } catch (err) {
    console.warn("[intel] Failed to enrich message with identity:", err);
    return message;
  }
}

const UNRELATED_PATTERNS = [
  /\bquote(s)?\b/i, /\bstart\s*up\s*line(s)?\b/i, /\bpick\s*up\s*line(s)?\b/i,
  /\bpickup\s*line(s)?\b/i, /\bjoke(s)?\b/i, /\bfunny\b/i, /\bline(s)?\s+for\b/i,
];
const URGE_SIGNALS = ["craving", "crave", "urge", "relapse", "i want to use", "can't stop", "about to", "using again", "want to use", "cant stop"];
const BREATHING_SIGNALS = ["panic", "heart racing", "can't breathe", "overwhelmed", "anxious", "breathing", "breathe", "breath", "cant breathe", "overwhelm"];

function isUnrelatedRequest(text) {
  const t = (text || "").trim();
  if (!t || t.length < 3) return false;
  return UNRELATED_PATTERNS.some((p) => p.test(t));
}

function userMessageHasStrongSignal(text, toolId) {
  const t = (text || "").toLowerCase().trim();
  if (!t) return false;
  if (toolId === "urge-surfing") return URGE_SIGNALS.some((s) => t.includes(s));
  if (toolId === "breathing") return BREATHING_SIGNALS.some((s) => t.includes(s));
  return true;
}

/**
 * Get recommended tool based on message, emotion, triggers, and risk
 * Phase 21: Enhanced with Human Map ontology
 * Phase 22: Expanded with deeper recommendation logic and nuanced mappings
 * Phase 23: Relevance gating - only suggest when user message contains strong signals
 * @param {Object} params
 * @param {Object} params.message - Message object
 * @param {Object} params.emotion - Emotion analysis result
 * @param {string[]} params.triggers - Trigger domains
 * @param {Object} params.risk - Risk analysis result
 * @returns {Object|null} Recommendation object or null
 */
export function getRecommendedTool({ message, emotion, triggers, risk }) {
  try {
    const rawText = typeof message?.content === "string" ? message.content : message?.text || "";
    if (isUnrelatedRequest(rawText)) return null;

    const _emotion = emotion || message?.emotion;
    const _triggers = triggers || [];
    const _risk = risk || { riskLevel: "low", reasons: [], domains: [] };
    const riskLevel = _risk.riskLevel || "low";
    const label = _emotion?.label || "";
    const intensity = _emotion?.intensity || 0;

    // Priority 1: High-risk situations → grounding (safest, most stabilizing; always offer)
    if (riskLevel === "high") {
      return { kind: "tool", toolId: "grounding", reason: "A short grounding practice might help you feel more stable." };
    }

    // Priority 2: Cravings / relapse pressure → urge-surfing (REQUIRE text signals)
    if ((_triggers.includes("cravings") || _triggers.includes("relapse_pressure") || _risk.domains?.includes("cravings")) &&
        userMessageHasStrongSignal(rawText, "urge-surfing")) {
      return { kind: "tool", toolId: "urge-surfing", reason: "Try a 60s reset? Surf the urge instead of fighting it." };
    }

    // Priority 3: Shame / self-worth collapse → self-surgeon (require shame-related text)
    if ((_triggers.includes("shame") || _triggers.includes("self_worth_collapse") || label === "ashamed" || label === "humiliated") &&
        /shame|ashamed|self.?blame|worthless|stupid|failure/i.test(rawText)) {
      return { kind: "tool", toolId: "self-surgeon", reason: "A short practice might help with that heavy feeling." };
    }

    // Priority 4: Guilt → journaling (require guilt-related text)
    if ((_triggers.includes("guilt") || label === "guilty" || label === "regretful") &&
        /guilt|guilty|regret|sorry|wrong/i.test(rawText)) {
      return { kind: "tool", toolId: "journaling", reason: "Journaling can help process these feelings." };
    }

    // Priority 5: Anxiety / panic / fear → breathing (REQUIRE text signals)
    if ((_triggers.includes("anxiety") || ["anxious", "panicked", "fearful", "stressed", "tense"].includes(label) || intensity >= 0.8) &&
        userMessageHasStrongSignal(rawText, "breathing")) {
      return { kind: "tool", toolId: "breathing", reason: "Try a 60s breathing reset?" };
    }

    // Priority 6: Overwhelm / pressure stacking → grounding (REQUIRE text signals)
    if ((_triggers.includes("overwhelm") || label === "overwhelmed" || _triggers.includes("pressure_stacking") || _triggers.includes("burnout")) &&
        userMessageHasStrongSignal(rawText, "breathing")) {
      return { kind: "tool", toolId: "grounding", reason: "A short grounding practice might help." };
    }

    // Priority 7: Grief / loss → grounding (require grief-related text)
    if ((_triggers.includes("loss_grief") || label === "grieving" || label === "sad" || _triggers.includes("grief_waves")) &&
        /grief|grieving|loss|lost\s+(him|her|them)|miss\s+(him|her|them)/i.test(rawText)) {
      return { kind: "tool", toolId: "grounding", reason: "A short grounding practice might help you stay present." };
    }

    // Priority 8: Loneliness / isolation → journaling (require loneliness-related text)
    if ((_triggers.includes("loneliness") || _triggers.includes("social_isolation") || label === "lonely" || label === "abandoned") &&
        /alone|lonely|isolat|abandon|no one|nobody/i.test(rawText)) {
      return { kind: "tool", toolId: "journaling", reason: "Journaling can create safe space on the page." };
    }

    // Priority 9: Identity confusion → self-surgeon (require identity-related text)
    if ((_triggers.includes("identity_crisis") || _triggers.includes("purpose_confusion") || _triggers.includes("spiritual_emptiness") || label === "confused") &&
        /lost|confused|who am i|purpose|identity/i.test(rawText)) {
      return { kind: "tool", toolId: "self-surgeon", reason: "We can explore that together." };
    }

    // Priority 10: Anger / frustration / resentment → breathing (anger channeling tool mapped to breathing for regulation)
    if (_triggers.includes("anger") || _triggers.includes("resentment") || _triggers.includes("anger_dysregulation") || ["angry", "frustrated", "irritated", "bitter", "resentful"].includes(label)) {
      return {
        kind: "tool",
        toolId: "breathing",
        reason: "Because you're feeling anger or frustration, we can try a breathing exercise to help you regulate and find space.",
      };
    }

    // Priority 11: Numbness / disconnection → grounding (for reconnection)
    if (label === "numb" || label === "detached" || _triggers.includes("emotional_numbness") || _triggers.includes("freeze_response")) {
      return {
        kind: "tool",
        toolId: "grounding",
        reason: "Because you mentioned feeling disconnected, we can try a grounding practice to help you reconnect with your body.",
      };
    }

    // Priority 12: Exhaustion / burnout → breathing (for energy regulation)
    if (_triggers.includes("exhaustion") || _triggers.includes("burnout") || label === "exhausted" || label === "depleted") {
      return {
        kind: "tool",
        toolId: "breathing",
        reason: "Because you're feeling exhausted, we can try a gentle breathing practice to help restore your energy.",
      };
    }

    // Priority 13: Hopelessness / despair → journaling (for processing and finding meaning)
    if (_triggers.includes("hopelessness") || label === "hopeless" || label === "defeated") {
      return {
        kind: "tool",
        toolId: "journaling",
        reason: "Because you're feeling hopeless, we can try journaling to help you explore what's underneath these feelings.",
      };
    }

    // Priority 14: Trauma echoes / emotional flashbacks → grounding (for safety and presence)
    if (_triggers.includes("trauma_echoes") || _triggers.includes("emotional_flashbacks") || _triggers.includes("childhood_memory")) {
      return {
        kind: "tool",
        toolId: "grounding",
        reason: "Because you mentioned something that brought up difficult memories, we can try a grounding practice to help you feel safe in the present moment.",
      };
    }

    // Priority 15: Rumination / intrusive thinking → breathing (for mental space)
    if (_triggers.includes("rumination") || _triggers.includes("intrusive_thinking")) {
      return {
        kind: "tool",
        toolId: "breathing",
        reason: "Because your mind feels stuck in loops, we can try a breathing exercise to help create some mental space.",
      };
    }

    // If no rule applies, return null (as requested by product owner).
    return null;
  } catch (err) {
    console.warn("[intel] Failed to get recommended tool:", err);
    return null;
  }
}

/**
 * Compute emotional drift over recent history.
 * Phase 24: Emotional Graph Engine
 * @param {Array<{intensity:number}>} history
 * @returns {{ direction: "rising"|"falling"|"volatile"|"stable", rate: number }}
 */
export function detectEmotionalDrift(history) {
  const data = Array.isArray(history) ? history : [];
  if (data.length < 2) {
    return { direction: "stable", rate: 0 };
  }

  // Use last up to 5 points for drift.
  const windowSize = Math.min(5, data.length);
  const recent = data.slice(-windowSize);
  const intensities = recent
    .map((h) => typeof h.intensity === "number" ? h.intensity : 0)
    .filter((v) => !Number.isNaN(v));

  if (intensities.length < 2) {
    return { direction: "stable", rate: 0 };
  }

  // Simple slope approx: compare average of first half vs second half.
  const mid = Math.floor(intensities.length / 2);
  const firstAvg = intensities.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const secondAvg = intensities.slice(mid).reduce((a, b) => a + b, 0) / (intensities.length - mid || 1);
  const delta = secondAvg - firstAvg;

  // Normalize rate into 0–1 range.
  const rate = Math.min(1, Math.max(0, Math.abs(delta)));

  if (Math.abs(delta) < 0.05) {
    return { direction: "stable", rate: 0 };
  }

  if (delta > 0.05) {
    // Rising emotional intensity
    return { direction: "rising", rate };
  }

  // Falling emotional intensity
  return { direction: "falling", rate };
}

/**
 * Detect a simple emotional pattern cluster from history.
 * Phase 24: Emotional Graph Engine
 * @param {Array<{label?:string, triggers?:string[], riskLevel?:string}>} history
 * @returns {{ cluster: string | null, confidence: number }}
 */
export function detectPatternCluster(history) {
  const data = Array.isArray(history) ? history : [];
  if (data.length < 3) {
    return { cluster: null, confidence: 0 };
  }

  const recent = data.slice(-8); // look at last up to 8 messages
  const labels = recent.map((h) => (h.label || "").toLowerCase());
  const allTriggers = recent.flatMap((h) => Array.isArray(h.triggers) ? h.triggers : []);
  const riskLevels = recent.map((h) => h.riskLevel || "low");

  const hasCraving = allTriggers.includes("cravings");
  const hasIsolation = allTriggers.includes("isolation") || allTriggers.includes("withdrawal");
  const hasShame = allTriggers.includes("shame") || allTriggers.includes("guilt");
  const hasGrief = allTriggers.includes("grief") || allTriggers.includes("loss");
  const hasAnxietyLabel = labels.includes("anxious") || labels.includes("overwhelmed");
  const hasHighRisk = riskLevels.includes("high");

  // Urge-cycle: shame → isolation → cravings
  if (hasShame && hasIsolation && hasCraving) {
    return {
      cluster: "urge-cycle",
      confidence: hasHighRisk ? 0.9 : 0.7,
    };
  }

  // Shame-cycle: guilt/shame + negative labels
  const hasNegativeLabel =
    labels.includes("ashamed") ||
    labels.includes("numb") ||
    labels.includes("sad") ||
    labels.includes("angry");
  if (hasShame && hasNegativeLabel) {
    return {
      cluster: "shame-cycle",
      confidence: hasHighRisk ? 0.85 : 0.65,
    };
  }

  // Isolation-loop
  if (hasIsolation && (labels.includes("numb") || labels.includes("neutral"))) {
    return {
      cluster: "isolation-loop",
      confidence: hasHighRisk ? 0.8 : 0.6,
    };
  }

  // Anxiety-spike
  if (hasAnxietyLabel && hasHighRisk) {
    return {
      cluster: "anxiety-spike",
      confidence: 0.8,
    };
  }

  // Grief-wave
  if (hasGrief) {
    return {
      cluster: "grief-wave",
      confidence: 0.7,
    };
  }

  return { cluster: null, confidence: 0 };
}

/**
 * Forecast emotional direction based on drift, cluster, and last emotion.
 * Phase 24: Emotional Graph Engine
 * @param {{ drift: {direction:string, rate:number}, cluster: {cluster:string|null, confidence:number}, lastEmotion?: {label?:string, intensity?:number} }} input
 * @returns {{ forecast: "improving"|"declining"|"volatile"|"unknown", confidence: number }}
 */
export function forecastEmotionalDirection({ drift, cluster, lastEmotion }) {
  const safeDrift = drift || { direction: "stable", rate: 0 };
  const safeCluster = cluster || { cluster: null, confidence: 0 };
  const label = (lastEmotion?.label || "").toLowerCase();
  const intensity = typeof lastEmotion?.intensity === "number" ? lastEmotion.intensity : 0;

  // Defaults
  let forecast = "unknown";
  let confidence = 0.2;

  // If there is a concerning cluster and rising intensity.
  if (safeDrift.direction === "rising" && safeDrift.rate > 0.3 && safeCluster.cluster) {
    forecast = "declining";
    confidence = Math.max(0.7, safeCluster.confidence);
  } else if (safeDrift.direction === "falling" && intensity < 0.5) {
    forecast = "improving";
    confidence = 0.6;
  } else if (safeDrift.direction === "stable" && safeCluster.cluster) {
    forecast = "volatile";
    confidence = safeCluster.confidence;
  }

  // If label is clearly calmer and intensity is low, override.
  if ((label === "calm" || label === "hopeful") && intensity < 0.4) {
    forecast = "improving";
    confidence = Math.max(confidence, 0.7);
  }

  return { forecast, confidence };
}

/**
 * Apply phrasing style to base text.
 * Phase 27: Adaptive Response Phrasing Engine helper.
 * @param {string} baseText
 * @param {Object} toneProfile
 * @returns {string}
 */
export function applyPhrasing(baseText, toneProfile) {
  try {
    const style = getPhrasingStyle(toneProfile);
    return buildAssistantResponse(baseText, style);
  } catch (err) {
    console.warn("[intelligenceEngine] applyPhrasing failed:", err);
    return baseText;
  }
}

/**
 * Analyze behavioral drift from message history.
 * Phase 28: Behavioral Drift Engine helper.
 * @param {Array} messages
 * @returns {Object|null}
 */
export function analyzeDriftSnapshot(messages) {
  try {
    return computeMessageDrift(messages);
  } catch (err) {
    console.warn("[intelligenceEngine] analyzeDriftSnapshot failed:", err);
    return null;
  }
}

/**
 * Compute a simple identity trajectory over history.
 * @param {Array<{ tensionScore?:number, dissonanceScore?:number }>} history
 * @returns {{ fractureTrend: "stable"|"worsening"|"healing", intensity:number }}
 */
export function computeIdentityTrajectory(history) {
  const data = Array.isArray(history) ? history : [];
  if (data.length < 2) {
    return { fractureTrend: "stable", intensity: 0 };
  }

  const scores = data
    .map((h) =>
      typeof h.tensionScore === "number" ? h.tensionScore : 0
    )
    .filter((v) => !Number.isNaN(v));

  if (scores.length < 2) {
    return { fractureTrend: "stable", intensity: 0 };
  }

  const first = scores[0];
  const last = scores[scores.length - 1];
  const delta = last - first;
  const intensity = Math.min(1, Math.max(0, Math.abs(delta)));

  if (Math.abs(delta) < 0.1) {
    return { fractureTrend: "stable", intensity };
  }
  if (delta > 0.1) {
    return { fractureTrend: "worsening", intensity };
  }
  return { fractureTrend: "healing", intensity };
}

/**
 * Merge emotion from text and face signals.
 * Phase 31 — Face Signal Engine integration.
 * @param {Object} textEmotion - Emotion from text analysis
 * @param {Object} faceEmotion - Emotion from face scan
 * @returns {Object} Merged emotion
 */
export function mergeEmotionChannels(textEmotion, faceEmotion) {
  if (!faceEmotion) return textEmotion;

  // Weighted blend: face can boost intensity, but text label takes priority if present
  const textLabel = textEmotion?.label || "neutral";
  const faceLabel = faceEmotion?.label || "neutral";
  const textIntensity = typeof textEmotion?.intensity === "number" ? textEmotion.intensity : 0;
  const faceIntensity = typeof faceEmotion?.intensity === "number" ? faceEmotion.intensity : 0;

  // Use text label if available, otherwise face label
  const label = textLabel !== "neutral" ? textLabel : faceLabel;

  // Intensity: take the maximum (face can amplify but not override strong text signals)
  const intensity = Math.max(textIntensity, faceIntensity * 0.8);

  // Valence: prefer face if it's more specific, otherwise text
  const valence = faceEmotion?.valence && faceEmotion.valence !== "neutral"
    ? faceEmotion.valence
    : textEmotion?.valence || "neutral";

  return {
    label,
    intensity: Math.max(0, Math.min(1, intensity)),
    valence,
    source: ["text", "face"],
  };
}

/**
 * Compute a crisis forecast based on emotional history, last emotion,
 * last risk event, and last relationship snapshot.
 *
 * Phase 30 — Crisis Forecast Engine
 *
 * @param {Object} params
 * @param {Array<{intensity:number,label?:string,triggers?:string[],riskLevel?:string}>} params.emotionalHistory
 * @param {{label?:string,intensity?:number}|null} params.lastEmotion
 * @param {{riskLevel?:string,reasons?:string[],domains?:string[]}|null} params.lastRisk
 * @param {{tension?:number,tensionScore?:number,domains?:string[],patternTags?:string[],summaryTag?:string}|null} params.lastRelationship
 * @returns {{
 *   level: "stable"|"watch"|"elevated"|"critical",
 *   confidence: number,
 *   drivers: string[],
 *   drift: {direction:string,rate:number},
 *   cluster: {cluster:string|null,confidence:number}
 * }}
 */
export function computeCrisisForecast({
  emotionalHistory,
  lastEmotion,
  lastRisk,
  lastRelationship,
}) {
  try {
    const history = Array.isArray(emotionalHistory) ? emotionalHistory : [];

    // Use existing emotional graph helpers
    const drift = detectEmotionalDrift(history);
    const cluster = detectPatternCluster(history);

    const risk = lastRisk || { riskLevel: "low", reasons: [], domains: [] };
    const riskLevel = risk.riskLevel || "low";

    const label = (lastEmotion?.label || "").toLowerCase();
    const intensity =
      typeof lastEmotion?.intensity === "number" ? lastEmotion.intensity : 0;

    const tension =
      typeof lastRelationship?.tension === "number"
        ? lastRelationship.tension
        : typeof lastRelationship?.tensionScore === "number"
        ? lastRelationship.tensionScore
        : 0;

    let level = "stable";
    let confidence = 0.2;
    const drivers = [];

    // Baseline signals from risk
    if (riskLevel === "moderate") {
      level = "watch";
      confidence = 0.5;
      drivers.push("recent_moderate_risk_signal");
    }

    if (riskLevel === "high") {
      level = "elevated";
      confidence = 0.7;
      drivers.push("recent_high_risk_signal");
    }

    // Relationship tension as a driver
    if (tension >= 0.6) {
      if (level === "stable") {
        level = "watch";
        confidence = Math.max(confidence, 0.5);
      }
      drivers.push("relationship_tension_high");
    } else if (tension >= 0.4) {
      if (level === "stable") {
        level = "watch";
        confidence = Math.max(confidence, 0.4);
      }
      drivers.push("relationship_tension_rising");
    }

    // Emotional drift + intensity
    if (drift.direction === "rising" && drift.rate > 0.3 && intensity > 0.7) {
      if (level === "stable") {
        level = "watch";
      } else if (level === "watch") {
        level = "elevated";
      }
      confidence = Math.max(confidence, 0.7);
      drivers.push("emotional_intensity_rising");
    }

    // Pattern clusters (from Phase 24)
    if (cluster.cluster === "urge-cycle" || cluster.cluster === "shame-cycle") {
      drivers.push(`pattern_${cluster.cluster}`);
      confidence = Math.max(confidence, cluster.confidence || 0.7);

      if (riskLevel === "high" || tension >= 0.6) {
        level = "critical";
      } else if (level === "stable") {
        level = "elevated";
      }
    }

    if (cluster.cluster === "anxiety-spike") {
      drivers.push("anxiety_spike_pattern");
      confidence = Math.max(confidence, 0.7);
      if (level === "stable") level = "watch";
    }

    // Hopelessness / panic signals
    const hopelessLike =
      label === "hopeless" ||
      label === "defeated" ||
      label === "panicked" ||
      label === "overwhelmed";

    if (hopelessLike && intensity > 0.8) {
      drivers.push("hopeless_or_panic_language");
      if (riskLevel === "high" || tension >= 0.5) {
        level = "critical";
        confidence = Math.max(confidence, 0.85);
      } else {
        level = level === "stable" ? "elevated" : level;
        confidence = Math.max(confidence, 0.75);
      }
    }

    // If nothing concerning, normalize back to stable
    if (drivers.length === 0 && riskLevel === "low" && tension < 0.4) {
      level = "stable";
      confidence = 0.2;
    }

    return {
      level,
      confidence,
      drivers,
      drift,
      cluster,
    };
  } catch (err) {
    console.warn("[intel] Failed to compute crisis forecast:", err);
    return {
      level: "stable",
      confidence: 0.1,
      drivers: [],
      drift: { direction: "stable", rate: 0 },
      cluster: { cluster: null, confidence: 0 },
    };
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
  detectEmotionalDrift,
  detectPatternCluster,
  forecastEmotionalDirection,
  applyPhrasing,
  analyzeDriftSnapshot,
  enrichMessageWithIdentity,
  computeIdentityTrajectory,
  enrichMessageWithRelationship,
  computeCrisisForecast,
  mergeEmotionChannels,
  SYSTEM_STATES,
};

