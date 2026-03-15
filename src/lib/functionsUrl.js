/**
 * Single source of truth for Firebase Functions base URL.
 * When VITE_USE_EMULATORS=true, always use emulator (localhost:5001).
 * Otherwise VITE_FIREBASE_FUNCTIONS_URL overrides when set.
 * DEV without emulators: uses hostname so phone on LAN can reach.
 */
export function resolveFunctionsBaseUrl() {
  if (import.meta.env.VITE_USE_EMULATORS === "true") {
    return "http://127.0.0.1:5001/wellnesscafelanding/us-central1";
  }
  const env = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;
  if (env && typeof env === "string" && env.trim()) {
    return env.trim();
  }
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const host = window.location.hostname;
    return `http://${host}:5001/wellnesscafelanding/us-central1`;
  }
  return "https://us-central1-wellnesscafelanding.cloudfunctions.net";
}
