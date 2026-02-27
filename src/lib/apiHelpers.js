// src/lib/apiHelpers.js

import { getAnonymousUserId } from "./userId";
import { buildApiUrl } from "@/services/apiBase";

/**
 * Wrapper around fetch that automatically includes anonymous userId.
 * Uses relative /api/* URLs so Vite proxy (dev) and Firebase Hosting rewrites (prod) work.
 */
export async function apiFetch(url, options = {}) {
  const userId = getAnonymousUserId();
  const body = options.body
    ? (typeof options.body === "string"
        ? JSON.stringify({ userId, ...JSON.parse(options.body) })
        : JSON.stringify({ userId, ...options.body }))
    : JSON.stringify({ userId });

  if (url === "/globalResourceSearch" || url?.startsWith("/globalResourceSearch")) {
    const fullUrl = buildApiUrl("/globalResourceSearch");
    return fetch(fullUrl, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body,
    });
  }

  return fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    body,
  });
}

