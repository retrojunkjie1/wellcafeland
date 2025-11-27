// src/services/decisionEngine.js
// Central decision engine - integrates all analysis services

import { analyzeEmotionalState } from "./emotionalAnalysis";
import { analyzeSpiritualState } from "./spiritualAnalysis";
import { forecastRecoveryRisk } from "./recoveryForecast";
import { ContextMemory } from "./contextMemory";

/**
 * Determine guide response strategy based on user text
 * This is the central brain that integrates all analysis
 */
export async function determineGuideResponse(userText) {
  if (!userText || typeof userText !== "string") {
    return {
      emotion: { emotion: "neutral", intensity: 1, cues: [], urgency: "low" },
      spirit: { spiritualNeed: null, indicators: [] },
      forecast: { riskLevel: "safe", riskReasons: [], recommendedIntervention: null },
      needsAudio: false,
      needsVideo: false,
      intent: null,
    };
  }

  // Run all analyses
  const emotion = analyzeEmotionalState(userText);
  const spirit = analyzeSpiritualState(userText);
  const forecast = forecastRecoveryRisk(emotion.emotion, userText);

  // Update context memory
  ContextMemory.setLastEmotionalState(emotion);
  if (spirit.spiritualNeed) {
    ContextMemory.setLastSpiritualNeed(spirit.spiritualNeed);
  }

  // Determine intent
  let intent = null;
  if (forecast.recommendedIntervention) {
    intent = forecast.recommendedIntervention;
  } else if (emotion.emotion !== "neutral") {
    intent = emotion.emotion;
  } else if (spirit.spiritualNeed) {
    intent = spirit.spiritualNeed;
  }
  
  if (intent) {
    ContextMemory.setConversationIntent(intent);
  }

  // Determine if audio is needed
  const needsAudio = 
    emotion.intensity >= 4 ||
    forecast.recommendedIntervention === "breathing" ||
    forecast.recommendedIntervention === "urge-surfing" ||
    emotion.urgency === "high" ||
    forecast.riskLevel === "relapse-risk";

  // Determine if video is needed
  const needsVideo =
    forecast.recommendedIntervention === "grounding" ||
    forecast.recommendedIntervention === "breathing" ||
    userText.toLowerCase().includes("show") ||
    userText.toLowerCase().includes("demonstrate") ||
    userText.toLowerCase().includes("visual") ||
    spirit.spiritualNeed === "grounding";

  // Add to conversation history
  ContextMemory.addToHistory({
    text: userText.substring(0, 200), // Store first 200 chars
    emotion: emotion.emotion,
    intensity: emotion.intensity,
    spiritualNeed: spirit.spiritualNeed,
    riskLevel: forecast.riskLevel,
    intervention: forecast.recommendedIntervention,
  });

  return {
    emotion,
    spirit,
    forecast,
    needsAudio,
    needsVideo,
    intent,
  };
}

export default {
  determineGuideResponse,
};

