// src/lib/apiHelpers.js

import { getAnonymousUserId } from "./userId";

/**
 * Wrapper around fetch that automatically includes anonymous userId
 * Use this instead of raw fetch for all API calls
 */
export async function apiFetch(url, options = {}) {
  const userId = getAnonymousUserId();
  
  const body = options.body 
    ? (typeof options.body === 'string' 
        ? JSON.stringify({ userId, ...JSON.parse(options.body) })
        : JSON.stringify({ userId, ...options.body }))
    : JSON.stringify({ userId });
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body,
  });
}

