// src/services/adminAccess.js

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// LocalStorage keys
const ADMIN_FLAG_KEY = "wc-admin-flag-v1";
const ADMIN_KEY_HINT_KEY = "wc-admin-hint-v1";

// You can set this in your .env file for production:
// VITE_WC_MASTER_ADMIN_KEY="your-strong-secret-here"
const ENV_MASTER_KEY = import.meta.env.VITE_WC_MASTER_ADMIN_KEY;

// Fallback demo key (you should change/remove this later)
const HARD_CODED_MASTER_KEYS = [
  "@#ikukuW2024!", // change this!
];

// Combine env + hardcoded keys (ignore empties)
const ALLOWED_KEYS = [
  ...(ENV_MASTER_KEY ? [ENV_MASTER_KEY] : []),
  ...HARD_CODED_MASTER_KEYS,
].filter(Boolean);

/**
 * Returns true if this browser has an active admin session.
 */
export function hasAdminSession() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ADMIN_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Try to unlock admin using a key the user typed.
 * Returns { ok: boolean; message?: string }
 */
export function tryUnlockAdmin(key) {
  if (!key || typeof key !== "string") {
    return { ok: false, message: "Enter your admin key to continue." };
  }

  const trimmed = key.trim();

  if (ALLOWED_KEYS.includes(trimmed)) {
    try {
      window.localStorage.setItem(ADMIN_FLAG_KEY, "1");
      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "We couldn't save your admin session on this device.",
      };
    }
  }

  return {
    ok: false,
    message: "That key doesn't match. Check it and try again.",
  };
}

/**
 * Clear admin session for this browser.
 */
export function logoutAdmin() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ADMIN_FLAG_KEY);
  } catch {
    // ignore
  }
}

/**
 * Optional: store a short hint for yourself about which key is active.
 * (Not required for security, just convenience.)
 */
export function setAdminKeyHint(hint) {
  if (typeof window === "undefined") return;
  try {
    if (!hint) {
      window.localStorage.removeItem(ADMIN_KEY_HINT_KEY);
    } else {
      window.localStorage.setItem(ADMIN_KEY_HINT_KEY, hint);
    }
  } catch {
    // ignore
  }
}

export function getAdminKeyHint() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ADMIN_KEY_HINT_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Get current user's role profile
 * Returns { uid, isProvider, isAdmin, roles, displayName, email }
 */
export async function getCurrentUserRoleProfile() {
  if (!auth?.currentUser) {
    return {
      uid: null,
      isProvider: false,
      isAdmin: false,
      roles: [],
      displayName: null,
      email: null,
    };
  }

  const user = auth.currentUser;
  
  // Check custom claims first
  let isProvider = false;
  let isAdmin = false;
  let roles = [];
  
  try {
    const tokenResult = await user.getIdTokenResult();
    const claims = tokenResult.claims || {};
    
    isProvider = claims.provider === true || claims.role === "provider" || claims.role === "provider_admin";
    isAdmin = claims.admin === true || claims.role === "admin" || claims.role === "provider_admin";
    roles = claims.roles || [];
  } catch (err) {
    console.warn("Failed to get token claims:", err);
  }
  
  // If no custom claims, check Firestore
  if (!isProvider && !isAdmin && db) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || userData.roles?.[0];
        
        if (role === "provider" || role === "provider_admin") {
          isProvider = true;
        }
        if (role === "admin" || role === "provider_admin") {
          isAdmin = true;
        }
        
        roles = userData.roles || (role ? [role] : []);
      }
    } catch (err) {
      console.warn("Failed to check user role in Firestore:", err);
    }
  }
  
  return {
    uid: user.uid,
    isProvider,
    isAdmin,
    roles: Array.isArray(roles) ? roles : (roles ? [roles] : []),
    displayName: user.displayName || null,
    email: user.email || null,
  };
}
