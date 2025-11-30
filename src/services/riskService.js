// src/services/riskService.js
// Risk assessment and alert management

import { getClientEvents } from "./clientRegistry";
import { listClientsForProvider } from "./providerRegistry";
import { logError } from "./logService";

/**
 * Calculate risk label from events
 * @param {Array} events - Client events
 * @returns {string} Risk level ("safe" | "strained" | "at-risk" | "critical")
 */
export function calculateRiskLabel(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return "safe";
  }

  // Look at last 7 days of events
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(e => {
    const eventTime = e.timestamp?.getTime?.() || e.timestamp || 0;
    return eventTime >= sevenDaysAgo;
  });

  if (recentEvents.length === 0) {
    return "safe";
  }

  // Check for critical indicators
  const criticalKeywords = ["panic", "crisis", "suicide", "self-harm", "emergency"];
  const hasCritical = recentEvents.some(e => {
    const preview = (e.messagePreview || "").toLowerCase();
    const label = (e.emotionalLabel || "").toLowerCase();
    return criticalKeywords.some(kw => preview.includes(kw) || label.includes(kw));
  });

  if (hasCritical) {
    return "critical";
  }

  // Check for repeated urges
  const urgeEvents = recentEvents.filter(e => {
    const preview = (e.messagePreview || "").toLowerCase();
    const label = (e.emotionalLabel || "").toLowerCase();
    return preview.includes("urge") || 
           preview.includes("craving") || 
           preview.includes("tempted") ||
           label.includes("urge");
  });

  if (urgeEvents.length >= 3) {
    return "at-risk";
  }

  // Check for emotional numbness
  const numbnessEvents = recentEvents.filter(e => {
    const preview = (e.messagePreview || "").toLowerCase();
    const label = (e.emotionalLabel || "").toLowerCase();
    return preview.includes("numb") || 
           preview.includes("empty") || 
           preview.includes("disconnected") ||
           label.includes("dissociation");
  });

  if (numbnessEvents.length >= 5) {
    return "strained";
  }

  // Check for high emotional intensity
  const highIntensityEvents = recentEvents.filter(e => {
    const label = (e.emotionalLabel || "").toLowerCase();
    return label.includes("panic") || 
           label.includes("overwhelm") ||
           label.includes("anger");
  });

  if (highIntensityEvents.length >= 4) {
    return "strained";
  }

  // Default to safe
  return "safe";
}

/**
 * Get risk overview for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>}
 */
export async function getRiskOverview(providerId) {
  try {
    const clients = await listClientsForProvider(providerId);
    
    const riskCounts = {
      critical: 0,
      "at-risk": 0,
      strained: 0,
      safe: 0,
    };

    const riskClients = [];

    for (const client of clients) {
      const events = await getClientEvents(client.id, 30);
      const calculatedRisk = calculateRiskLabel(events);
      
      riskCounts[calculatedRisk] = (riskCounts[calculatedRisk] || 0) + 1;

      if (calculatedRisk !== "safe") {
        riskClients.push({
          clientId: client.id,
          alias: client.alias,
          riskLevel: calculatedRisk,
          lastEvent: events[0] || null,
        });
      }
    }

    return {
      riskCounts,
      totalClients: clients.length,
      riskClients: riskClients.slice(0, 10), // Top 10
    };
  } catch (err) {
    logError("riskService", err, { function: "getRiskOverview", providerId });
    return {
      riskCounts: { critical: 0, "at-risk": 0, strained: 0, safe: 0 },
      totalClients: 0,
      riskClients: [],
    };
  }
}

/**
 * Get client-specific risk assessment
 * @param {string} clientId - Client ID
 * @returns {Promise<Object>}
 */
export async function getClientRisk(clientId) {
  try {
    const events = await getClientEvents(clientId, 50);
    const riskLevel = calculateRiskLabel(events);

    // Find last high-intensity event
    const highIntensityEvents = events.filter(e => {
      const label = (e.emotionalLabel || "").toLowerCase();
      return label.includes("panic") || 
             label.includes("crisis") || 
             label.includes("urge") ||
             label.includes("overwhelm");
    });

    const lastHighIntensityEvent = highIntensityEvents[0] || null;

    // Count alerts
    const alertEvents = events.filter(e => e.type === "alert");
    const alertCount = alertEvents.length;

    return {
      riskLevel,
      lastHighIntensityEvent,
      alertCount,
      totalEvents: events.length,
      recentEvents: events.slice(0, 10),
    };
  } catch (err) {
    logError("riskService", err, { function: "getClientRisk", clientId });
    return {
      riskLevel: "safe",
      lastHighIntensityEvent: null,
      alertCount: 0,
      totalEvents: 0,
      recentEvents: [],
    };
  }
}

/**
 * Get active alerts for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>}
 */
