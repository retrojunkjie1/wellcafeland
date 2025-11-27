// src/ai/predictive/predictiveRiskEngine.js

/**
 * Predictive Risk Engine
 * Computes recovery risk scores based on aggregated telemetry
 */

import {
  RISK_WEIGHTS,
  RISK_THRESHOLDS,
  HEALTHY_TOOLS,
  HIGH_INTENSITY_TOOLS,
  POSITIVE_TAGS,
  NEGATIVE_TAGS,
  getRiskLevelFromScore,
} from "./predictiveConfig";

/**
 * Compute recovery risk score for a client
 * @param {object} telemetryWindow - Aggregated telemetry data
 * @returns {object} Risk assessment
 */
export function computeRecoveryRisk(telemetryWindow) {
  try {
    if (!telemetryWindow || telemetryWindow.hasInsufficientData) {
      return {
        riskScore: null,
        riskLevel: "insufficient_data",
        keyContributors: [],
        positiveSignals: [],
        negativeSignals: [],
        confidence: "low",
      };
    }

    let riskScore = 0;
    const keyContributors = [];
    const positiveSignals = [];
    const negativeSignals = [];

    // Analyze tool usage
    const toolAnalysis = analyzeToolUsage(telemetryWindow.toolEvents);
    riskScore += toolAnalysis.riskContribution;
    keyContributors.push(...toolAnalysis.contributors);
    positiveSignals.push(...toolAnalysis.positiveSignals);
    negativeSignals.push(...toolAnalysis.negativeSignals);

    // Analyze chat messages
    const chatAnalysis = analyzeChatMessages(telemetryWindow.chatEvents);
    riskScore += chatAnalysis.riskContribution;
    keyContributors.push(...chatAnalysis.contributors);
    positiveSignals.push(...chatAnalysis.positiveSignals);
    negativeSignals.push(...chatAnalysis.negativeSignals);

    // Analyze session events
    const sessionAnalysis = analyzeSessionEvents(telemetryWindow.sessionEvents);
    riskScore += sessionAnalysis.riskContribution;
    keyContributors.push(...sessionAnalysis.contributors);
    positiveSignals.push(...sessionAnalysis.positiveSignals);
    negativeSignals.push(...sessionAnalysis.negativeSignals);

    // Analyze agent events
    const agentAnalysis = analyzeAgentEvents(telemetryWindow.agentEvents);
    riskScore += agentAnalysis.riskContribution;
    keyContributors.push(...agentAnalysis.contributors);
    positiveSignals.push(...agentAnalysis.positiveSignals);
    negativeSignals.push(...agentAnalysis.negativeSignals);

    // Analyze engagement patterns
    const engagementAnalysis = analyzeEngagementPatterns(telemetryWindow);
    riskScore += engagementAnalysis.riskContribution;
    keyContributors.push(...engagementAnalysis.contributors);
    positiveSignals.push(...engagementAnalysis.positiveSignals);
    negativeSignals.push(...engagementAnalysis.negativeSignals);

    // Clamp risk score to 0-100
    const clampedRiskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    const riskLevel = getRiskLevelFromScore(clampedRiskScore);

    // Calculate confidence based on data points
    const confidence = 
      telemetryWindow.totalDataPoints >= 20 ? "high" :
      telemetryWindow.totalDataPoints >= 10 ? "medium" :
      "low";

    return {
      riskScore: clampedRiskScore,
      riskLevel,
      keyContributors: [...new Set(keyContributors)], // Remove duplicates
      positiveSignals: [...new Set(positiveSignals)],
      negativeSignals: [...new Set(negativeSignals)],
      confidence,
    };
  } catch (err) {
    console.warn("Failed to compute recovery risk (non-critical):", err.message);
    return {
      riskScore: null,
      riskLevel: "insufficient_data",
      keyContributors: [],
      positiveSignals: [],
      negativeSignals: [],
      confidence: "low",
    };
  }
}

/**
 * Analyze tool usage patterns
 */
function analyzeToolUsage(toolEvents) {
  let riskContribution = 0;
  const contributors = [];
  const positiveSignals = [];
  const negativeSignals = [];

  if (!toolEvents || toolEvents.length === 0) {
    return { riskContribution, contributors, positiveSignals, negativeSignals };
  }

  let highUrgeCount = 0;
  let moderateUrgeCount = 0;
  let healthyToolCount = 0;
  const toolTypes = new Set();

  toolEvents.forEach((event) => {
    const toolId = event.toolId || "";
    toolTypes.add(toolId);

    // Check for high-intensity tool usage
    if (HIGH_INTENSITY_TOOLS.includes(toolId)) {
      const intensity = event.context?.intensityBefore || event.context?.intensityAfter || 0;
      if (intensity >= 8) {
        highUrgeCount++;
      } else if (intensity >= 4) {
        moderateUrgeCount++;
      }
    }

    // Check for healthy tool usage
    if (HEALTHY_TOOLS.includes(toolId)) {
      healthyToolCount++;
    }
  });

  // Add risk from high-intensity events
  if (highUrgeCount > 0) {
    const contribution = highUrgeCount * RISK_WEIGHTS.highUrgeToolUsage;
    riskContribution += contribution;
    contributors.push(`${highUrgeCount} high-intensity tool usage event${highUrgeCount > 1 ? "s" : ""}`);
    negativeSignals.push(`Frequent high-intensity tool usage (${highUrgeCount} events)`);
  }

  if (moderateUrgeCount > 0) {
    const contribution = moderateUrgeCount * RISK_WEIGHTS.moderateUrgeToolUsage;
    riskContribution += contribution;
    contributors.push(`${moderateUrgeCount} moderate-intensity event${moderateUrgeCount > 1 ? "s" : ""}`);
  }

  // Positive signals from healthy tool usage
  if (healthyToolCount >= 5) {
    positiveSignals.push(`Consistent use of healthy tools (${healthyToolCount} sessions)`);
  }

  return { riskContribution, contributors, positiveSignals, negativeSignals };
}

