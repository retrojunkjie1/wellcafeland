// src/core/system/riskEngine.js
// Phase 25 — Risk Engine (Pure, Synchronous, Safe)
// NO external API calls. No UI imports.

import { detectTriggerDomains } from "@/services/emotionalAnalysis";
import { evaluateMessageRisk } from "@/services/riskService";

/**
 * Extract all "signal primitives" from a user message.
 * This is the raw material for triggers + risk evaluation.
 *
 * @param {Object} message
 * @returns {{ text:string, emotion?:Object }}
 */
export function extractSignalPrimitives(message) {
  if (!message || typeof message !== "object") {
    return { text: "", emotion: null };
  }

  const text =
    typeof message.content === "string" ? message.content.trim() : "";

  return {
    text,
    emotion: message.emotion || null,
  };
}

/**
 * Pure trigger detection
 *
 * @param {string} text
 * @returns {string[]}
 */
export function getTriggerDomains(text) {
  try {
    if (!text || typeof text !== "string") return [];
    return detectTriggerDomains(text);
  } catch (err) {
    console.warn("[riskEngine] getTriggerDomains failed:", err);
    return [];
  }
}

/**
 * Evaluate message-level risk safely
 *
 * @param {Object} params
 * @returns {{riskLevel:string, reasons:string[], domains:string[]}}
 */
export function computeRiskScore({ text, emotion, triggers }) {
  try {
    return (
      evaluateMessageRisk({
        text,
        emotion,
        triggers,
      }) || {
        riskLevel: "low",
        reasons: [],
        domains: [],
      }
    );
  } catch (err) {
    console.warn("[riskEngine] computeRiskScore failed:", err);
    return {
      riskLevel: "low",
      reasons: [],
      domains: [],
    };
  }
}

/**
 * Rich wrapper → text + emotion → triggers + risk
 *
 * @param {Object} message
 * @returns {{ triggers:string[], risk:{riskLevel:string, reasons:string[], domains:string[]} }}
 */
export function analyzeMessageSignalsSafe(message) {
  try {
    const { text, emotion } = extractSignalPrimitives(message);
    const triggers = getTriggerDomains(text);
    const risk = computeRiskScore({ text, emotion, triggers });

    return { triggers, risk };
  } catch (err) {
    console.warn("[riskEngine] analyzeMessageSignalsSafe failed:", err);
    return {
      triggers: [],
      risk: { riskLevel: "low", reasons: [], domains: [] },
    };
  }
}

export default {
  extractSignalPrimitives,
  getTriggerDomains,
  computeRiskScore,
  analyzeMessageSignalsSafe,
};
