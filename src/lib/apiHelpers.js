// src/lib/apiHelpers.js

import { getAnonymousUserId } from "./userId";
import { buildApiUrl } from "@/services/apiBase";

let apiAuthProvider = null;

/**
 * Set auth header provider (e.g. from aiSessionClient.getAuthHeaders). Call once at bootstrap.
 * @param {() => Promise<Record<string, string>>} fn
 */
export function setApiAuthProvider(fn) {
  apiAuthProvider = fn;
}

/**
 * Wrapper around fetch that automatically includes anonymous userId and optional auth.
 * Uses relative /api/* URLs so Vite proxy (dev) and Firebase Hosting rewrites (prod) work.
 */
export async function apiFetch(url, options = {}) {
  const userId = getAnonymousUserId();
  const body = options.body
    ? (typeof options.body === "string"
        ? JSON.stringify({ userId, ...JSON.parse(options.body) })
        : JSON.stringify({ userId, ...options.body }))
    : JSON.stringify({ userId });

  const baseHeaders = { "Content-Type": "application/json", ...options.headers };
  const authHeaders = apiAuthProvider ? await apiAuthProvider() : {};
  const headers = { ...baseHeaders, ...authHeaders };

  if (url === "/globalResourceSearch" || url?.startsWith("/globalResourceSearch")) {
    const fullUrl = buildApiUrl("/globalResourceSearch");
    return fetch(fullUrl, { ...options, headers, body });
  }

  return fetch(url, { ...options, headers, body });
}

