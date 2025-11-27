// src/ai/telemetry/telemetryEngine.js

/**
 * Telemetry Engine
 * Evaluates telemetry events and returns risk scores, tags, and agent recommendations
 */

import {
  EVENT_TYPES,
  TOOL_RISK_CONFIG,
  CHAT_RISK_CONFIG,
  SESSION_RISK_CONFIG,
  DEFAULT_CONFIG,
  getRiskLevel,
  getRecommendedAgents,
  EMOTIONAL_TAGS,
} from "./emotionalMatrix";

/**
 * Evaluate a telemetry event and return risk assessment
 * @param {object} event - Normalized telemetry event
 * @param {string} event.type - Event type (tool_usage, chat_message, etc.)
 * @param {string} event.toolId - Tool identifier (if type=tool_usage)
 * @param {number} event.intensityBefore - Intensity before (0-10)
 * @param {number} event.intensityAfter - Intensity after (0-10)
 * @param {object} event.metadata - Additional event metadata
 * @param {string} event.userId - User identifier
 * @param {number} event.createdAt - Timestamp
 * @returns {object} Evaluation result with riskScore, tags, recommendedAgents
 */
export function evaluateTelemetryEvent(event) {
  try {
    if (!event || !event.type) {
      return DEFAULT_CONFIG;
    }

  // Handle tool usage events
  if (event.type === EVENT_TYPES.TOOL_USAGE || event.type === "tool_usage") {
    return evaluateToolUsageEvent(event);
  }

  // Handle chat messages (future)
  if (event.type === EVENT_TYPES.CHAT_MESSAGE || event.type === "chat_message") {
    return evaluateChatEvent(event);
  }

  // Handle session events (future)
  if (event.type === EVENT_TYPES.SESSION_EVENT || event.type === "session_event") {
    return evaluateSessionEvent(event);
  }

    // Default: low risk
    return DEFAULT_CONFIG;
  } catch (err) {
    // Catch-all: return safe defaults
    console.warn("evaluateTelemetryEvent failed, using defaults:", err.message);
    return DEFAULT_CONFIG;
  }
}

/**
 * Evaluate tool usage event
 */
function evaluateToolUsageEvent(event) {
  const { toolId, intensityBefore, intensityAfter, metadata = {} } = event;
  const config = TOOL_RISK_CONFIG[toolId];

  if (!config) {
    // Unknown tool - default low risk
    return {
      riskScore: 1,
      tags: ["unknown_tool"],
      recommendedAgents: [],
      riskLevel: "LOW",
    };
  }

  let riskScore = 0;
  const tags = [];

  // Urge surfing specific logic
  if (toolId === "urge-surfing") {
    // Base risk from intensity before
    if (intensityBefore !== undefined) {
      if (intensityBefore >= 9) {
        riskScore = 9;
        tags.push("high_urge", "crisis");
      } else if (intensityBefore >= 7) {
        riskScore = 7;
        tags.push("high_urge");
      } else if (intensityBefore >= 4) {
        riskScore = 4;
        tags.push("moderate_urge");
      } else {
        riskScore = 2;
        tags.push("low_urge");
      }
    }

    // Adjust based on intensity change
    if (intensityBefore !== undefined && intensityAfter !== undefined) {
      const change = intensityAfter - intensityBefore;
      if (change >= 2) {
        riskScore = Math.min(10, riskScore + 2);
        tags.push("escalating");
      } else if (change <= -2) {
        riskScore = Math.max(0, riskScore - 1);
        tags.push("improving");
      } else {
        tags.push("stable");
      }
    }
  }

  // Grounding tool logic
  if (toolId === "grounding") {
    const feltGrounded = metadata.feltGrounded;
    if (feltGrounded === false) {
      riskScore = 4;
      tags.push("distress", "seeking_stability");
    } else if (feltGrounded === true) {
      riskScore = 1;
      tags.push("seeking_stability");
    } else {
      riskScore = 2;
      tags.push("seeking_stability");
    }
  }

  // Breathing tool logic
  if (toolId === "breathing") {
    const durationMs = metadata.durationMs || event.durationMs || 0;
    if (durationMs < 60000) {
      // Less than 1 minute
      riskScore = 3;
      tags.push("distress", "seeking_calm");
    } else {
      riskScore = 1;
      tags.push("seeking_calm");
    }
  }

  // Journaling tool logic
  if (toolId === "journaling") {
    const wordCount = metadata.wordCount || metadata.context?.wordCount || 0;
    if (wordCount < 10) {
      riskScore = 4;
      tags.push("disengagement", "processing");
    } else if (wordCount < 50) {
      riskScore = 2;
      tags.push("processing");
    } else {
      riskScore = 1;
      tags.push("processing");
    }
  }

  // Affirmations tool logic
  if (toolId === "affirmations") {
    const concernType = metadata.concernType || event.concernType;
    if (concernType === "cravings") {
      riskScore = 5;
      tags.push("high_need", "seeking_support");
    } else if (concernType === "shame") {
      riskScore = 4;
      tags.push("high_need", "seeking_support");
    } else {
      riskScore = 2;
      tags.push("seeking_support");
    }
  }

  // Determine risk level
  const riskLevel = getRiskLevel(riskScore);
  const recommendedAgents = getRecommendedAgents(riskLevel);

  return {
    riskScore: Math.min(10, Math.max(0, riskScore)), // Clamp 0-10
    tags: [...new Set(tags)], // Remove duplicates
    recommendedAgents,
    riskLevel: riskLevel.label,
  };
}

