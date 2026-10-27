// src/config/firebaseConfig.js
// CENTRALIZED FIREBASE CONFIGURATION
// This is the SINGLE SOURCE OF TRUTH for Firebase configuration
// All Firebase initialization must import from this file ONLY

// Production project ID is pinned to prevent wrong-project deployments. Tests
// use an isolated demo ID so accidental SDK requests can never target prod.
const PROJECT_ID = import.meta.env.MODE === "test" ? "demo-wellnesscafe-test" : "wellnesscafelanding";
const isTestMode = import.meta.env.MODE === "test";

// Firebase configuration object
// projectId is hardcoded, other values come from environment variables
export const firebaseConfig = {
  // Firebase Auth requires a non-empty key even when tests never contact the
  // service. Keep the fallback test-only and use a demo project so CI can
  // initialize SDK consumers without production credentials.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (isTestMode ? "wellnesscafe-test-key" : ""),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: PROJECT_ID, // Hardcoded to wellnesscafelanding
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Validate that required env vars are present (for development feedback)
if (import.meta.env.DEV) {
  const required = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];
  
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    console.warn(
      "[firebaseConfig] Missing environment variables:",
      missing.join(", ")
    );
  }
}
