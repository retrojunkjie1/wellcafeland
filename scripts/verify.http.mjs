#!/usr/bin/env node
/**
 * verify.http.mjs — HTTP probing helpers for phase53 verifiers.
 * Exports: fetchWithTimeout, probeBase
 */

/**
 * @param {string} url
 * @param {{method?: string, headers?: Record<string,string>, body?: string, timeoutMs?: number}} opts
 * @returns {Promise<{ok: boolean, status: number|string, text?: string, error?: object}>}
 */
export async function fetchWithTimeout(url, opts = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 4500,
  } = opts;

  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const reqHeaders = { ...headers };
    if (body) reqHeaders["Content-Type"] = reqHeaders["Content-Type"] || "application/json";
    const r = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
      signal: ac.signal,
    });
    const text = await r.text();
    clearTimeout(id);
    return { ok: true, status: r.status, text };
  } catch (e) {
    clearTimeout(id);
    const isAbort = e?.name === "AbortError";
    return {
      ok: false,
      status: isAbort ? "TIMEOUT" : "ERR",
      error: { name: e?.name || "Error", message: e?.message || String(e) },
    };
  }
}

/**
 * Probe Vite base: GET / and GET /@vite/client.
 * Base ok if root is 200 (client optional but preferred).
 *
 * @param {string} base - e.g. http://127.0.0.1:5173
 * @returns {Promise<{ok: boolean, status: number|string, clientOk: boolean, clientStatus: number|string}>}
 */
export async function probeBase(base) {
  const rootRes = await fetchWithTimeout(`${base}/`, { timeoutMs: 2500 });
  const clientRes = await fetchWithTimeout(`${base}/@vite/client`, { timeoutMs: 2500 });

  const rootOk = rootRes.ok && rootRes.status === 200;
  const clientOk = clientRes.ok && clientRes.status === 200;

  return {
    ok: rootOk,
    status: rootRes.status,
    clientOk,
    clientStatus: clientRes.status,
  };
}
