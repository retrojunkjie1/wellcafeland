// src/config/firebaseConfig.js
// CENTRALIZED FIREBASE CONFIGURATION
// This is the SINGLE SOURCE OF TRUTH for Firebase configuration
// All Firebase initialization must import from this file ONLY

// Production project ID is HARDCODED to prevent wrong-project deployments
const PROJECT_ID = "wellnesscafelanding";

// Firebase configuration object
// projectId is hardcoded, other values come from environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
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

