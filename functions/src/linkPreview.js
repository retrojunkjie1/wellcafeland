// functions/src/linkPreview.js
// Fetches URL metadata server-side (avoids CORS). 10-min in-memory cache.

const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function parseMeta(html, url) {
  const domain = extractDomain(url);
  const fallback = { ok: true, title: domain, description: null, image: null, domain, url };
  if (!html || typeof html !== "string") return fallback;
  const getOg = (name) => {
    const re = new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, "i");
    const m = html.match(re);
    if (m) return m[1];
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, "i");
    const m2 = html.match(re2);
    return m2 ? m2[1] : null;
  };
  const title = getOg("title") || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || domain;
  const description = getOg("description");
  const image = getOg("image");
  return { ok: true, title, description, image, domain, url };
}

exports.linkPreview = onRequest(
  { region: "us-central1", cors: true },
  async (req, res) => {
    const url = (req.query?.url || req.query?.u || "").trim();
    if (!url) {
      return res.status(400).json({ ok: false, error: "Missing url parameter" });
    }
    let parsed;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return res.status(400).json({ ok: false, error: "Invalid URL scheme" });
      }
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid URL" });
    }

    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    try {
      const resp = await axios.get(url, {
        timeout: 8000,
        maxRedirects: 3,
        headers: { "User-Agent": "WellnessCafe-OS/1.0 (link-preview)" },
        validateStatus: () => true,
      });
      const data = resp.status === 200
        ? parseMeta(resp.data, url)
        : { ok: true, title: extractDomain(url), description: null, image: null, domain: extractDomain(url), url };
      cache.set(cacheKey, { ts: Date.now(), data });
      return res.json(data);
    } catch (err) {
      const data = {
        ok: true,
        title: extractDomain(url),
        description: null,
        image: null,
        domain: extractDomain(url),
        url,
      };
      cache.set(cacheKey, { ts: Date.now(), data });
      return res.json(data);
    }
  }
);
