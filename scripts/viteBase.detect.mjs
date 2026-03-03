#!/usr/bin/env node
/**
 * scripts/viteBase.detect.mjs
 * Auto-detect live Vite dev server base URL across common ports.
 * Prints VITE_BASE=<url> or VITE_BASE=NONE. Exit 0 if found, 2 if not.
 */

const portStr = process.env.VITE_PORT || "5173,5174,5175,4173,3000";
const PORTS = portStr.split(",").map((p) => p.trim()).filter(Boolean);

const lanIp = process.env.LAN_IP || "";

const hosts = ["127.0.0.1", "localhost"];
if (lanIp) hosts.push(lanIp);

const candidates = [];
for (const port of PORTS) {
  for (const host of hosts) {
    candidates.push(`http://${host}:${port}`);
  }
}

function withTimeout(ms) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(id) };
}

async function check(url) {
  const t = withTimeout(1000);
  try {
    const r = await fetch(url + "/", { method: "GET", signal: t.signal });
    const text = await r.text();
    t.done();
    if (r.status !== 200) return false;
    if (text.includes("<!DOCTYPE html") || text.includes("<!doctype html") || text.includes("/@vite/client")) {
      return true;
    }
    return false;
  } catch {
    t.done();
    return false;
  }
}

async function run() {
  for (const base of candidates) {
    const ok = await check(base);
    if (ok) {
      console.log(`VITE_BASE=${base}`);
      process.exit(0);
    }
  }
  console.log("VITE_BASE=NONE");
  process.exit(2);
}

run();
