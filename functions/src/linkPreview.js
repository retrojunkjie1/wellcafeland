// functions/src/linkPreview.js
// Fetches URL metadata server-side (avoids CORS). 10-min in-memory cache.

const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const dns = require("node:dns/promises");
const net = require("node:net");
const http = require("node:http");
const https = require("node:https");
const { verifyHttpAppCheck } = require("./httpAppCheck");

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const blockedAddresses = new net.BlockList();
[
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
].forEach(([address, prefix]) => blockedAddresses.addSubnet(address, prefix, "ipv4"));
// Only globally routable IPv6 unicast is accepted; reserve/documentation and
// transition ranges are excluded explicitly.
blockedAddresses.addSubnet("2001:db8::", 32, "ipv6");
blockedAddresses.addSubnet("2001::", 23, "ipv6");
blockedAddresses.addSubnet("2002::", 16, "ipv6");

function isPublicAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return !blockedAddresses.check(address, "ipv4");
  return family === 6 && address.toLowerCase() !== "::" && address.toLowerCase() !== "::1"
    && blockedAddresses.check(address, "ipv6") === false
    && /^2[0-9a-f]{3}:/i.test(address);
}

async function resolvePublicTarget(rawUrl, lookup = dns.lookup) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error("INVALID_URL"); }
  if (!(["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password)) {
    throw new Error("INVALID_URL");
  }
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")
      || hostname.endsWith(".local") || hostname.endsWith(".internal")
      || hostname === "metadata.google.internal" || hostname === "metadata" ) {
    throw new Error("PRIVATE_HOST");
  }
  let addresses;
  if (net.isIP(hostname)) addresses = [{ address: hostname, family: net.isIP(hostname) }];
  else addresses = await lookup(hostname, { all: true, verbatim: true });
  if (!Array.isArray(addresses) || addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("PRIVATE_HOST");
  }
  const target = addresses[0];
  const pinnedLookup = (requestedHost, options, callback) => {
    const selected = addresses.find(({ family }) => !options?.family || family === options.family) || target;
    if (options?.all) return callback(null, addresses.map(({ address, family }) => ({ address, family })));
    return callback(null, selected.address, selected.family);
  };
  return { parsed, hostname, address: target.address, family: target.family, pinnedLookup };
}

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
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "GET") return res.status(405).json({ ok: false, error: "Method not allowed" });
    if (!await verifyHttpAppCheck(req, res)) return;
    const suppliedUrl = req.query?.url || req.query?.u || "";
    if (typeof suppliedUrl !== "string" || !suppliedUrl.trim()) {
      return res.status(400).json({ ok: false, error: "Missing url parameter" });
    }
    const url = suppliedUrl.trim();
    if (url.length > 2048) return res.status(400).json({ ok: false, error: "URL is too long" });
    let parsed;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return res.status(400).json({ ok: false, error: "Invalid URL scheme" });
      }
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid URL" });
    }

    let target;
    try {
      target = await resolvePublicTarget(url);
    } catch {
      return res.status(400).json({ ok: false, error: "Only public web addresses can be previewed." });
    }

    const cacheKey = url;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    try {
      const resp = await axios.get(url, {
        timeout: 8000,
        maxRedirects: 0,
        maxContentLength: 512 * 1024,
        maxBodyLength: 512 * 1024,
        httpAgent: new http.Agent({ lookup: target.pinnedLookup }),
        httpsAgent: new https.Agent({ lookup: target.pinnedLookup }),
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

exports.__test = { isPublicAddress, resolvePublicTarget };
