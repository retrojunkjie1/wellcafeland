// src/lib/apiHelpers.js

import { getAnonymousUserId } from "./userId"
import { resolveFunctionsBaseUrl } from "./functionsUrl"

/**
 * Wrapper around fetch that automatically includes anonymous userId.
 * For /aiSession, uses resolveFunctionsBaseUrl so emulator is hit when VITE_USE_EMULATORS=true.
 */
export async function apiFetch(url, options = {}) {
  const userId = getAnonymousUserId()
  const body = options.body
    ? (typeof options.body === "string"
        ? JSON.stringify({ userId, ...JSON.parse(options.body) })
        : JSON.stringify({ userId, ...options.body }))
    : JSON.stringify({ userId })

  if (url === "/aiSession" || url?.startsWith("/aiSession")) {
    const base = resolveFunctionsBaseUrl().replace(/\/+$/, "")
    const fullUrl = url.startsWith("/") ? `${base}${url}` : `${base}/${url}`
    return fetch(fullUrl, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body,
    })
  }

  return fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body,
  })
}