/**
 * Evaluate chat message event
 */
function evaluateChatEvent(event) {
  const { messageText, content, metadata = {} } = event;
  const text = messageText || content || metadata.messageText || "";
  const textLower = text.toLowerCase().trim();

  if (!textLower) {
    return {
      riskScore: 1,
      tags: ["chat_interaction"],
      recommendedAgents: [],
      riskLevel: "LOW",
    };
  }

  let riskScore = 2; // Baseline for chat interaction
  const tags = ["chat_interaction"];

  // Check content length
  const length = text.length;
  if (length < 10) {
    riskScore = Math.max(riskScore, CHAT_RISK_CONFIG.contentLength.veryShort.riskScore);
    tags.push("brief");
  } else if (length < 50) {
    riskScore = Math.max(riskScore, CHAT_RISK_CONFIG.contentLength.short.riskScore);
  }

  // Check for distress markers (highest priority)
  for (const [, config] of Object.entries(CHAT_RISK_CONFIG.distressMarkers)) {
    const found = config.keywords.some((keyword) => textLower.includes(keyword.toLowerCase()));
    if (found) {
      riskScore = Math.max(riskScore, config.riskScore);
      tags.push(...config.tags);
    }
  }

  // Check for positive markers (reduce risk)
  const hasPositive = CHAT_RISK_CONFIG.positiveMarkers.keywords.some((keyword) =>
    textLower.includes(keyword.toLowerCase())
  );
  if (hasPositive) {
    riskScore = Math.max(1, riskScore - CHAT_RISK_CONFIG.positiveMarkers.riskReduction);
    tags.push(...CHAT_RISK_CONFIG.positiveMarkers.tags);
  }

  // Determine risk level
  const riskLevel = getRiskLevel(riskScore);
  const recommendedAgents = getRecommendedAgents(riskLevel);

  return {
    riskScore: Math.min(10, Math.max(0, riskScore)),
    tags: [...new Set(tags)],
    recommendedAgents,
    riskLevel: riskLevel.label,
  };
}

/**
 * Evaluate session event
 */
function evaluateSessionEvent(event) {
  const { groupType, eventType, summaryText, notes, metadata = {} } = event;
  const groupTypeKey = groupType || eventType || metadata.groupType || "Mixed Group";
  const summary = summaryText || notes || metadata.summaryText || "";
  const summaryLower = summary.toLowerCase();

  // Start with baseline risk for group type
  const groupConfig = SESSION_RISK_CONFIG.groupTypes[groupTypeKey] || {
    baselineRisk: 2,
    tags: ["group"],
  };
  let riskScore = groupConfig.baselineRisk;
  const tags = [...groupConfig.tags, "session_participation"];

  // Check for progress markers
  const hasProgress = SESSION_RISK_CONFIG.progressMarkers.keywords.some((keyword) =>
    summaryLower.includes(keyword.toLowerCase())
  );
  if (hasProgress) {
    riskScore = Math.max(1, riskScore - SESSION_RISK_CONFIG.progressMarkers.riskReduction);
    tags.push(...SESSION_RISK_CONFIG.progressMarkers.tags);
  }

  // Check for distress markers
  const hasDistress = SESSION_RISK_CONFIG.distressMarkers.keywords.some((keyword) =>
    summaryLower.includes(keyword.toLowerCase())
  );
  if (hasDistress) {
    riskScore = Math.min(10, riskScore + SESSION_RISK_CONFIG.distressMarkers.riskBoost);
    tags.push(...SESSION_RISK_CONFIG.distressMarkers.tags);
  }

  // Check for crisis markers (highest priority)
  const hasCrisis = SESSION_RISK_CONFIG.crisisMarkers.keywords.some((keyword) =>
    summaryLower.includes(keyword.toLowerCase())
  );
  if (hasCrisis) {
    riskScore = Math.min(10, riskScore + SESSION_RISK_CONFIG.crisisMarkers.riskBoost);
    tags.push(...SESSION_RISK_CONFIG.crisisMarkers.tags);
  }

  // Determine risk level
  const riskLevel = getRiskLevel(riskScore);
  const recommendedAgents = getRecommendedAgents(riskLevel);

  return {
    riskScore: Math.min(10, Math.max(0, riskScore)),
    tags: [...new Set(tags)],
    recommendedAgents,
    riskLevel: riskLevel.label,
  };
}

