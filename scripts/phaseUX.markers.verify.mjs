#!/usr/bin/env node
/**
 * phaseUX.markers.verify.mjs
 * UX marker verifier — fetches routes, confirms expected strings in page sources.
 * Auto-detects base URL from VITE_PORT (like phase53).
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");

const portStr = process.env.VITE_PORT || "5173";
const portsFromEnv = portStr.split(",").map((p) => p.trim()).filter(Boolean);
const defaultPorts = ["5173", "5174", "5175", "4173", "3000"];
const PORTS = [...new Set([...portsFromEnv, ...defaultPorts])];
const overrideBase = (process.env.PHASE53_BASE_URL || process.env.PHASEUX_BASE_URL || "").replace(/\/$/, "");

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

async function fetchHtml(url) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), 5000);
  try {
    const r = await fetch(url, { method: "GET", signal: ac.signal });
    const text = await r.text();
    clearTimeout(id);
    return { ok: r.ok, status: r.status, text };
  } catch (e) {
    clearTimeout(id);
    return { ok: false, status: "ERR", text: "", error: e?.message };
  }
}

async function resolveBase() {
  if (overrideBase) {
    const p = await fetchHtml(`${overrideBase}/`);
    if (p.ok && p.status === 200) return overrideBase;
    return overrideBase;
  }
  const lanIp = getLanIp();
  const hosts = ["127.0.0.1", "localhost"];
  if (lanIp) hosts.push(lanIp);
  for (const port of PORTS) {
    for (const host of hosts) {
      const base = `http://${host}:${port}`;
      const p = await fetchHtml(`${base}/`);
      if (p.ok && p.status === 200) return base;
    }
  }
  return null;
}

const ROUTE_MARKERS = {
  "/tools": {
    sources: [
      path.join(SRC, "apps/tools/ToolsPageCinematic.jsx"),
      path.join(SRC, "apps/tools/ToolsPage.jsx"),
      path.join(SRC, "apps/tools/toolsRegistry.js"),
      path.join(SRC, "apps/tools/VoiceCheckIn.jsx"),
      path.join(SRC, "navigation/navConfig.js"),
    ],
    markers: ["Tools", "Breathing", "Voice"],
  },
  "/profile": {
    sources: [path.join(SRC, "apps/profile/ProfilePage.jsx")],
    markers: ["Profile", "Settings"],
  },
  "/admin": {
    sources: [
      path.join(SRC, "apps/admin/AdminHubPage.jsx"),
      path.join(SRC, "admin/AdminShell.jsx"),
    ],
    markers: ["Admin", ["God Eye", "Overseer", "Admin Hub"]],
  },
};

function readSafe(p) {
  try { return fs.readFileSync(p, "utf8"); } catch { return ""; }
}

function checkMarkersInSources(cfg) {
  const combined = cfg.sources.map((p) => readSafe(p)).join("\n");
  const results = {};
  let ok = true;
  for (const m of cfg.markers) {
    if (Array.isArray(m)) {
      const found = m.some((s) => combined.includes(s));
      results[m.join("|")] = found;
      if (!found) ok = false;
    } else {
      const found = combined.includes(m);
      results[m] = found;
      if (!found) ok = false;
    }
  }
  return { ok, markers: results };
}

async function run() {
  const base = await resolveBase();
  const report = { chosenBase: base || "NONE", routes: {}, ok: true };

  for (const route of Object.keys(ROUTE_MARKERS)) {
    const url = base ? `${base}${route}` : null;
    const fetchRes = url ? await fetchHtml(url) : { ok: false, status: "NO_BASE", text: "" };
    const markerCheck = checkMarkersInSources(ROUTE_MARKERS[route]);
    report.routes[route] = {
      fetchOk: fetchRes.ok,
      status: fetchRes.status,
      markers: markerCheck.markers,
      markersOk: markerCheck.ok,
    };
    if (!fetchRes.ok || !markerCheck.ok) report.ok = false;
  }

  if (!base) {
    report.ok = false;
    report.message = "No Vite base found. Start dev server.";
  }

  console.log("PHASEUX_MARKERS_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  if (report.ok) {
    console.log("PASS");
    process.exit(0);
  } else {
    console.log("FAIL");
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