export async function getAlertsForProvider(providerId) {
  try {
    const clients = await listClientsForProvider(providerId);
    const alerts = [];

    for (const client of clients) {
      const events = await getClientEvents(client.id, 20);
      
      // Find alert-worthy events
      const alertEvents = events.filter(e => {
        const preview = (e.messagePreview || "").toLowerCase();
        const label = (e.emotionalLabel || "").toLowerCase();
        
        // Panic indicators
        if (preview.includes("panic") || 
            preview.includes("can't breathe") || 
            preview.includes("freaking out") ||
            label.includes("panic")) {
          return true;
        }

        // Urge indicators
        if (preview.includes("urge") || 
            preview.includes("craving") || 
            preview.includes("tempted") ||
            preview.includes("using")) {
          return true;
        }

        // Crisis language
        if (preview.includes("crisis") || 
            preview.includes("emergency") || 
            preview.includes("help")) {
          return true;
        }

        // Emotional collapse
        if (preview.includes("breaking") || 
            preview.includes("falling apart") || 
            preview.includes("can't handle") ||
            label.includes("overwhelm")) {
          return true;
        }

        // Explicit alert type
        if (e.type === "alert") {
          return true;
        }

        return false;
      });

      for (const event of alertEvents.slice(0, 5)) {
        alerts.push({
          id: event.id,
          clientId: client.id,
          alias: client.alias,
          type: event.type,
          emotionalLabel: event.emotionalLabel,
          messagePreview: event.messagePreview,
          timestamp: event.timestamp,
          riskLevel: calculateRiskLabel([event]),
        });
      }
    }

    // Sort by timestamp (most recent first)
    alerts.sort((a, b) => {
      const aTime = a.timestamp?.getTime?.() || a.timestamp || 0;
      const bTime = b.timestamp?.getTime?.() || b.timestamp || 0;
      return bTime - aTime;
    });

    return alerts.slice(0, 20); // Top 20 alerts
  } catch (err) {
    logError("riskService", err, { function: "getAlertsForProvider", providerId });
    return [];
  }
}

/**
 * Evaluate message risk level based on text, emotion, and triggers
 * Phase 22: Enhanced with expanded risk detection rules
 * @param {Object} params
 * @param {string} params.text - Message text
 * @param {Object} params.emotion - Emotion analysis result (optional)
 * @param {string[]} params.triggers - Trigger domains (optional)
 * @returns {Object} { riskLevel, reasons, domains }
 */
