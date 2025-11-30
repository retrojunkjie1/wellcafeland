// src/core/system/emotionEngine.js
// Phase 25 — Emotion Engine (Pure, Synchronous, Safe)
// NO side-effects, NO UI imports.

import { analyzeMessageEmotion } from "@/services/emotionalAnalysis";

/**
 * Convert raw text into emotion → { label, intensity, valence }
 *
 * @param {string} text
 * @returns {{label:string, intensity:number, valence:string} | null}
 */
export function getEmotionFromText(text) {
  if (!text || typeof text !== "string") return null;

  try {
    const raw = analyzeMessageEmotion(text);

    if (!raw) return null;

    return {
      label: typeof raw.label === "string" ? raw.label : "neutral",
      intensity:
        typeof raw.intensity === "number"
          ? Math.max(0, Math.min(1, raw.intensity))
          : 0,
      valence: typeof raw.valence === "string" ? raw.valence : "neutral",
    };
  } catch (err) {
    console.warn("[emotionEngine] getEmotionFromText failed:", err);
    return null;
  }
}

/**
 * Safely attach emotion to a message object.
 * Pure, predictable, and NEVER throws.
 *
 * @param {Object} message
 * @returns {Object}
 */
export function enrichMessageWithEmotionSafe(message) {
  try {
    if (
      !message ||
      typeof message !== "object" ||
      message.role !== "user" ||
      typeof message.content !== "string" ||
      !message.content.trim()
    ) {
      return message;
    }

    const emotion = getEmotionFromText(message.content);
    if (!emotion) return message;

    return { ...message, emotion };
  } catch (err) {
    console.warn("[emotionEngine] enrichMessageWithEmotionSafe failed:", err);
    return message;
  }
}

export default {
  getEmotionFromText,
  enrichMessageWithEmotionSafe,
};
