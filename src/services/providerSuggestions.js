// src/services/providerSuggestions.js
// Heuristic-based suggestion engine for provider actions

import { getClientTimeline } from "./providerTimeline";

/**
 * Get suggested actions for a client based on their timeline
 * @param {string} clientId - Client's user ID
 * @param {Object} options - { days?: number }
 * @returns {Promise<{ok: boolean, suggestions?: Array, error?: string}>}
 */
export async function getSuggestedActionsForClient(clientId, options = {}) {
  if (!clientId) {
    return { ok: false, error: "Client ID required", suggestions: [] };
  }

  const { days = 7 } = options;
  
  // Get recent timeline
  const timelineResult = await getClientTimeline(clientId, { days, limit: 50 });
  
  if (!timelineResult.ok) {
    return { ok: false, error: timelineResult.error, suggestions: [] };
  }

  const events = timelineResult.events || [];
  const suggestions = [];

  // Analyze recent events for patterns
  const recentEvents = events.slice(0, 20); // Last 20 events
  
  // Calculate risk trend
  const riskScores = recentEvents
    .map(e => e.riskScore)
    .filter(s => s !== null && s !== undefined);
  
  const avgRisk = riskScores.length > 0
    ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
    : 0;
  
  const maxRisk = riskScores.length > 0 ? Math.max(...riskScores) : 0;
  const recentMaxRisk = riskScores.slice(0, 5).length > 0
    ? Math.max(...riskScores.slice(0, 5))
    : 0;
  
  const riskRising = recentMaxRisk > avgRisk + 10;

  // Check for high/rising risk
  if (maxRisk >= 75 || (riskRising && recentMaxRisk >= 60)) {
    suggestions.push({
      id: "high-risk-checkin",
      category: "safety",
      title: "Schedule check-in session",
      description: "Client has shown elevated risk signals. Consider a direct check-in to assess current safety and support needs.",
      priority: maxRisk >= 85 ? "high" : "medium",
    });

    suggestions.push({
      id: "grounding-combo",
      category: "safety",
      title: "Recommend grounding + breathing combo",
      description: "Suggest using both grounding and breathing tools together for immediate stabilization.",
      priority: "medium",
    });
  }

  // Check for housing/financial searches
  const housingSearches = recentEvents.filter(
    e => e.type === "directory" && (e.domain === "housing" || e.domain === "grants" || e.domain === "government_assistance")
  ).length;

  if (housingSearches >= 3) {
    suggestions.push({
      id: "housing-case-management",
      category: "stability",
      title: "Case management focused on housing/financial safety",
      description: "Client has been actively searching for housing and financial resources. Consider connecting with case management services.",
      priority: "medium",
    });
  }

  // Check for crisis/urge patterns
  const crisisKeywords = ["crisis", "urge", "craving", "suicide", "self-harm"];
  const hasCrisisActivity = recentEvents.some(e => {
    const label = (e.label || "").toLowerCase();
    const notes = (e.notes || "").toLowerCase();
    return crisisKeywords.some(kw => label.includes(kw) || notes.includes(kw));
  });

  if (hasCrisisActivity) {
    suggestions.push({
      id: "nighttime-safety-plan",
      category: "safety",
      title: "Develop nighttime safety plan",
      description: "Client has shown crisis-related activity. Create a safety plan with emergency contacts and nighttime support tools.",
      priority: "high",
    });
  }

  // Check for late-night activity
  const lateNightEvents = recentEvents.filter(e => {
    const hour = new Date(e.timestamp).getHours();
    return hour >= 22 || hour <= 4; // 10 PM - 4 AM
  }).length;

  if (lateNightEvents >= 3) {
    suggestions.push({
      id: "late-night-support",
      category: "connection",
      title: "Address late-night support needs",
      description: "Client is active during late-night hours. Ensure they have access to 24/7 crisis resources and tools.",
      priority: "medium",
    });
  }

  // Check for tool usage patterns
  const toolUsage = recentEvents.filter(e => e.type === "tool");
  const toolCounts = {};
  toolUsage.forEach(e => {
    const toolId = e.toolId || "unknown";
    toolCounts[toolId] = (toolCounts[toolId] || 0) + 1;
  });

  // If client uses tools frequently, suggest exploring new ones
  if (toolUsage.length >= 5) {
    const mostUsedTool = Object.entries(toolCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (mostUsedTool) {
      suggestions.push({
        id: "tool-diversification",
        category: "connection",
        title: "Explore complementary tools",
        description: `Client frequently uses ${mostUsedTool}. Consider introducing complementary tools for variety and deeper support.`,
        priority: "low",
      });
    }
  }

  // Check for low engagement
  if (events.length < 3 && days >= 7) {
    suggestions.push({
      id: "low-engagement-outreach",
      category: "connection",
      title: "Reach out - low recent engagement",
      description: "Client has had minimal activity recently. A gentle check-in may help re-engage and assess current needs.",
      priority: "low",
    });
  }

  // Check for grief-related activity
  const griefKeywords = ["grief", "loss", "death", "mourning"];
  const hasGriefActivity = recentEvents.some(e => {
    const label = (e.label || "").toLowerCase();
    const notes = (e.notes || "").toLowerCase();
    return griefKeywords.some(kw => label.includes(kw) || notes.includes(kw));
  });

  if (hasGriefActivity) {
    suggestions.push({
      id: "grief-support",
      category: "grief",
      title: "Grief support resources",
      description: "Client has shown grief-related activity. Consider connecting with grief counseling or support groups.",
      priority: "medium",
    });
  }

  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return { ok: true, suggestions };
}

export default {
  getSuggestedActionsForClient,
};

