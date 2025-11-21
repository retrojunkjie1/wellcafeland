// src/lib/userId.js

/**
 * Get or create an anonymous user ID for this device.
 * This ID is:
 * - Persistent across sessions
 * - Never contains personal info
 * - Never exposes identity
 * - Works fully offline
 * - Enables telemetry + sessions + history sync
 */
export function getAnonymousUserId() {
  const KEY = "wc-anonymous-user-id";

  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      // Generate a new anonymous ID
      id = "anon_" + crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (err) {
    // Fallback if localStorage fails
    console.warn("Failed to get/set anonymous user ID:", err);
    // Return a session-only ID (won't persist but won't break)
    return "anon_session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  }
}

/**
 * Check if we have a valid anonymous user ID
 */
export function hasAnonymousUserId() {
  try {
    const id = localStorage.getItem("wc-anonymous-user-id");
    return !!id && id.startsWith("anon_");
  } catch {
    return false;
  }
}

