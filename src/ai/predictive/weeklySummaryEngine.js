// src/ai/predictive/weeklySummaryEngine.js

/**
 * Weekly Summary Engine
 * Generates human-readable summaries for providers
 */

import { SUMMARY_TEMPLATES } from "./predictiveConfig";

/**
 * Generate weekly emotional summary
 * @param {object} telemetryWindow - Aggregated telemetry data
 * @param {object} riskInfo - Risk assessment from predictiveRiskEngine
 * @returns {object} Weekly summary
 */
export function generateWeeklySummary(telemetryWindow, riskInfo) {
  try {
    if (!telemetryWindow || telemetryWindow.hasInsufficientData) {
      return {
        title: SUMMARY_TEMPLATES.insufficientData.title,
        summaryText: "Not enough data available this week to generate a meaningful summary. The system is building a recovery profile as more activity is recorded.",
        keyHighlights: [
          "Recovery profile is being established",
          "More data will provide clearer insights",
        ],
        suggestedFocusAreas: [
          "Continue monitoring client engagement",
          "Encourage consistent tool usage",
        ],
      };
    }

    const { riskLevel, keyContributors, positiveSignals, negativeSignals } = riskInfo;

    // Generate title based on risk level
    const title = getSummaryTitle(riskLevel);

    // Generate summary text
    const summaryText = generateSummaryText(
      telemetryWindow,
      riskLevel,
      keyContributors,
      positiveSignals,
      negativeSignals
    );

    // Generate key highlights
    const keyHighlights = generateKeyHighlights(
      telemetryWindow,
      positiveSignals,
      negativeSignals
    );

    // Generate suggested focus areas
    const suggestedFocusAreas = generateSuggestedFocusAreas(
      riskLevel,
      keyContributors,
      negativeSignals
    );

    return {
      title,
      summaryText,
      keyHighlights,
      suggestedFocusAreas,
    };
  } catch (err) {
    console.warn("Failed to generate weekly summary (non-critical):", err.message);
    return {
      title: "Summary Unavailable",
      summaryText: "Unable to generate summary at this time. Please check back later.",
      keyHighlights: [],
      suggestedFocusAreas: [],
    };
  }
}

/**
 * Get summary title based on risk level
 */
function getSummaryTitle(riskLevel) {
  switch (riskLevel) {
    case "low":
      return SUMMARY_TEMPLATES.lowRisk.title;
    case "moderate":
      return SUMMARY_TEMPLATES.moderateRisk.title;
    case "high":
      return SUMMARY_TEMPLATES.highRisk.title;
    default:
      return SUMMARY_TEMPLATES.insufficientData.title;
  }
}

/**
 * Generate summary text
 */
function generateSummaryText(telemetryWindow, riskLevel, keyContributors, positiveSignals, negativeSignals) {
  const parts = [];

  // Opening observation
  if (riskLevel === "low") {
    parts.push("This week shows a stable recovery pattern with consistent engagement.");
  } else if (riskLevel === "moderate") {
    parts.push("This week shows mixed recovery signals with both positive engagement and some areas of concern.");
  } else if (riskLevel === "high") {
    parts.push("This week shows increased emotional intensity and may benefit from additional support.");
  }

  // Tool usage observation
  const toolCount = telemetryWindow.toolEvents.length;
  if (toolCount > 0) {
    const healthyToolCount = telemetryWindow.toolEvents.filter((e) => 
      ["breathing", "meditation", "grounding", "journaling", "body-scan"].includes(e.toolId)
    ).length;
    
    if (healthyToolCount > 0) {
      parts.push(`Client used healthy tools ${healthyToolCount} time${healthyToolCount > 1 ? "s" : ""} this week.`);
    }
    
    const urgeCount = telemetryWindow.toolEvents.filter((e) => 
      e.toolId === "urge-surfing" && (e.context?.intensityBefore >= 8 || e.context?.intensityAfter >= 8)
    ).length;
    
    if (urgeCount > 0) {
      parts.push(`There were ${urgeCount} high-intensity urge management session${urgeCount > 1 ? "s" : ""} this week.`);
    }
  }

  // Chat activity observation
  const chatCount = telemetryWindow.chatEvents.length;
  if (chatCount > 0) {
    parts.push(`Client had ${chatCount} interaction${chatCount > 1 ? "s" : ""} with the wellness guide this week.`);
  }

  // Session participation
  const sessionCount = telemetryWindow.sessionEvents.length;
  if (sessionCount > 0) {
    parts.push(`Client participated in ${sessionCount} group session${sessionCount > 1 ? "s" : ""} this week.`);
  }

  // Positive signals
  if (positiveSignals.length > 0) {
    parts.push(`Notable strengths: ${positiveSignals.slice(0, 2).join(", ")}.`);
  }

  // Negative signals (gentle language)
  if (negativeSignals.length > 0 && riskLevel !== "low") {
    const gentleNegative = negativeSignals.slice(0, 2).map((signal) => {
      // Make language more supportive
      return signal
        .replace("crisis", "increased intensity")
        .replace("high-urge", "strong urges")
        .replace("distress", "challenging moments");
    });
    parts.push(`Areas to monitor: ${gentleNegative.join(", ")}.`);
  }

  return parts.join(" ");
}

