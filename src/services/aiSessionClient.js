// src/services/aiSessionClient.js
// Single client for all /api/aiSession requests. Waits for auth before calling.

import { auth } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { buildApiUrl } from "@/services/apiBase";
import { getAnonymousUserId } from "@/lib/userId";

const waitForUser = () =>
  new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user || null);
    });
  });

/**
 * Ensure we have an ID token. Waits for auth; if no user, signs in anonymously then returns token.
 * @param {{ forceRefresh?: boolean }} [opts]
 * @returns {Promise<string|null>}
 */
async function ensureIdToken(opts = {}) {
  const { forceRefresh = false } = opts;
  let user = await waitForUser();
  if (!user) {
    try {
      await signInAnonymously(auth);
      user = await waitForUser();
    } catch (e) {
      if (import.meta.env.DEV) console.warn("[aiSessionClient] signInAnonymously failed:", e?.message);
      return null;
    }
  }
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[aiSessionClient] getIdToken failed:", e?.message);
    return null;
  }
}

/**
 * Get auth headers for /api/* requests. Use this for aiSession and globalResourceSearch.
 * @param {{ forceRefresh?: boolean }} [opts]
 * @returns {Promise<Record<string, string>>} { Authorization: "Bearer ..." } or {}
 */
export async function getAuthHeaders(opts = {}) {
  const token = await ensureIdToken(opts);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Try to get auth headers with a max wait (e.g. for guest anonymous sign-in). Use in chat to avoid dead-end "Please sign in".
 * @param {number} [maxMs=2000]
 * @returns {Promise<Record<string, string>>} { Authorization: "Bearer ..." } or {}
 */
export async function getAuthHeadersWithTimeout(maxMs = 2000) {
  const timeout = () => new Promise((_, reject) => setTimeout(() => reject(new Error("AUTH_TIMEOUT")), maxMs));
  try {
    const token = await Promise.race([ensureIdToken({}), timeout()]).catch(() => null);
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Call /api/aiSession with auth. Waits for user (anonymous sign-in if needed) before requesting.
 * Retries once on 401 with force-refreshed token.
 * @param {Object} payload - Request body (merged with userId for backward compat)
 * @param {{ signal?: AbortSignal }} [options] - Optional abort signal
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} AUTH_REQUIRED if no token after retry, or AI_SESSION_FAILED on HTTP error
 */
export const callAiSession = async (payload, options = {}) => {
  const body = { userId: getAnonymousUserId(), ...(payload || {}) };
  const url = buildApiUrl("/aiSession");

  let headers = await getAuthHeaders();
  if (import.meta.env.DEV && !headers.Authorization) {
    console.warn("[aiSessionClient] /api/aiSession called without Authorization", { url: url.slice(0, 60), hasPayload: !!payload });
  }

  const doFetch = async (authHeaders) => {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(body),
      signal: options.signal,
    });
    const data = await resp.json().catch(() => ({}));
    return { resp, data };
  };

  let { resp, data } = await doFetch(headers);

  if (resp.status === 401) {
    headers = await getAuthHeaders({ forceRefresh: true });
    const retry = await doFetch(headers);
    resp = retry.resp;
    data = retry.data;
  }

  if (!resp.ok) {
    const err = new Error(resp.status === 401 ? "Session reconnecting…" : (data?.error?.message || data?.message || "AI_SESSION_FAILED"));
    err.status = resp.status;
    err.code = resp.status === 401 ? "AUTH_REQUIRED" : "AI_SESSION_FAILED";
    err.data = data;
    throw err;
  }
  return data;
};
