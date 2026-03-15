/**
 * Ensures generated copy uses calm, dignified, non-shaming language.
 */

const SHAME_TERMS = ["failed", "weak", "bad choices", "failure", "relapse", "slipped"];
const PREFERRED_TERMS = ["today", "next step", "support", "stability", "small wins", "progress"];

function sanitize(text) {
  if (!text || typeof text !== "string") return "";
  let out = text;
  for (const term of SHAME_TERMS) {
    const re = new RegExp(`\\b${term}\\b`, "gi");
    out = out.replace(re, "today");
  }
  return out.trim();
}

function applyToneDirectives(text, directives = {}) {
  let out = sanitize(text);
  if (directives.avoidPressure) {
    out = out.replace(/\b(must|should|have to)\b/gi, "can");
  }
  if (directives.smallSteps) {
    out = out.replace(/\b(big|large|major)\b/gi, "small");
  }
  return out;
}

module.exports = { sanitize, applyToneDirectives, SHAME_TERMS, PREFERRED_TERMS };