/**
 * Analyze chat messages
 */
function analyzeChatMessages(chatEvents) {
  let riskContribution = 0;
  const contributors = [];
  const positiveSignals = [];
  const negativeSignals = [];

  if (!chatEvents || chatEvents.length === 0) {
    return { riskContribution, contributors, positiveSignals, negativeSignals };
  }

  const tagCounts = {};
  let crisisCount = 0;
  let highUrgeCount = 0;
  let despairCount = 0;
  let shameCount = 0;
  let gratitudeCount = 0;

  chatEvents.forEach((event) => {
    const tags = event.tags || [];

    tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Count specific risk markers
    if (tags.includes("crisis")) {
      crisisCount++;
      riskContribution += RISK_WEIGHTS.crisisChatMessage;
    }
    if (tags.includes("high_urge")) {
      highUrgeCount++;
      riskContribution += RISK_WEIGHTS.highUrgeChatMessage;
    }
    if (tags.includes("despair")) {
      despairCount++;
      riskContribution += RISK_WEIGHTS.despairChatMessage;
    }
    if (tags.includes("shame")) {
      shameCount++;
      riskContribution += RISK_WEIGHTS.shameChatMessage;
    }
    if (tags.includes("gratitude")) {
      gratitudeCount++;
      riskContribution += RISK_WEIGHTS.gratitudePattern;
    }
  });

  if (crisisCount > 0) {
    contributors.push(`${crisisCount} crisis-tagged message${crisisCount > 1 ? "s" : ""}`);
    negativeSignals.push(`Crisis language detected in ${crisisCount} message${crisisCount > 1 ? "s" : ""}`);
  }
  if (highUrgeCount > 0) {
    contributors.push(`${highUrgeCount} high-urge message${highUrgeCount > 1 ? "s" : ""}`);
    negativeSignals.push(`High-urge language in ${highUrgeCount} message${highUrgeCount > 1 ? "s" : ""}`);
  }
  if (despairCount > 0) {
    contributors.push(`${despairCount} despair-tagged message${despairCount > 1 ? "s" : ""}`);
  }
  if (shameCount > 0) {
    contributors.push(`${shameCount} shame-tagged message${shameCount > 1 ? "s" : ""}`);
  }
  if (gratitudeCount > 0) {
    positiveSignals.push(`Gratitude expressed in ${gratitudeCount} message${gratitudeCount > 1 ? "s" : ""}`);
  }

  return { riskContribution, contributors, positiveSignals, negativeSignals };
}

/**
 * Analyze session events
 */
function analyzeSessionEvents(sessionEvents) {
  let riskContribution = 0;
  const contributors = [];
  const positiveSignals = [];
  const negativeSignals = [];

  if (!sessionEvents || sessionEvents.length === 0) {
    return { riskContribution, contributors, positiveSignals, negativeSignals };
  }

  let crisisCount = 0;
  let distressCount = 0;
  let progressCount = 0;
  let insightCount = 0;

  sessionEvents.forEach((event) => {
    const summary = (event.summaryText || "").toLowerCase();
    
    // Check for crisis markers
    if (summary.includes("crisis") || summary.includes("intervention")) {
      crisisCount++;
      riskContribution += RISK_WEIGHTS.crisisSessionEvent;
    }
    
    // Check for distress markers
    if (summary.includes("struggled") || summary.includes("difficulty") || summary.includes("triggered")) {
      distressCount++;
      riskContribution += RISK_WEIGHTS.distressSessionEvent;
    }
    
    // Check for positive markers
    if (summary.includes("progress") || summary.includes("breakthrough") || summary.includes("insight")) {
      progressCount++;
      riskContribution += RISK_WEIGHTS.progressPattern;
    }
    if (summary.includes("insight") || summary.includes("realization")) {
      insightCount++;
      riskContribution += RISK_WEIGHTS.insightPattern;
    }
  });

  if (crisisCount > 0) {
    contributors.push(`${crisisCount} crisis-tagged session event${crisisCount > 1 ? "s" : ""}`);
    negativeSignals.push(`Crisis indicators in ${crisisCount} session${crisisCount > 1 ? "s" : ""}`);
  }
  if (distressCount > 0) {
    contributors.push(`${distressCount} distress-tagged session event${distressCount > 1 ? "s" : ""}`);
  }
  if (progressCount > 0) {
    positiveSignals.push(`Progress noted in ${progressCount} session${progressCount > 1 ? "s" : ""}`);
  }
  if (insightCount > 0) {
    positiveSignals.push(`Insights shared in ${insightCount} session${insightCount > 1 ? "s" : ""}`);
  }

  return { riskContribution, contributors, positiveSignals, negativeSignals };
}

