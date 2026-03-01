#!/usr/bin/env node
/**
 * Phase 54A Verifier — Stabilization Entry Surface
 * Checks: base ok, routes / /chat /tools /home return 200, HTML has data-wc-app and data-wc-entry
 */

import fs from "fs";
import os from "os";
import path from "path";

const portStr = process.env.VITE_PORT || "5173";
const portsFromEnv = portStr.split(",").map((p) => p.trim()).filter(Boolean);
const defaultPorts = ["5173", "5174", "5175", "4173", "3000"];
const PORTS = [...new Set([...portsFromEnv, ...defaultPorts])];

const overrideBase = (process.env.PHASE53_BASE_URL || process.env.PHASE54_BASE_URL || "").replace(/\/$/, "");

const getLanIp = () => {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const net of ifaces[name] || []) {
      if (net && net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "";
};

const withTimeout = (signalMs) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), signalMs);
  return { signal: controller.signal, done: () => clearTimeout(id) };
};

async function getText(url) {
  const t = withTimeout(4000);
  try {
    const r = await fetch(url, { method: "GET", signal: t.signal });
    const text = await r.text();
    t.done();
    return { ok: true, status: r.status, text };
  } catch (e) {
    t.done();
    return { ok: false, status: "ERR", error: { name: e?.name, message: e?.message } };
  }
}

async function looksLikeVite(base) {
  const root = await getText(`${base}/`);
  if (!root.ok || root.status !== 200) {
    return { ok: false, root };
  }
  const hasClient = root.text.includes("/@vite/client");
  if (!hasClient) {
    return { ok: false, root };
  }
  return { ok: true, root: { status: root.status, text: root.text } };
}

async function resolveBase() {
  if (overrideBase) {
    const viteProbe = await looksLikeVite(overrideBase);
    return { chosen: overrideBase, probes: { [overrideBase]: viteProbe } };
  }
  const lanIp = getLanIp();
  const hosts = ["127.0.0.1", "localhost"];
  if (lanIp) hosts.push(lanIp);
  const candidates = [];
  for (const port of PORTS) {
    for (const host of hosts) {
      candidates.push(`http://${host}:${port}`);
    }
  }
  const probes = {};
  for (const base of candidates) {
    probes[base] = await looksLikeVite(base);
    if (probes[base].ok) {
      return { chosen: base, probes };
    }
  }
  return { chosen: candidates[0] || "http://127.0.0.1:5173", probes };
}

const ROUTES = ["/", "/chat", "/tools", "/home"];
const MARKERS = ['data-wc-app="1"', 'data-wc-entry="1"'];

function print(report) {
  console.log("PHASE54_VERIFY");
  console.log(JSON.stringify(report, null, 2));
}

function fail(report) {
  print(report);
  console.error("FAIL");
  process.exit(1);
}

async function run() {
  const { chosen, probes } = await resolveBase();

  if (!probes[chosen]?.ok) {
    return fail({
      chosenBase: chosen,
      baseProbes: probes,
      message: "No Vite base found.",
    });
  }

  const rootRes = await getText(`${chosen}/`);
  const html = rootRes.ok ? rootRes.text || "" : "";
  const indexPath = path.resolve(process.cwd(), "index.html");
  const indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
  const markersOk = MARKERS.every((m) => indexContent.includes(m) || html.includes(m));

  const routeResults = {};
  for (const path of ROUTES) {
    const res = await getText(`${chosen}${path}`);
    routeResults[path] = res.ok && res.status === 200 ? { status: 200 } : { status: res.status || "ERR" };
  }

  const report = {
    chosenBase: chosen,
    baseProbes: probes,
    markersOk,
    routes: routeResults,
  };

  const allRoutesOk = ROUTES.every((r) => routeResults[r]?.status === 200);
  if (!allRoutesOk || !markersOk) {
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
