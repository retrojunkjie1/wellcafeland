/**
 * Fetch link preview metadata via Cloud Function (emulator-safe).
 * Cache: in-memory per session + localStorage 1hr per url.
 */

import { resolveFunctionsBaseUrl } from "@/lib/functionsUrl";

const MEMORY_CACHE = new Map();
const LOCAL_CACHE_PREFIX = "wc_link_preview_";
const LOCAL_CACHE_TTL_MS = 60 * 60 * 1000;

function getLocalCached(url) {
  try {
    const key = LOCAL_CACHE_PREFIX + btoa(url).slice(0, 48);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > LOCAL_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setLocalCached(url, data) {
  try {
    const key = LOCAL_CACHE_PREFIX + btoa(url).slice(0, 48);
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export async function fetchLinkPreview(url) {
  if (!url || typeof url !== "string") return { ok: true, title: "", description: null, image: null, domain: "", url: "" };
  const trimmed = url.trim();
  const mem = MEMORY_CACHE.get(trimmed);
  if (mem) return mem;
  const local = getLocalCached(trimmed);
  if (local) {
    MEMORY_CACHE.set(trimmed, local);
    return local;
  }
  const base = resolveFunctionsBaseUrl().replace(/\/+$/, "");
  const endpoint = `${base}/linkPreview?url=${encodeURIComponent(trimmed)}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json().catch(() => ({ ok: true, title: "", description: null, image: null, domain: "", url: trimmed }));
    const out = { ...data, url: trimmed };
    MEMORY_CACHE.set(trimmed, out);
    setLocalCached(trimmed, out);
    return out;
  } catch {
    const domain = (() => {
      try {
        return new URL(trimmed).hostname.replace(/^www\./, "");
      } catch {
        return "link";
      }
    })();
    const fallback = { ok: true, title: domain, description: null, image: null, domain, url: trimmed };
    MEMORY_CACHE.set(trimmed, fallback);
    return fallback;
  }
}
