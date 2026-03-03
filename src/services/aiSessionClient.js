// src/services/aiSessionClient.js
// Single client for all /api/aiSession requests. Waits for auth before calling.

import { auth } from "@/firebase";
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
 * Call /api/aiSession with auth. Waits for user before requesting.
 * @param {Object} payload - Request body (merged with userId for backward compat)
 * @param {{ signal?: AbortSignal }} [options] - Optional abort signal
 * @returns {Promise<Object>} Parsed JSON response
 * @throws {Error} AUTH_REQUIRED if no user, or AI_SESSION_FAILED on HTTP error
 */
export const callAiSession = async (payload, options = {}) => {
  const user = await waitForUser();
  if (!user) {
    const err = new Error("AUTH_REQUIRED");
    err.code = "AUTH_REQUIRED";
    throw err;
  }
  let idToken = await user.getIdToken();
  const body = { userId: getAnonymousUserId(), ...(payload || {}) };
  const url = buildApiUrl("/aiSession");

  const doFetch = async (token) => {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });
    const data = await resp.json().catch(() => ({}));
    return { resp, data };
  };

  let { resp, data } = await doFetch(idToken);

  if (resp.status === 401) {
    idToken = await user.getIdToken(true);
    const retry = await doFetch(idToken);
    resp = retry.resp;
    data = retry.data;
  }

  if (!resp.ok) {
    const err = new Error(resp.status === 401 ? "Session reconnecting…" : (data?.error || data?.message || "AI_SESSION_FAILED"));
    err.status = resp.status;
    err.code = resp.status === 401 ? "AUTH_REQUIRED" : "AI_SESSION_FAILED";
    err.data = data;
    throw err;
  }
  return data;
};
