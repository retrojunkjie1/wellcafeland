// src/core/system/toneEngine.js
// Phase 26 — Adaptive Tone System (ATS)
// Pure, side-effect-free tone profile computation
// NO React imports, NO external calls, NO side effects

/**
 * Compute tone profile based on human mode, emotion, and risk.
 * @param {Object} params
 * @param {string} [params.humanMode]
 * @param {Object} [params.emotion]
 * @param {string} [params.emotion.label]
 * @param {number} [params.emotion.intensity]
 * @param {string} [params.emotion.valence]
 * @param {Object} [params.risk]
 * @param {string} [params.risk.riskLevel]
 * @param {string[]} [params.risk.reasons]
 * @param {string[]} [params.risk.domains]
 * @returns {{ tone: string, allowHumor: boolean, safetyTier: string, redirectStrategy: string }}
 */
export function getToneProfile({ humanMode, emotion, risk } = {}) {
  try {
    const riskLevel = risk?.riskLevel || "low";
    const intensity = typeof emotion?.intensity === "number" ? emotion.intensity : 0;
    const mode = humanMode || "neutral";

    // Default profile
    let tone = "grounded";
    let allowHumor = false;
    let safetyTier = "medium";
    let redirectStrategy = "gentle";

    // 1) Safety override (highest priority)
    if (riskLevel === "high" || mode === "risk_sensitive") {
      tone = "clinical";
      allowHumor = false;
      safetyTier = "high";
      redirectStrategy = "strong";
      return { tone, allowHumor, safetyTier, redirectStrategy };
    }

    if (mode === "recovery_core" || mode === "emotional_heavy") {
      tone = "grounded";
      allowHumor = false;
      safetyTier = "medium";
      redirectStrategy = "gentle";
      return { tone, allowHumor, safetyTier, redirectStrategy };
    }

    // 2) Emotional override (respect high intensity even if mode is light)
    if (intensity >= 0.75) {
      tone = "grounded";
      allowHumor = false;
      // Don't override safetyTier if it's already "high" (but we already returned above if high risk)
      if (safetyTier !== "high") {
        safetyTier = "medium";
      }
      redirectStrategy = "gentle";
      return { tone, allowHumor, safetyTier, redirectStrategy };
    }

    // 3) HumanMode mapping (only when risk is not high and intensity < 0.75)
    if (riskLevel !== "high" && intensity < 0.75) {
      switch (mode) {
        case "humor":
          tone = "playful";
          allowHumor = true;
          safetyTier = "low";
          redirectStrategy = "gentle";
          break;

        case "casual":
          tone = "warm";
          allowHumor = true;
          safetyTier = "low";
          redirectStrategy = "gentle";
          break;

        case "entertainment":
        case "politics":
          tone = "informative";
          allowHumor = true;
          safetyTier = "low";
          redirectStrategy = "gentle";
          break;

        case "body_question":
          tone = "informative";
          allowHumor = true; // light, not mocking
          safetyTier = "medium";
          redirectStrategy = "gentle";
          break;

        case "life_advice":
          tone = "mentor";
          allowHumor = true; // sparingly
          safetyTier = "medium";
          redirectStrategy = "gentle";
          break;

        case "curiosity":
          tone = "informative";
          allowHumor = true;
          safetyTier = "low";
          redirectStrategy = "gentle";
          break;

        default:
        case "neutral":
          tone = "grounded";
          allowHumor = false;
          safetyTier = "medium";
          redirectStrategy = "gentle";
          break;
      }
    }

    return { tone, allowHumor, safetyTier, redirectStrategy };
  } catch (err) {
    console.warn("[toneEngine] getToneProfile failed:", err);
    // Return safe default
    return {
      tone: "grounded",
      allowHumor: false,
      safetyTier: "medium",
      redirectStrategy: "gentle",
    };
  }
}

/**
 * Determine if a gentle redirect should be shown.
 * @param {Object} params
 * @param {string} [params.humanMode]
 * @param {Object} [params.risk]
 * @param {string} [params.risk.riskLevel]
 * @param {number} [params.messageCount]
 * @returns {boolean}
 */
export function shouldSoftRedirect({ humanMode, risk, messageCount } = {}) {
  try {
    const riskLevel = risk?.riskLevel || "low";
    const mode = humanMode || "neutral";
    const count = typeof messageCount === "number" ? messageCount : 0;

    // Never redirect if high risk (we handle that elsewhere)
    if (riskLevel === "high") {
      return false;
    }

    // Redirect if light topic and conversation has some history
    const lightTopics = ["humor", "entertainment", "politics", "body_question"];
    if (lightTopics.includes(mode) && count >= 3) {
      return true;
    }

    return false;
  } catch (err) {
    console.warn("[toneEngine] shouldSoftRedirect failed:", err);
    return false;
  }
}

export default {
  getToneProfile,
  shouldSoftRedirect,
};

