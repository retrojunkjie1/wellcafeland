/**
 * Single source of truth for Firebase Functions base URL.
 * DEV: Uses window.location.hostname so phone on LAN can reach emulator at http://<LAN_IP>:5001/...
 * VITE_FIREBASE_FUNCTIONS_URL overrides when set.
 */

export function resolveFunctionsBaseUrl() {
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
