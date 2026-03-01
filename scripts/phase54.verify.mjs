#!/usr/bin/env node
/**
 * Phase 54A Verifier — Stabilization Entry Surface
 * Checks: base ok, routes / /chat /tools /home return 200, index.html markers
 */

import fs from "fs";
import path from "path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withTimeout = (ms, fn) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    return fn(ac.signal);
  } finally {
    clearTimeout(t);
  }
};

const fetchGet = async (url, ms = 4000) => {
  try {
    const res = await withTimeout(ms, (signal) =>
      fetch(url, { method: "GET", signal, headers: { accept: "text/html,*/*" } })
    );
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: { name: e?.name || "Error", message: e?.message || String(e) } };
  }
};

const parsePorts = () => {
  const raw = process.env.VITE_PORT || "5173,5174,5175,4173,3000";
  return raw.split(",").map((s) => String(s).trim()).filter(Boolean);
};

const probeBase = async (base) => {
  const root = await fetchGet(`${base}/`, 2500);
  const client = await fetchGet(`${base}/@vite/client`, 2500);
  return {
    ok: root.ok && root.status === 200 && client.ok && client.status === 200,
    root: { status: root.status || "ERR" },
    client: { status: client.status || "ERR" },
  };
};

const resolveBase = async () => {
  const forced = process.env.PHASE54_BASE_URL || process.env.PHASE53_BASE_URL;
  if (forced) {
    const p = await probeBase(forced);
    return {
      chosenBase: forced,
      baseProbes: {
        [forced]: {
          ok: p.ok,
          root: { status: p.root.status || "ERR" },
          client: { status: p.client.status || "ERR" },
        },
      },
    };
  }
  const ports = parsePorts();
  const baseProbes = {};
  for (const port of ports) {
    const base = `http://127.0.0.1:${port}`;
    const p = await probeBase(base);
    baseProbes[base] = {
      ok: p.ok,
      root: { status: p.root.status || "ERR" },
      client: { status: p.client.status || "ERR" },
    };
    if (p.ok) {
      return { chosenBase: base, baseProbes, ports };
    }
    await sleep(120);
  }
  return { chosenBase: null, baseProbes, ports };
};

const getText = async (url) => {
  try {
    const res = await withTimeout(4000, (signal) =>
      fetch(url, { method: "GET", signal, headers: { accept: "text/html,*/*" } })
    );
    const text = await res.text();
    return { ok: true, status: res.status, text };
  } catch (e) {
    return { ok: false, status: "ERR", text: "" };
  }
};

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
  const { chosenBase, baseProbes } = await resolveBase();

  if (!chosenBase || !baseProbes[chosenBase]?.ok) {
    return fail({
      chosenBase: chosenBase || "NONE",
      baseProbes,
      message: "No Vite base found.",
    });
  }

  const indexPath = path.resolve(process.cwd(), "index.html");
  const indexContent = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, "utf8") : "";
  const markersOk = MARKERS.every((m) => indexContent.includes(m));

  const routeResults = {};
  for (const route of ROUTES) {
    const res = await getText(`${chosenBase}${route}`);
    routeResults[route] = res.ok && res.status === 200 ? { status: 200 } : { status: res.status || "ERR" };
  }

  const report = {
    chosenBase,
    baseProbes,
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
