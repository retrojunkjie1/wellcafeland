// src/core/architecture/osAlignment.js
// Phase 27 — OS Architecture Layer
// Central brain for dynamic UI tone and layout adaptation
// NO React imports, NO side effects, pure functions only

/**
 * Detect UI state based on human mode, emotion, and risk.
 * @param {string} [humanMode]
 * @param {Object} [emotion]
 * @param {Object} [risk]
 * @returns {Object}
 */
export function detectUIState(humanMode, emotion, risk) {
  try {
    const mode = humanMode || "neutral";
    const intensity = typeof emotion?.intensity === "number" ? emotion.intensity : 0;
    const riskLevel = risk?.riskLevel || "low";

    let visualMode = "neutral";
    let animationStyle = "default";
    let backdropIntensity = 0;

    // High risk overrides everything
    if (riskLevel === "high" || mode === "risk_sensitive") {
      visualMode = "crisis";
      animationStyle = "steady";
      backdropIntensity = 0.1;
    } else if (mode === "emotional_heavy" || mode === "recovery_core") {
      visualMode = "grounded";
      animationStyle = "calm";
      backdropIntensity = 0.05;
    } else if (mode === "humor") {
      visualMode = "playful";
      animationStyle = "bounce";
      backdropIntensity = 0;
    } else if (mode === "casual") {
      visualMode = "relaxed";
      animationStyle = "fade";
      backdropIntensity = 0;
    } else if (intensity >= 0.75) {
      visualMode = "intense";
      animationStyle = "calm";
      backdropIntensity = 0.03;
    }

    return {
      visualMode,
      animationStyle,
      backdropIntensity,
    };
  } catch (err) {
    console.warn("[osAlignment] detectUIState failed:", err);
    return {
      visualMode: "neutral",
      animationStyle: "default",
      backdropIntensity: 0,
    };
  }
}

/**
 * Compute layout mode from momentum state.
 * @param {Object} [momentumState]
 * @returns {string}
 */
export function computeLayoutMode(momentumState) {
  try {
    if (!momentumState || typeof momentumState !== "object") {
      return "standard";
    }

    const direction = momentumState.direction || "stable";
    const volatility = typeof momentumState.volatility === "number" ? momentumState.volatility : 0;

    if (volatility > 0.6) {
      return "minimal"; // Reduce distractions
    }

    if (direction === "declining") {
      return "focused"; // Focus on support
    }

    return "standard";
  } catch (err) {
    console.warn("[osAlignment] computeLayoutMode failed:", err);
    return "standard";
  }
}

/**
 * Harmonize theme based on emotion and human mode.
 * @param {Object} [emotion]
 * @param {string} [humanMode]
 * @returns {Object}
 */
export function harmonizeTheme(emotion, humanMode) {
  try {
    const mode = humanMode || "neutral";
    const intensity = typeof emotion?.intensity === "number" ? emotion.intensity : 0;

    let themeVariant = "default";
    let accentIntensity = 0.5;

    if (mode === "humor" || mode === "casual") {
      themeVariant = "light";
      accentIntensity = 0.3;
    } else if (mode === "emotional_heavy" || mode === "recovery_core") {
      themeVariant = "grounded";
      accentIntensity = 0.7;
    } else if (intensity >= 0.8) {
      themeVariant = "intense";
      accentIntensity = 0.9;
    }

    return {
      themeVariant,
      accentIntensity,
    };
  } catch (err) {
    console.warn("[osAlignment] harmonizeTheme failed:", err);
    return {
      themeVariant: "default",
      accentIntensity: 0.5,
    };
  }
}

/**
 * Get priority visual state for UI rendering.
 * @returns {Object}
 */
export function getPriorityVisualState() {
  // This can be extended to read from a global store or context
  // For now, return a safe default
  return {
    mode: "neutral",
    urgency: "normal",
    focus: "standard",
  };
}

/**
 * Produce UI intent based on current state.
 * @returns {Object}
 */
export function produceUIIntent() {
  // This can be extended to synthesize multiple signals
  // For now, return a safe default
  return {
    intent: "support",
    priority: "normal",
    style: "default",
  };
}

export default {
  detectUIState,
  computeLayoutMode,
  harmonizeTheme,
  getPriorityVisualState,
  produceUIIntent,
};

