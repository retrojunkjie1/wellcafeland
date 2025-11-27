// src/ai/interventions/interventionEngine.js

/**
 * Intervention Recommendation Engine
 * Generates provider action suggestions based on risk assessment and emotional patterns
 */

/**
 * Get provider recommendations for an event evaluation
 * @param {object} evaluation - Event evaluation result from telemetryEngine
 * @param {number} evaluation.riskScore - Risk score (0-10)
 * @param {string[]} evaluation.tags - Emotional tags
 * @param {string} evaluation.riskLevel - Risk level (LOW, MODERATE, HIGH, CRITICAL)
 * @param {string} eventType - Type of event (tool_usage, chat_message, session_event)
 * @returns {string[]} Array of recommended action strings
 */
export function getProviderRecommendationsForEvent(evaluation, eventType = "tool_usage") {
  if (!evaluation) {
    return [];
  }

  const { riskScore, tags, riskLevel } = evaluation;
  const recommendations = [];

  // Crisis/High risk recommendations
  if (riskLevel === "CRITICAL" || riskScore >= 9) {
    recommendations.push("Immediate check-in recommended");
    recommendations.push("Review recent session notes for crisis indicators");
    if (tags.includes("crisis") || tags.includes("despair")) {
      recommendations.push("Consider crisis intervention protocols");
    }
  }

  // High risk recommendations
  if (riskLevel === "HIGH" || riskScore >= 7) {
    recommendations.push("Schedule a check-in within 24-48 hours");
    if (tags.includes("high_urge") || tags.includes("cravings")) {
      recommendations.push("Focus on relapse prevention strategies in next session");
      recommendations.push("Review urge surfing techniques");
    }
    if (tags.includes("shame")) {
      recommendations.push("Explore shame language and self-compassion in next session");
    }
    if (tags.includes("escalating")) {
      recommendations.push("Monitor closely - situation appears to be worsening");
    }
  }

  // Moderate risk recommendations
  if (riskLevel === "MODERATE" || (riskScore >= 4 && riskScore < 7)) {
    if (tags.includes("distress")) {
      recommendations.push("Consider a supportive check-in message");
    }
    if (tags.includes("anxiety") || tags.includes("overwhelmed")) {
      recommendations.push("Recommend grounding tools before evening");
    }
    if (tags.includes("grief") || tags.includes("processing")) {
      recommendations.push("Review recent session notes for unresolved grief");
    }
    if (tags.includes("disengagement")) {
      recommendations.push("Re-engagement strategy may be needed");
    }
  }

  // Event-type specific recommendations
  if (eventType === "chat_message") {
    if (tags.includes("crisis") || tags.includes("despair")) {
      recommendations.push("Review chat message content for immediate safety concerns");
    }
    if (tags.includes("lonely") || tags.includes("isolated")) {
      recommendations.push("Consider connection-building activities or group recommendations");
    }
  }

  if (eventType === "session_event") {
    if (tags.includes("struggling") || tags.includes("stuck")) {
      recommendations.push("Explore what's blocking progress in next session");
    }
    if (tags.includes("breakthrough") || tags.includes("progress")) {
      recommendations.push("Acknowledge and reinforce progress in follow-up");
    }
  }

  if (eventType === "tool_usage") {
    if (tags.includes("seeking_stability") || tags.includes("seeking_calm")) {
      recommendations.push("Client is actively using tools - reinforce positive coping");
    }
    if (tags.includes("improving")) {
      recommendations.push("Positive trend detected - celebrate progress");
    }
  }

  // Remove duplicates and return
  return [...new Set(recommendations)];
}

/**
 * Get aggregated recommendations for multiple events
 * @param {Array} events - Array of events with evaluations
 * @returns {Array} Aggregated recommendations with context
 */
export function getAggregatedRecommendations(events) {
  const recommendationsMap = new Map();

  events.forEach((event) => {
    const evaluation = event.evaluation || event.meta?.evaluation;
    const eventType = event.type || event.meta?.originalEvent?.type || "tool_usage";

    if (!evaluation) return;

    const recs = getProviderRecommendationsForEvent(evaluation, eventType);
    recs.forEach((rec) => {
      if (!recommendationsMap.has(rec)) {
        recommendationsMap.set(rec, {
          recommendation: rec,
          count: 0,
          severity: evaluation.riskLevel || "MODERATE",
          eventTypes: new Set(),
        });
      }
      const entry = recommendationsMap.get(rec);
      entry.count++;
      entry.eventTypes.add(eventType);
    });
  });

  // Convert to array and sort by severity and count
  return Array.from(recommendationsMap.values())
    .sort((a, b) => {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1 };
      const aSeverity = severityOrder[a.severity] || 2;
      const bSeverity = severityOrder[b.severity] || 2;
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return b.count - a.count;
    });
}

