// src/services/featureFlags.js
// Feature flag service for gradual rollout and emergency controls
// Reads from Firestore, falls back to env, then safe defaults

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { logInfo, logWarn } from "./logService";

const FEATURE_FLAGS_DOC = "system_settings/featureFlags";
let cachedFlags = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get feature flags
 * Tries Firestore first, then env vars, then safe defaults
 */
export async function getFeatureFlags() {
  // Return cached flags if still valid
  if (cachedFlags && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedFlags;
  }

  // Try Firestore first
  if (db) {
    try {
      const docRef = doc(db, FEATURE_FLAGS_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        cachedFlags = {
          enableVoice: data.enableVoice !== false, // Default true
          enableVideo: data.enableVideo !== false,
          enableDirectory: data.enableDirectory !== false,
          enableProviderMode: data.enableProviderMode !== false,
          enableExperimentalTools: data.enableExperimentalTools === true, // Default false
        };
        cacheTimestamp = Date.now();
        logInfo("featureFlags", "Loaded flags from Firestore", cachedFlags);
        return cachedFlags;
      }
    } catch (err) {
      logWarn("featureFlags", "Failed to load from Firestore, using defaults", { error: err.message });
    }
  }

  // Fallback to env vars
  const envFlags = {
    enableVoice: import.meta.env.VITE_ENABLE_VOICE !== "false",
    enableVideo: import.meta.env.VITE_ENABLE_VIDEO !== "false",
    enableDirectory: import.meta.env.VITE_ENABLE_DIRECTORY !== "false",
    enableProviderMode: import.meta.env.VITE_ENABLE_PROVIDER_MODE !== "false",
    enableExperimentalTools: import.meta.env.VITE_ENABLE_EXPERIMENTAL_TOOLS === "true",
  };

  // Safe defaults (all enabled except experimental)
  cachedFlags = {
    enableVoice: envFlags.enableVoice !== false,
    enableVideo: envFlags.enableVideo !== false,
    enableDirectory: envFlags.enableDirectory !== false,
    enableProviderMode: envFlags.enableProviderMode !== false,
    enableExperimentalTools: envFlags.enableExperimentalTools === true,
  };

  cacheTimestamp = Date.now();
  return cachedFlags;
}

/**
 * Get feature flags synchronously (uses cache)
 * Use this in components for immediate checks
 */
export function getFeatureFlagsSync() {
  if (cachedFlags) {
    return cachedFlags;
  }

  // Return safe defaults if cache not loaded yet
  return {
    enableVoice: true,
    enableVideo: true,
    enableDirectory: true,
    enableProviderMode: true,
    enableExperimentalTools: false,
  };
}

/**
 * Clear cache (for testing or forced refresh)
 */
export function clearFeatureFlagsCache() {
  cachedFlags = null;
  cacheTimestamp = 0;
}

export default {
  getFeatureFlags,
  getFeatureFlagsSync,
  clearFeatureFlagsCache,
};

