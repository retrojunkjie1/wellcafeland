// src/ai/fusion/fusionEngine.js

/**
 * Unified Fusion Engine
 * Merges all intelligence: chat, search, directory, tools, telemetry, multimodal, emotional, spiritual
 */

import { db, auth } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { evaluateTelemetryEvent } from "../telemetry/telemetryEngine";
import { observe, optimize, SYSTEM_STATES } from "@/core/system/intelligenceEngine";
import { SystemMemory } from "@/core/system/systemMemory";
import { analyzeEmotionalState } from "@/services/emotionalAnalysis";
import { analyzeSpiritualState } from "@/services/spiritualAnalysis";
import { forecastRecoveryRisk } from "@/services/recoveryForecast";

/**
 * Handle telemetry event with multi-agent fusion
 * @param {object} event - Normalized telemetry event
 * @returns {Promise<object>} Result with evaluation and any agent events created (always returns, never throws)
 */
export async function handleTelemetryWithFusion(event) {
  try {
    if (!event) {
      console.warn("handleTelemetryWithFusion: No event provided");
      return { evaluation: null, agentEvents: [] };
    }

  // Evaluate the event
  const evaluation = evaluateTelemetryEvent(event);
  const { riskScore, tags, recommendedAgents, riskLevel } = evaluation;

  const agentEvents = [];

  // Determine severity based on risk score
  let severity = null;
  if (riskScore >= 7) {
    severity = "critical";
  } else if (riskScore >= 4) {
    severity = "warning";
  }

  // If risk is moderate or high, create agent events
  if (severity && db) {
    const userId = auth?.currentUser?.uid || event.userId || "unknown";
    const timestamp = new Date();

    // Create agent events for each recommended agent
    for (const agentId of recommendedAgents) {
      try {
        const agentEvent = {
          userId,
          agentId,
          eventType: "risk_signal",
          severity,
          message: `Risk signal detected: ${riskLevel} risk (score: ${riskScore})`,
          meta: {
            originalEvent: {
              type: event.type,
              toolId: event.toolId,
              intensityBefore: event.intensityBefore,
              intensityAfter: event.intensityAfter,
            },
            evaluation: {
              riskScore,
              tags,
              riskLevel,
            },
            timestamp: event.createdAt || Date.now(),
          },
          timestamp,
          success: true,
        };

        await addDoc(collection(db, "agent_events"), agentEvent);
        agentEvents.push(agentEvent);
      } catch (err) {
        console.error(`Failed to create agent event for ${agentId}:`, err);
      }
    }

    // Also write to telemetry_events collection if it exists
    try {
      const telemetryEvent = {
        userId,
        type: event.type,
        toolId: event.toolId,
        riskScore,
        tags,
        riskLevel,
        severity,
        metadata: event.metadata || {},
        evaluation,
        createdAt: timestamp,
      };

      await addDoc(collection(db, "telemetry_events"), telemetryEvent);
    } catch (err) {
      // Collection might not exist yet, that's okay
      console.debug("telemetry_events collection not available:", err.message);
    }
  }

    return {
      evaluation,
      agentEvents,
    };
  } catch (err) {
    // Catch-all: never break telemetry flow
    console.warn("handleTelemetryWithFusion failed (non-critical):", err.message);
    return {
      evaluation: {
        riskScore: 0,
        tags: [],
        recommendedAgents: [],
        riskLevel: "LOW",
      },
      agentEvents: [],
    };
  }
}

/**
 * Normalize a tool usage event for evaluation
 * @param {string} toolId - Tool identifier
 * @param {object} eventData - Tool-specific event data
 * @returns {object} Normalized event object
 */
export function normalizeToolUsageEvent(toolId, eventData = {}) {
  return {
    type: "tool_usage",
    toolId,
    userId: auth?.currentUser?.uid || eventData.userId || "unknown",
    intensityBefore: eventData.intensityBefore,
    intensityAfter: eventData.intensityAfter,
    durationMs: eventData.durationMs,
    createdAt: eventData.completedAt || eventData.startedAt || Date.now(),
    metadata: {
      preset: eventData.preset,
      duration: eventData.duration,
      concernType: eventData.concernType,
      feltGrounded: eventData.context?.feltGrounded,
      wordCount: eventData.context?.wordCount || eventData.notes?.split(/\s+/).length,
      cycles: eventData.cycles,
      timerSeconds: eventData.context?.timerSeconds,
      ...eventData.context,
    },
  };
}

/**
 * Unified fusion decision engine
 * Merges all intelligence sources to decide next action
 * @param {Object} nextAction - Current context
 * @param {string} nextAction.userText - User's current message
 * @param {Array} nextAction.messages - Message history
 * @param {Object} nextAction.telemetry - Recent telemetry events
 * @param {Object} nextAction.searchState - Search state (if applicable)
 * @param {Object} nextAction.toolState - Tool state (if applicable)
 * @returns {Object} Next action recommendation
 */
