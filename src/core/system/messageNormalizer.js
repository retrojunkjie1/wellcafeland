// src/core/system/messageNormalizer.js
// Normalize any inbound message object into a standard shape for ChatPanel + store

/**
 * Normalize any inbound message object into a standard shape
 * for ChatPanel + store.
 *
 * This does NOT change meaning. It only ensures that fields are present
 * consistently so the UI and store don't break.
 */

/**
 * @typedef {Object} NormalizedMessage
 * @property {string} id
 * @property {string} role
 * @property {string} [type]
 * @property {string} [content]
 * @property {string} [text]
 * @property {number} [timestamp]
 * @property {object} [emotion]
 * @property {string[]} [triggers]
 * @property {{ riskLevel: string, reasons: string[], domains: string[] }} [risk]
 * @property {{ drift?: object, cluster?: object, forecast?: object }} [trajectory]
 * @property {{ kind: string, toolId?: string, reason?: string }} [suggestion]
 * @property {string} [audioUrl]
 * @property {string} [videoUrl]
 */

export function normalizeMessage(raw) {
  if (!raw || typeof raw !== "object") return raw;

  const base = { ...raw };

  // Ensure id
  if (!base.id) {
    base.id = `${base.role || "msg"}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // Normalize content / text
  if (!base.content && typeof base.text === "string") {
    base.content = base.text;
  }
  if (!base.text && typeof base.content === "string") {
    base.text = base.content;
  }

  // Default timestamp
  if (!base.timestamp) {
    base.timestamp = Date.now();
  }

  // Ensure optional structures are "safe"
  if (base.triggers && !Array.isArray(base.triggers)) {
    base.triggers = [];
  }
  if (!base.triggers) {
    base.triggers = [];
  }

  if (!base.risk || typeof base.risk !== "object") {
    base.risk = { riskLevel: "low", reasons: [], domains: [] };
  } else {
    base.risk = {
      riskLevel: base.risk.riskLevel || "low",
      reasons: Array.isArray(base.risk.reasons) ? base.risk.reasons : [],
      domains: Array.isArray(base.risk.domains) ? base.risk.domains : [],
    };
  }

  if (base.trajectory && typeof base.trajectory !== "object") {
    base.trajectory = undefined;
  }

  return base;
}

