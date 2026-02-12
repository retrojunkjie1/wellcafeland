/**
 * Lightweight debug toggle via localStorage key wc_debug="1"
 * When enabled, logs endpoint resolution and tool resolution (no secrets, tokens, PII)
 */

const DEBUG_KEY = "wc_debug";

export function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage?.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Log debug info only when wc_debug=1. Never logs secrets, tokens, or PII.
 * @param {string} tag - Log tag (e.g. "Chat", "TTS", "Tool")
 * @param {Record<string, unknown>} data - Safe key-value pairs
 */
export function logDebug(tag, data) {
  if (!isDebugEnabled()) return;
  const safe = { tag, ...data };
  console.log("[wc_debug]", JSON.stringify(safe));
}
