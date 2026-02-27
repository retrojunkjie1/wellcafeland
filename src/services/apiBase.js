/**
 * API Base URL - Single source for relative /api/* calls
 * Works from localhost and LAN IP (192.168.x.x) via Vite proxy in dev.
 * Production uses Firebase Hosting rewrites for /api/*.
 */

/**
 * Base path for API calls. Always relative so it works from any host.
 * @returns {string}
 */
export function getApiBaseUrl() {
  return "/api";
}

/**
 * Build full API URL for a path. No double slashes.
 * @param {string} path - Path like "/aiSession" or "aiSession"
 * @returns {string} e.g. "/api/aiSession"
 */
export function buildApiUrl(path) {
  const p = (path || "").trim().replace(/^\/+/, "");
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return p ? `${base}/${p}` : base;
}
