// src/lib/apiHelpers.js

import { getAnonymousUserId } from "./userId";

/**
 * Wrapper around fetch that automatically includes anonymous userId
 * Use this instead of raw fetch for all API calls
 * Falls back to production Firebase Functions if emulator is unavailable
 */
export async function apiFetch(url, options = {}) {
  const userId = getAnonymousUserId();
  
  const body = options.body 
    ? (typeof options.body === 'string' 
        ? JSON.stringify({ userId, ...JSON.parse(options.body) })
        : JSON.stringify({ userId, ...options.body }))
    : JSON.stringify({ userId });
  
  // For /aiSession, try production URL if local proxy fails
  if (url === "/aiSession" && import.meta.env.DEV) {
    const productionUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL 
      ? `${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/aiSession`
      : `https://us-central1-wellnesscafelanding.cloudfunctions.net/aiSession`;
    
    try {
      // First try local proxy (emulator)
      const localRes = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body,
        signal: AbortSignal.timeout(3000), // 3 second timeout for emulator
      });
      
      if (localRes.ok) {
        return localRes;
      }
    } catch (err) {
      // Emulator not available, fallback to production
      console.log("[apiFetch] Emulator unavailable, using production:", productionUrl);
    }
    
    // Fallback to production
    return fetch(productionUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body,
    });
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body,
  });
}

