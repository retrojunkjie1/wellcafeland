// src/services/adminAccess.js

const ADMIN_KEY_STORAGE = "wc-admin-access-key";
const ADMIN_KEY_ENV = import.meta.env.VITE_ADMIN_KEY || null;

/**
 * Get the master admin key (from env or storage)
 */
export function getAdminKey() {
  // First check environment variable (for build-time config)
  if (ADMIN_KEY_ENV) {
    return ADMIN_KEY_ENV;
  }
  
  // Then check localStorage
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

/**
 * Set the admin key in localStorage
 */
export function setAdminKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clear the admin key
 */
export function clearAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    return true;
  } catch {
    return false;
  }
}


/**
 * Check if current user has admin access
 */
export function getAdminStatus() {
  const key = getAdminKey();
  if (!key) return false;
  
  // Validate against master key
  const MASTER_ADMIN_KEY = import.meta.env.VITE_MASTER_ADMIN_KEY || "wc-admin-master-948234lkjsdf";
  
  return key === MASTER_ADMIN_KEY;
}

/**
 * Check admin status with role (for future use with Firestore)
 */
export async function getAdminRole() {
  // Option A: Check localStorage key
  if (getAdminStatus()) {
    return "master";
  }
  
  // Option B: Check Firestore (future implementation)
  // This would query Firestore for admin_users collection
  // For now, return null if not admin
  return null;
}

/**
 * Prompt user for admin key and validate
 */
export function promptAdminKey() {
  const key = window.prompt("Enter your Admin Access Key:");
  if (!key) return false;
  
  const MASTER_ADMIN_KEY = import.meta.env.VITE_MASTER_ADMIN_KEY || "wc-admin-master-948234lkjsdf";
  
  if (key.trim() === MASTER_ADMIN_KEY) {
    setAdminKey(key.trim());
    return true;
  }
  
  alert("Invalid admin key. Access denied.");
  return false;
}

/**
 * Generate a sub-key for team members (future feature)
 */
export function generateSubKey(role = "viewer") {
  // This would generate a time-limited or role-specific key
  // For now, just return a placeholder
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `wc-admin-${role}-${timestamp}-${random}`;
}