export function evaluateMessageRisk({ text, emotion, triggers = [] }) {
  try {
    if (!text || typeof text !== "string") {
      return {
        riskLevel: "low",
        reasons: [],
        domains: [],
      };
    }

    const lowerText = text.toLowerCase();
    const reasons = [];
    const domains = [];

  // ============================================
  // LOW RISK: No concerning terms
  // ============================================
  // (Default state - no action needed)

  // ============================================
  // MODERATE RISK: Cravings, urges, emotional spirals, shame implosion
  // ============================================
  
  // Cravings/urge detection
  const cravingPhrases = [
    "use", "drink", "relapse", "craving", "urge", "tempted", "using",
    "want to use", "need to use", "thinking about using", "getting high",
    "want a drink", "want to get high", "i know what would make this easier"
  ];
  const hasCraving = cravingPhrases.some(phrase => lowerText.includes(phrase));
  if (hasCraving || triggers.includes("cravings") || triggers.includes("relapse_pressure")) {
    reasons.push("mentions cravings");
    domains.push("cravings");
  }

  // Emotional spirals
  const spiralPhrases = [
    "spiraling", "it keeps getting worse", "everything is piling", "piling up",
    "getting worse", "can't stop", "out of control"
  ];
  const hasSpiral = spiralPhrases.some(phrase => lowerText.includes(phrase));
  if (hasSpiral) {
    reasons.push("emotional spiral detected");
    domains.push("emotional_flooding");
  }

  // Shame implosion
  const shameImplosionPhrases = [
    "i'm disgusting", "i'm worthless", "i'm a failure", "i hate myself",
    "disgusted with myself", "i'm broken", "i'm damaged", "i'm ruined"
  ];
  const hasShameImplosion = shameImplosionPhrases.some(phrase => lowerText.includes(phrase));
  if (hasShameImplosion || triggers.includes("shame") || triggers.includes("self_worth_collapse")) {
    reasons.push("shame implosion detected");
    domains.push("shame");
  }

  // Hopelessness detection
  const hopelessPhrases = [
    "can't do this", "what's the point", "give up", "hopeless", "no point",
    "nothing matters", "why bother", "it's useless", "won't work", "never get better"
  ];
  const hasHopelessness = hopelessPhrases.some(phrase => lowerText.includes(phrase));
  if (hasHopelessness || triggers.includes("hopelessness")) {
    reasons.push("mentions hopelessness");
    domains.push("hopelessness");
  }

  // Isolation mentions
  if (triggers.includes("loneliness") || triggers.includes("social_isolation") || triggers.includes("isolation")) {
    reasons.push("mentions isolation");
    domains.push("isolation");
  }

  // Phase 23: Trauma flashback + overwhelm → moderate
  const emotionLabel = emotion?.label || "";
  if ((triggers.includes("trauma_echoes") || triggers.includes("emotional_flashbacks")) && 
      (triggers.includes("overwhelm") || emotionLabel === "overwhelmed")) {
    reasons.push("trauma flashback with overwhelm");
    domains.push("trauma_echoes");
    domains.push("overwhelm");
  }

  // Phase 23: Relational collapse wording → moderate
  const relationalCollapsePhrases = [
    "relationship is over", "they're leaving", "everything is falling apart",
    "relationship collapsing", "connection broken", "trust destroyed",
    "relationship ended", "they don't want me", "they're done with me"
  ];
  const hasRelationalCollapse = relationalCollapsePhrases.some(phrase => lowerText.includes(phrase));
  if (hasRelationalCollapse || (triggers.includes("relationship_conflict") && triggers.includes("abandonment_fear"))) {
    reasons.push("relational collapse detected");
    domains.push("relationship_conflict");
  }

  // ============================================
  // HIGH RISK: Self-harm language, severe hopelessness, collapse states
  // ============================================
  
  // Self-harm ideation (conservative detection)
  const selfHarmPhrases = [
    "want to disappear", "don't want to be here", "don't want to exist",
    "better off without me", "they'd be better", "no one would miss",
    "end it all", "not worth living", "i disappear", "i don't want to exist",
    "want to die", "kill myself", "suicide", "self-harm"
  ];
  const hasSelfHarm = selfHarmPhrases.some(phrase => lowerText.includes(phrase));
  if (hasSelfHarm) {
    reasons.push("mentions self-harm ideation");
    domains.push("self-harm");
  }

  // Severe hopelessness
  const severeHopelessPhrases = [
    "nothing matters anymore", "completely hopeless", "no way out",
    "trapped forever", "never getting better", "it's over", "i'm done"
  ];
  const hasSevereHopelessness = severeHopelessPhrases.some(phrase => lowerText.includes(phrase));
  if (hasSevereHopelessness && hasHopelessness) {
    reasons.push("severe hopelessness");
    domains.push("hopelessness");
  }

  // Collapse states + emotional implosion
  const collapsePhrases = [
    "i'm collapsing", "falling apart", "breaking down", "can't hold it together",
    "everything is falling apart", "i'm done", "i give up", "completely broken"
  ];
  const hasCollapse = collapsePhrases.some(phrase => lowerText.includes(phrase));
  if (hasCollapse) {
    reasons.push("collapse state detected");
    domains.push("internal_collapse");
  }

  // Emotional implosion (multiple high-intensity emotions)
  const highIntensityEmotions = ["panicked", "hopeless", "defeated", "ashamed", "guilty"];
  const hasHighIntensityEmotion = emotion && highIntensityEmotions.includes(emotion.label) && emotion.intensity >= 0.8;
  const hasMultipleTriggers = triggers.length >= 4;
  if (hasHighIntensityEmotion && hasMultipleTriggers) {
    reasons.push("emotional implosion");
    domains.push("emotional_flooding");
  }

  // High emotional intensity from emotion analysis
  if (emotion && emotion.intensity >= 0.8) {
    reasons.push("high emotional intensity");
    if (!domains.includes(emotion.label)) {
      domains.push(emotion.label);
    }
  }

  // ============================================
  // RISK LEVEL DETERMINATION
  // ============================================
  let riskLevel = "low";
  
  // High risk conditions
  if (hasSelfHarm) {
    riskLevel = "high";
  } else if (hasSevereHopelessness && hasCollapse) {
    riskLevel = "high";
  } else if (hasCollapse && hasHighIntensityEmotion) {
    riskLevel = "high";
  } else if (hasCraving && hasHopelessness && hasSpiral) {
    riskLevel = "high";
  }
  // Moderate risk conditions
  else if (hasCraving && hasHopelessness) {
    riskLevel = "moderate";
  } else if (hasCraving || hasHopelessness) {
    riskLevel = "moderate";
  } else if (hasSpiral || hasShameImplosion) {
    riskLevel = "moderate";
  } else if (emotion && emotion.intensity >= 0.7 && emotion.valence === "distressed") {
    riskLevel = "moderate";
  } else if (triggers.length >= 3) {
    riskLevel = "moderate";
  } else if ((triggers.includes("trauma_echoes") || triggers.includes("emotional_flashbacks")) && 
             (triggers.includes("overwhelm") || emotionLabel === "overwhelmed")) {
    // Phase 23: Trauma flashback + overwhelm → moderate
    riskLevel = "moderate";
  } else if (hasRelationalCollapse) {
    // Phase 23: Relational collapse → moderate
    riskLevel = "moderate";
  }

    return {
      riskLevel,
      reasons: [...new Set(reasons)], // Remove duplicates
      domains: [...new Set(domains)], // Remove duplicates
    };
  } catch (err) {
    console.warn("[riskService] evaluateMessageRisk failed:", err);
    // Never throw - return safe default
    return {
      riskLevel: "low",
      reasons: [],
      domains: [],
    };
  }
}

export default {
  calculateRiskLabel,
  getRiskOverview,
  getClientRisk,
  getAlertsForProvider,
  evaluateMessageRisk,
};

