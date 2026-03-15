// src/services/offlineGuide.js — offline response helper (Phase 54L + 54M Advanced Support Contract)
// No network; validate, safety steps, ask location + shelter.

/**
 * @param {string} text — user message
 * @param {{ intent?: string, crisis?: boolean }} opts
 * @returns {string}
 */
export function offlineRespond(text, { intent, crisis } = {}) {
  const trimmed = (text || "").trim().toLowerCase();
  const isCrisis = Boolean(crisis || /hurt myself|suicid|kill myself|end it|988|emergency/.test(trimmed));

  let out = "";
  out += "I'm here with you. Your message came through.\n\n";
  if (isCrisis) {
    out += "If you're in immediate danger, please call or text 988 (Suicide & Crisis Lifeline). You matter.\n\n";
  }
  out += "To point you to real options nearby:\n";
  out += "- What city/state are you in?\n";
  out += "- Do you need tonight or tomorrow shelter?";
  return out;
}

/**
 * Advanced Support Contract styled offline message for ALWAYS_ON_SUPPORT (Phase 54M).
 * Structure: reflect + 3 steps + 2 options + ask city/state once. No generic "share your city/state" alone.
 * @param {string} text — user message (used for light reflection)
 * @returns {string}
 */
export function advancedSupportContractOffline(text) {
  const trimmed = (text || "").trim();
  const reflect =
    trimmed.length > 0
      ? `I hear you — ${trimmed.length <= 80 ? trimmed : trimmed.slice(0, 77) + "…"}.\n\n`
      : "I hear that you're reaching out for support.\n\n";
  return (
    reflect +
    "**3 things that help right now:**\n" +
    "1. Pause and breathe — even a few breaths can slow the spiral.\n" +
    "2. Name what you need most (e.g. someone to talk to, trauma support, addiction resources).\n" +
    "3. If you're in crisis, call or text 988 anytime.\n\n" +
    "**2 ways to go next:**\n" +
    "• **Continue with guidance** — I can suggest next steps and resources.\n" +
    "• **Open Directory** — find food, shelter, treatment, or grants near you.\n\n" +
    "To tailor options to your area, what city or state are you in? (Optional — you can also say \"skip\" and I'll still guide you.)"
  );
}