export function decide(nextAction) {
  if (!nextAction) {
    return {
      mode: "text",
      escalate: false,
      recommendTool: null,
      openWorkspace: null,
    };
  }

  const { userText } = nextAction;

  // Observe current state
  if (userText) {
    observe({
      type: "chat",
      data: { text: userText },
    });
  }

  // Get system memory
  const systemState = SystemMemory.getSystemState();

  // Analyze current input
  let emotion = null;
  let spirit = null;
  let forecast = null;

  if (userText) {
    emotion = analyzeEmotionalState(userText);
    spirit = analyzeSpiritualState(userText);
    forecast = forecastRecoveryRisk(emotion?.emotion || "neutral", userText);

    // Update system memory
    SystemMemory.setLastUserEmotion(emotion);
    SystemMemory.setLastRiskState(forecast);
  }

  // Determine system state
  let currentSystemState = systemState;
  if (emotion) {
    if (emotion.emotion === "panic" || emotion.intensity >= 4) {
      currentSystemState = SYSTEM_STATES.ANXIOUS;
    } else if (emotion.emotion === "urge" || forecast?.riskLevel === "relapse-risk") {
      currentSystemState = SYSTEM_STATES.URGE;
    } else if (emotion.emotion === "overwhelm") {
      currentSystemState = SYSTEM_STATES.OVERWHELMED;
    } else if (emotion.intensity <= 2) {
      currentSystemState = SYSTEM_STATES.CALM;
    }
  }

  SystemMemory.setSystemState(currentSystemState);

  // Optimize based on current state
  const optimization = optimize({
    systemState: currentSystemState,
    preferredMode: SystemMemory.getPreferredMode(),
  });

  // Determine mode
  let mode = "text";
  if (optimization.mode === "audio" || (emotion && emotion.intensity >= 4)) {
    mode = "audio";
  } else if (optimization.mode === "video" || forecast?.recommendedIntervention === "grounding") {
    mode = "video";
  } else {
    mode = SystemMemory.getPreferredMode() || "text";
  }

  // Determine escalation
  const escalate = 
    optimization.escalate ||
    (forecast && forecast.riskLevel === "relapse-risk") ||
    (emotion && emotion.urgency === "high");

  // Determine tool recommendation
  let recommendTool = null;
  if (optimization.recommendTool) {
    recommendTool = optimization.recommendTool;
  } else if (forecast && forecast.recommendedIntervention) {
    if (forecast.recommendedIntervention === "breathing") {
      recommendTool = "grounding"; // Use grounding for breathing
    } else if (forecast.recommendedIntervention === "urge-surfing") {
      recommendTool = "urge-surfing";
    } else if (forecast.recommendedIntervention === "grounding") {
      recommendTool = "grounding";
    }
  }

  // Detect real help queries (Phase 12)
  let realHelpMode = null;
  let realHelpPriority = null;
  let realHelpQuery = null;
  let realHelpRegion = null;

  if (userText) {
    const lowerText = userText.toLowerCase();
    
    // Housing detection
    if (
      lowerText.includes("need a sober home") ||
      lowerText.includes("need a place to stay") ||
      lowerText.includes("need housing") ||
      lowerText.includes("find housing") ||
      lowerText.includes("find sober home") ||
      lowerText.includes("homeless") ||
      lowerText.includes("need shelter")
    ) {
      realHelpMode = "real_help";
      realHelpPriority = "housing";
      realHelpQuery = userText;
      
      // Try to detect region
      const regionKeywords = ["colorado", "california", "texas", "new york", "florida", "washington"];
      for (const region of regionKeywords) {
        if (lowerText.includes(region)) {
          realHelpRegion = region;
          break;
        }
      }
    }
    
    // Funding detection
    else if (
      lowerText.includes("need funding") ||
      lowerText.includes("need a grant") ||
      lowerText.includes("find funding") ||
      lowerText.includes("find grants") ||
      lowerText.includes("can't afford treatment") ||
      lowerText.includes("can't afford") ||
      lowerText.includes("need financial help")
    ) {
      realHelpMode = "real_help";
      realHelpPriority = "funding";
      realHelpQuery = userText;
    }
    
    // Programs detection
    else if (
      lowerText.includes("help finding programs") ||
      lowerText.includes("find programs") ||
      lowerText.includes("need legal help") ||
      lowerText.includes("need emergency support") ||
      lowerText.includes("government assistance") ||
      lowerText.includes("need assistance")
    ) {
      realHelpMode = "real_help";
      realHelpPriority = "programs";
      realHelpQuery = userText;
    }
    
    // Circles detection
    else if (
      lowerText.includes("need a recovery group") ||
      lowerText.includes("find a group") ||
      lowerText.includes("recovery circle") ||
      lowerText.includes("support group")
    ) {
      realHelpMode = "real_help";
      realHelpPriority = "circles";
      realHelpQuery = userText;
    }
    
    // General real help
    else if (
      lowerText.includes("help me find support") ||
      lowerText.includes("i need real help") ||
      lowerText.includes("find real help")
    ) {
      realHelpMode = "real_help";
      realHelpPriority = "programs"; // Default to programs
      realHelpQuery = userText;
    }
  }

  // Determine workspace to open
  let openWorkspace = null;
  if (realHelpMode === "real_help") {
    openWorkspace = "real_help";
  } else if (optimization.openWorkspace) {
    openWorkspace = optimization.openWorkspace;
  } else if (recommendTool === "grounding" && mode === "video") {
    openWorkspace = "video";
  }

  const decision = {
    mode: realHelpMode || mode,
    escalate,
    recommendTool,
    openWorkspace,
    systemState: currentSystemState,
    emotion,
    spirit,
    forecast,
    // Phase 12: Real Help data
    realHelp: realHelpMode ? {
      priority: realHelpPriority,
      query: realHelpQuery,
      region: realHelpRegion,
    } : null,
  };

  console.warn("[fusion] nextAction:", decision);

  return decision;
}

export default {
  handleTelemetryWithFusion,
  decide,
};