/**
 * Analyze agent events
 */
function analyzeAgentEvents(agentEvents) {
  let riskContribution = 0;
  const contributors = [];
  const positiveSignals = [];
  const negativeSignals = [];

  if (!agentEvents || agentEvents.length === 0) {
    return { riskContribution, contributors, positiveSignals, negativeSignals };
  }

  let criticalCount = 0;
  let warningCount = 0;

  agentEvents.forEach((event) => {
    if (event.severity === "critical") {
      criticalCount++;
      riskContribution += RISK_WEIGHTS.criticalAgentEvent;
    } else if (event.severity === "warning" || event.severity === "high") {
      warningCount++;
      riskContribution += RISK_WEIGHTS.warningAgentEvent;
    }
  });

  if (criticalCount > 0) {
    contributors.push(`${criticalCount} critical agent event${criticalCount > 1 ? "s" : ""}`);
    negativeSignals.push(`${criticalCount} critical risk signal${criticalCount > 1 ? "s" : ""} detected`);
  }
  if (warningCount > 0) {
    contributors.push(`${warningCount} warning agent event${warningCount > 1 ? "s" : ""}`);
  }

  return { riskContribution, contributors, positiveSignals, negativeSignals };
}

/**
 * Analyze engagement patterns (consecutive days, tool usage trends)
 */
function analyzeEngagementPatterns(telemetryWindow) {
  let riskContribution = 0;
  const contributors = [];
  const positiveSignals = [];
  const negativeSignals = [];

  // Group tool events by date
  const eventsByDate = {};
  const allEvents = [
    ...telemetryWindow.toolEvents,
    ...telemetryWindow.chatEvents,
    ...telemetryWindow.sessionEvents,
  ];

  allEvents.forEach((event) => {
    const date = event.timestamp instanceof Date 
      ? event.timestamp 
      : new Date(event.timestamp);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = {
        healthyTools: 0,
        totalTools: 0,
      };
    }

    if (event.type === "tool_usage") {
      eventsByDate[dateKey].totalTools++;
      if (HEALTHY_TOOLS.includes(event.toolId)) {
        eventsByDate[dateKey].healthyTools++;
      }
    }
  });

  // Check for consecutive days without healthy tools
  const dates = Object.keys(eventsByDate).sort();
  let consecutiveDaysWithoutHealthy = 0;
  let maxConsecutiveDaysWithoutHealthy = 0;
  let consecutiveDaysWithHealthy = 0;
  let maxConsecutiveDaysWithHealthy = 0;

  dates.forEach((dateKey) => {
    const dayData = eventsByDate[dateKey];
    
    if (dayData.healthyTools === 0 && dayData.totalTools > 0) {
      consecutiveDaysWithoutHealthy++;
      consecutiveDaysWithHealthy = 0;
      maxConsecutiveDaysWithoutHealthy = Math.max(
        maxConsecutiveDaysWithoutHealthy,
        consecutiveDaysWithoutHealthy
      );
    } else if (dayData.healthyTools > 0) {
      consecutiveDaysWithoutHealthy = 0;
      consecutiveDaysWithHealthy++;
      maxConsecutiveDaysWithHealthy = Math.max(
        maxConsecutiveDaysWithHealthy,
        consecutiveDaysWithHealthy
      );
    }
  });

  // Apply disengagement penalties
  if (maxConsecutiveDaysWithoutHealthy >= 7) {
    riskContribution += RISK_WEIGHTS.noHealthyTools7Days;
    contributors.push("7+ consecutive days without healthy tool usage");
    negativeSignals.push("Extended period without engagement with healthy tools");
  } else if (maxConsecutiveDaysWithoutHealthy >= 5) {
    riskContribution += RISK_WEIGHTS.noHealthyTools5Days;
    contributors.push("5+ consecutive days without healthy tool usage");
    negativeSignals.push("Several days without healthy tool usage");
  } else if (maxConsecutiveDaysWithoutHealthy >= 3) {
    riskContribution += RISK_WEIGHTS.noHealthyTools3Days;
    contributors.push("3+ consecutive days without healthy tool usage");
  }

  // Apply positive engagement bonuses
  if (maxConsecutiveDaysWithHealthy >= 7) {
    riskContribution += RISK_WEIGHTS.consistentHealthyUsage7Days;
    positiveSignals.push("7+ consecutive days of healthy tool engagement");
  } else if (maxConsecutiveDaysWithHealthy >= 5) {
    riskContribution += RISK_WEIGHTS.consistentHealthyUsage5Days;
    positiveSignals.push("5+ consecutive days of healthy tool engagement");
  }

  return { riskContribution, contributors, positiveSignals, negativeSignals };
}

