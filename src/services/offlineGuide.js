// src/services/offlineGuide.js — offline response helper (Phase 54L + 54M Advanced Support Contract)
// Honest local fallback. Never infer a practical need the person did not name.

/**
 * @param {string} text — user message
 * @param {{ intent?: string, crisis?: boolean }} opts
 * @returns {string}
 */
export function offlineRespond(text, { intent, crisis } = {}) {
  const trimmed = (text || "").trim().toLowerCase();
  const isCrisis = Boolean(crisis || /want to (?:die|hurt myself)|suicid(?:e|al)|kill myself|end my life|immediate danger/.test(trimmed));
  if (isCrisis) return "I can’t reach the AI guide right now. If you may be in immediate danger, call your local emergency number. In the U.S., call or text 988 for crisis support.";

  const needs = [
    ["housing", /shelter|housing|sober home|sober living|place to stay|eviction/],
    ["food", /food|groceries|meal|hungry|milk/],
    ["recovery support", /\baa\b|\bna\b|meeting|recovery group|treatment|detox|counselor/],
    ["transportation", /bus pass|bus ticket|transport|ride/],
    ["financial assistance", /benefits|financial help|rent assistance|utility bill/],
  ];
  const need = needs.find(([, pattern]) => pattern.test(trimmed))?.[0];
  if (intent === "directory" || need) {
    const label = need ? `${need} support` : "the resource you asked for";
    const followup = need === "housing" && /tonight|urgent|emergency/.test(trimmed)
      ? " If this is for tonight, say so and share your city and state."
      : " Share your city and state if you want local options.";
    return `The AI guide connection isn’t available, so I can’t look up or verify ${label} right now.${followup}`;
  }
  return "The AI guide connection isn’t available right now, so I can’t answer this message yet. Your message is still in the chat. You can retry later, or choose a practice or real-world support if that is what you need.";
}

/**
 * Advanced Support Contract styled offline message for ALWAYS_ON_SUPPORT (Phase 54M).
 * Structure: reflect + 3 steps + 2 options + ask city/state once. No generic "share your city/state" alone.
 * @param {string} text — user message (used for light reflection)
 * @returns {string}
 */
export function advancedSupportContractOffline(text) {
  return offlineRespond(text, { intent: "support" });
}
