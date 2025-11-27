// src/services/recoveryForecast.js
// Recovery risk forecasting and intervention recommendations

/**
 * Forecast recovery risk based on emotional state and text
 * Returns risk level, reasons, and recommended intervention
 */
export function forecastRecoveryRisk(emotion, text) {
  if (!text || typeof text !== "string") {
    return {
      riskLevel: "safe",
      riskReasons: [],
      recommendedIntervention: null,
    };
  }

  const lowerText = text.toLowerCase();
  const riskReasons = [];
  let riskLevel = "safe";
  let recommendedIntervention = null;

  // High-risk patterns
  const highRiskPatterns = [
    // Urge + shame + isolation
    {
      pattern: (emotion === "urge" || lowerText.includes("craving") || lowerText.includes("tempted")) &&
               (emotion === "shame" || lowerText.includes("failing") || lowerText.includes("weak")) &&
               (lowerText.includes("alone") || lowerText.includes("isolated") || lowerText.includes("no one")),
      risk: "relapse-risk",
      reason: "Urge combined with shame and isolation",
      intervention: "urge-surfing",
    },
    // Mentions of using
    {
      pattern: lowerText.includes("using") || lowerText.includes("relapse") || 
               lowerText.includes("slipping") || lowerText.includes("using again"),
      risk: "relapse-risk",
      reason: "Active mention of substance use or relapse",
      intervention: "urge-surfing",
    },
    // Panic + confusion
    {
      pattern: (emotion === "panic" || lowerText.includes("panic") || lowerText.includes("freaking out")) &&
               (lowerText.includes("confused") || lowerText.includes("don't know") || lowerText.includes("lost")),
      risk: "warning",
      reason: "Panic combined with confusion",
      intervention: "grounding",
    },
    // High emotional intensity
    {
      pattern: lowerText.includes("can't breathe") || lowerText.includes("drowning") || 
               lowerText.includes("breaking") || lowerText.includes("falling apart"),
      risk: "warning",
      reason: "High emotional intensity",
      intervention: "breathing",
    },
  ];

  // Check high-risk patterns
  for (const pattern of highRiskPatterns) {
    if (pattern.pattern) {
      riskLevel = pattern.risk;
      riskReasons.push(pattern.reason);
      if (!recommendedIntervention) {
        recommendedIntervention = pattern.intervention;
      }
    }
  }

  // Emotional intensity-based recommendations
  if (emotion === "panic" || lowerText.includes("panic") || lowerText.includes("anxious")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "breathing";
    }
    if (riskLevel === "safe") {
      riskLevel = "warning";
      riskReasons.push("Panic detected");
    }
  }

  if (emotion === "urge" || lowerText.includes("craving") || lowerText.includes("tempted")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "urge-surfing";
    }
    if (riskLevel === "safe") {
      riskLevel = "warning";
      riskReasons.push("Urge or craving detected");
    }
  }

  if (emotion === "shame" && (lowerText.includes("using") || lowerText.includes("relapse"))) {
    riskLevel = "relapse-risk";
    riskReasons.push("Shame combined with substance use thoughts");
    if (!recommendedIntervention) {
      recommendedIntervention = "talk";
    }
  }

  // Overwhelm patterns
  if (emotion === "overwhelm" || lowerText.includes("too much") || lowerText.includes("can't handle")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "grounding";
    }
    if (riskLevel === "safe") {
      riskLevel = "warning";
      riskReasons.push("Overwhelm detected");
    }
  }

  // Dissociation patterns
  if (emotion === "dissociation" || lowerText.includes("numb") || lowerText.includes("disconnected")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "grounding";
    }
    if (riskLevel === "safe") {
      riskLevel = "warning";
      riskReasons.push("Dissociation detected");
    }
  }

  // Video requests
  if (lowerText.includes("show") || lowerText.includes("demonstrate") || 
      lowerText.includes("visual") || lowerText.includes("see")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "video";
    }
  }

  // Audio/voice needs
  if (lowerText.includes("talk to me") || lowerText.includes("speak") || 
      lowerText.includes("hear") || lowerText.includes("voice")) {
    if (!recommendedIntervention) {
      recommendedIntervention = "audio";
    }
  }

  return {
    riskLevel,
    riskReasons: [...new Set(riskReasons)], // Remove duplicates
    recommendedIntervention,
  };
}

export default {
  forecastRecoveryRisk,
};

