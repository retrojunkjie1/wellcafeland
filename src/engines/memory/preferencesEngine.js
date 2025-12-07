// src/engines/memory/preferencesEngine.js
// PHASE 44 — User Preferences Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * User comfort preferences (sound, narration, theme).
 */
export function setPreference(key, value) {
  memoryStore.setPreference(key, value);
}

export function getPreferences() {
  return memoryStore.getState().preferences || {};
}

export function getPreference(key, fallback) {
  const prefs = memoryStore.getState().preferences || {};
  if (Object.prototype.hasOwnProperty.call(prefs, key)) {
    return prefs[key];
  }
  return fallback;
}

