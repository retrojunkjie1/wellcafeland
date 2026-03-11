// src/services/sessionPrefs.js — guest/session preferences (Phase 54L)
// Store in localStorage under "wc_prefs"

const PREFS_KEY = "wc_prefs";

function getStorage() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStorage(obj) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(obj));
  } catch {}
}

/**
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function getPref(key, fallback) {
  const prefs = getStorage();
  return key in prefs ? prefs[key] : fallback;
}

/**
 * @param {string} key
 * @param {*} value
 */
export function setPref(key, value) {
  const prefs = getStorage();
  prefs[key] = value;
  setStorage(prefs);
}