/**
 * Generate key highlights
 */
function generateKeyHighlights(telemetryWindow, positiveSignals, negativeSignals) {
  const highlights = [];

  // Tool usage highlights
  const toolCount = telemetryWindow.toolEvents.length;
  if (toolCount > 0) {
    const healthyTools = telemetryWindow.toolEvents.filter((e) =>
      ["breathing", "meditation", "grounding", "journaling", "body-scan"].includes(e.toolId)
    );
    
    if (healthyTools.length >= 5) {
      highlights.push(`Consistent use of healthy tools (${healthyTools.length} sessions)`);
    } else if (healthyTools.length > 0) {
      highlights.push(`Engaged with ${healthyTools.length} healthy tool session${healthyTools.length > 1 ? "s" : ""}`);
    }
  }

  // Add top positive signals
  if (positiveSignals.length > 0) {
    highlights.push(...positiveSignals.slice(0, 2));
  }

  // Add gentle negative observations (if any)
  if (negativeSignals.length > 0) {
    const gentle = negativeSignals[0]
      .replace("crisis", "increased intensity")
      .replace("high-urge", "strong urges");
    highlights.push(gentle);
  }

  // Default if no highlights
  if (highlights.length === 0) {
    highlights.push("Recovery profile is being established");
  }

  return highlights.slice(0, 4); // Limit to 4 highlights
}

/**
 * Generate suggested focus areas
 */
function generateSuggestedFocusAreas(riskLevel, keyContributors, negativeSignals) {
  const focusAreas = [];

  if (riskLevel === "high") {
    focusAreas.push("Consider a check-in conversation to assess current support needs");
    focusAreas.push("Review and reinforce coping strategies");
    
    if (negativeSignals.some((s) => s.includes("crisis") || s.includes("critical"))) {
      focusAreas.push("Assess safety and current state");
    }
  } else if (riskLevel === "moderate") {
    focusAreas.push("Continue monitoring engagement patterns");
    focusAreas.push("Encourage consistent use of healthy tools");
    
    if (keyContributors.some((c) => c.includes("consecutive days"))) {
      focusAreas.push("Explore barriers to tool engagement");
    }
  } else {
    focusAreas.push("Continue supporting current recovery patterns");
    focusAreas.push("Reinforce strengths and positive engagement");
  }

  // Add contributor-specific suggestions
  if (keyContributors.some((c) => c.includes("high-intensity"))) {
    focusAreas.push("Discuss urge management strategies");
  }
  if (keyContributors.some((c) => c.includes("shame"))) {
    focusAreas.push("Explore sources of shame and offer unconditional support");
  }
  if (keyContributors.some((c) => c.includes("despair"))) {
    focusAreas.push("Focus on small wins and sources of hope");
  }

  return focusAreas.slice(0, 4); // Limit to 4 focus areas
}

