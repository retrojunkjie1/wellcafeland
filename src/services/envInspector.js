// src/services/envInspector.js
// Central environment and configuration inspector
// Safe defaults - never crashes if env vars are missing

import { auth, db } from "@/firebase";

/**
 * Get environment summary
 * Returns safe defaults if any env var is missing
 */
export function getEnvSummary() {
  const buildMode = import.meta.env.MODE || "development";
  const isDev = buildMode === "development";
  const isProd = buildMode === "production";

  // Check Firebase
  const hasFirebase = !!auth;
  const hasFirestore = !!db;

  // Check API endpoints
  const functionsUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  const hasFunctionsURL = !!functionsUrl;

  // Check OpenAI
  const hasOpenAIAccess = import.meta.env.VITE_OPENAI_HAS_AUDIO === "true" || 
                         import.meta.env.VITE_OPENAI_API_KEY !== undefined;

  // Check RapidAPI
  const rapidApiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  const rapidApiHost = import.meta.env.VITE_RAPIDAPI_HOST;
  const hasRapidAPI = !!(rapidApiKey && rapidApiHost);

  // Check features
  const hasVoice = hasOpenAIAccess || typeof window !== "undefined" && 
                   (window.speechSynthesis || window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasVideo = true; // Video uses fallback URLs, always available
  const hasDirectorySearch = hasRapidAPI || hasFunctionsURL; // Can work with either
  const hasProviderMode = true; // Provider mode is frontend-only, doesn't require backend

  // Version info
  const frontendBuildId = import.meta.env.VITE_BUILD_ID || 
                          import.meta.env.VITE_APP_VERSION || 
                          (isDev ? "dev" : "unknown");
  const deployedAt = import.meta.env.VITE_DEPLOYED_AT || null;

  return {
    buildMode: isProd ? "production" : "development",
    api: {
      hasFirebase,
      hasFirestore,
      hasFunctionsURL,
      hasOpenAIAccess,
      hasRapidAPI,
    },
    features: {
      hasVoice,
      hasVideo,
      hasDirectorySearch,
      hasProviderMode,
    },
    version: {
      frontendBuildId,
      deployedAt,
    },
  };
}

/**
 * Check if environment is production-like
 */
export function isProdLike() {
  const mode = import.meta.env.MODE || "development";
  return mode === "production" || 
         import.meta.env.PROD === true ||
         window.location.hostname !== "localhost" && 
         !window.location.hostname.includes("127.0.0.1");
}

/**
 * Check if environment is development-like
 */
export function isDevLike() {
  const mode = import.meta.env.MODE || "development";
  return mode === "development" || 
         import.meta.env.DEV === true ||
         window.location.hostname === "localhost" || 
         window.location.hostname.includes("127.0.0.1");
}

/**
 * Get a human-readable status summary
 */
export function getStatusSummary() {
  const summary = getEnvSummary();
  const issues = [];
  const warnings = [];

  if (!summary.api.hasFirebase) {
    issues.push("Firebase not configured");
  }
  if (!summary.api.hasFirestore) {
    warnings.push("Firestore not available");
  }
  if (!summary.api.hasFunctionsURL) {
    warnings.push("Firebase Functions URL not set");
  }
  if (!summary.api.hasRapidAPI) {
    warnings.push("RapidAPI not configured");
  }
  if (!summary.api.hasOpenAIAccess) {
    warnings.push("OpenAI access not available");
  }

  return {
    summary,
    healthy: issues.length === 0,
    issues,
    warnings,
  };
}

export default {
  getEnvSummary,
  isProdLike,
  isDevLike,
  getStatusSummary,
};

