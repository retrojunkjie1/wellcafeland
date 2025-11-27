// src/services/profileService.js
// Wellness profile service for anonymous + logged-in users
// Soft, non-clinical preferences

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { getAnonymousUserId } from "@/lib/userId";
import { logError, logInfo } from "./logService";

const PROFILE_STORAGE_KEY = "wc-wellness-profile-v1";

/**
 * Get current user ID (authenticated or anonymous)
 */
function getCurrentUserId() {
  try {
    // Try to get from hook if in React context, otherwise use direct method
    if (typeof window !== "undefined" && window.__wc_current_user_id) {
      return window.__wc_current_user_id;
    }
    return auth?.currentUser?.uid || getAnonymousUserId();
  } catch {
    return getAnonymousUserId();
  }
}

/**
 * Default profile
 */
const DEFAULT_PROFILE = {
  displayName: null,
  preferredMode: "mixed", // "text" | "voice" | "video" | "mixed"
  preferredTone: "gentle", // "direct" | "gentle" | "spiritual" | "practical"
  sessionPace: "standard", // "short" | "standard" | "deepDive"
  focusAreas: [], // string[]
  doNotUse: [], // string[]
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Get current wellness profile
 * Tries Firestore first, then localStorage
 */
export async function getCurrentProfile() {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return DEFAULT_PROFILE;
  }

  // Try Firestore first
  if (db) {
    try {
      const profileRef = doc(db, "user_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return {
          ...DEFAULT_PROFILE,
          ...data,
          id: profileSnap.id,
        };
      }
    } catch (err) {
      logError("profileService", err, { function: "getCurrentProfile", step: "firestore" });
    }
  }

  // Fallback to localStorage
  try {
    const key = `${PROFILE_STORAGE_KEY}-${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
      };
    }
  } catch (err) {
    logError("profileService", err, { function: "getCurrentProfile", step: "localStorage" });
  }

  return DEFAULT_PROFILE;
}

/**
 * Set consent for a specific role/key
 * @param {string} role - Role ("provider" | "admin")
 * @param {string} key - Consent key (e.g., "emotionalPatterns", "sessionSummary")
 * @param {boolean} value - Consent value
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function setConsent(role, key, value) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { ok: false, error: "Unable to identify user" };
  }

  try {
    const consentKey = `consent_${role}_${key}`;
    
    // Try Firestore first
    if (db) {
      try {
        const profileRef = doc(db, "user_profiles", userId);
        const profileSnap = await getDoc(profileRef);
        
        const currentData = profileSnap.exists() ? profileSnap.data() : {};
        await setDoc(profileRef, {
          ...currentData,
          [consentKey]: value,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        
        logInfo("profileService", "Consent updated", { userId, role, key, value });
        return { ok: true };
      } catch (err) {
        logError("profileService", err, { function: "setConsent", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const profileKey = `${PROFILE_STORAGE_KEY}-${userId}`;
      const stored = localStorage.getItem(profileKey);
      const currentData = stored ? JSON.parse(stored) : {};
      currentData[consentKey] = value;
      currentData.updatedAt = new Date().toISOString();
      localStorage.setItem(profileKey, JSON.stringify(currentData));
      return { ok: true };
    } catch (err) {
      logError("profileService", err, { function: "setConsent", step: "localStorage" });
      return { ok: false, error: err.message };
    }
  } catch (err) {
    logError("profileService", err, { function: "setConsent" });
    return { ok: false, error: err.message };
  }
}

/**
 * Get consent for a specific role/key
 * @param {string} role - Role ("provider" | "admin")
 * @param {string} key - Consent key
 * @returns {Promise<boolean>} Consent value (defaults to false)
 */
export async function getConsent(role, key) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return false;
  }

  const consentKey = `consent_${role}_${key}`;

  // Try Firestore first
  if (db) {
    try {
      const profileRef = doc(db, "user_profiles", userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        return data[consentKey] === true;
      }
    } catch (err) {
      logError("profileService", err, { function: "getConsent", step: "firestore" });
    }
  }

  // Fallback to localStorage
  try {
    const profileKey = `${PROFILE_STORAGE_KEY}-${userId}`;
    const stored = localStorage.getItem(profileKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[consentKey] === true;
    }
  } catch (err) {
    logError("profileService", err, { function: "getConsent", step: "localStorage" });
  }

  return false;
}

/**
 * Save profile (partial update)
 */
export async function saveProfile(partialUpdate) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    return { ok: false, error: "Unable to identify user" };
  }

  try {
    const currentProfile = await getCurrentProfile();
    const updatedProfile = {
      ...currentProfile,
      ...partialUpdate,
      updatedAt: new Date().toISOString(),
    };

    // Remove id if it exists (not part of profile data)
    delete updatedProfile.id;

    // Try Firestore first
    if (db) {
      try {
        const profileRef = doc(db, "user_profiles", userId);
        await setDoc(profileRef, updatedProfile, { merge: true });
        logInfo("profileService", "Profile saved to Firestore", { userId });
        return { ok: true };
      } catch (err) {
        logError("profileService", err, { function: "saveProfile", step: "firestore" });
      }
    }

    // Fallback to localStorage
    try {
      const key = `${PROFILE_STORAGE_KEY}-${userId}`;
      localStorage.setItem(key, JSON.stringify(updatedProfile));
      logInfo("profileService", "Profile saved to localStorage", { userId });
      return { ok: true };
    } catch (err) {
      logError("profileService", err, { function: "saveProfile", step: "localStorage" });
      return { ok: false, error: "Failed to save profile" };
    }
  } catch (err) {
    logError("profileService", err, { function: "saveProfile" });
    return { ok: false, error: err.message || "Unknown error" };
  }
}

/**
 * Get preference flags for other services
 * Returns normalized flags that can be used in prompts/UI
 */
export async function getPreferenceFlags() {
  const profile = await getCurrentProfile();
  
  return {
    preferredMode: profile.preferredMode || "mixed",
    preferredTone: profile.preferredTone || "gentle",
    sessionPace: profile.sessionPace || "standard",
    focusAreas: Array.isArray(profile.focusAreas) ? profile.focusAreas : [],
    doNotUse: Array.isArray(profile.doNotUse) ? profile.doNotUse : [],
    
    // Derived flags
    wantsVoice: profile.preferredMode === "voice" || profile.preferredMode === "mixed",
    wantsVideo: profile.preferredMode === "video" || profile.preferredMode === "mixed",
    wantsText: profile.preferredMode === "text" || profile.preferredMode === "mixed",
    
    // Session duration hints
    defaultDurationMinutes: profile.sessionPace === "short" ? 5 : 
                           profile.sessionPace === "deepDive" ? 20 : 10,
  };
}

/**
 * Get preference flags synchronously (uses cache or defaults)
 * Use this in React components for immediate checks
 */
export function getPreferenceFlagsSync() {
  try {
    const userId = getCurrentUserId();
    const key = `${PROFILE_STORAGE_KEY}-${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const profile = JSON.parse(stored);
      return {
        preferredMode: profile.preferredMode || "mixed",
        preferredTone: profile.preferredTone || "gentle",
        sessionPace: profile.sessionPace || "standard",
        focusAreas: Array.isArray(profile.focusAreas) ? profile.focusAreas : [],
        doNotUse: Array.isArray(profile.doNotUse) ? profile.doNotUse : [],
        wantsVoice: profile.preferredMode === "voice" || profile.preferredMode === "mixed",
        wantsVideo: profile.preferredMode === "video" || profile.preferredMode === "mixed",
        wantsText: profile.preferredMode === "text" || profile.preferredMode === "mixed",
        defaultDurationMinutes: profile.sessionPace === "short" ? 5 : 
                               profile.sessionPace === "deepDive" ? 20 : 10,
      };
    }
  } catch (err) {
    // Silently fail
  }
  
  // Return safe defaults
  return {
    preferredMode: "mixed",
    preferredTone: "gentle",
    sessionPace: "standard",
    focusAreas: [],
    doNotUse: [],
    wantsVoice: true,
    wantsVideo: true,
    wantsText: true,
    defaultDurationMinutes: 10,
  };
}

export default {
  getCurrentProfile,
  saveProfile,
  getPreferenceFlags,
  getPreferenceFlagsSync,
};

