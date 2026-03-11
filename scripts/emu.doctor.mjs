#!/usr/bin/env node
/**
 * scripts/emu.doctor.mjs
 * Emulator doctor: port conflicts, hub/auth/firestore/functions ports, Vite + proxy readiness.
 */

import { createConnection } from "node:net";
import { execSync } from "node:child_process";

const PORTS = { hub: 4400, functions: 5001, firestore: 8081, auth: 9099, ui: 4000 };
const VITE_PORT = parseInt(process.env.VITE_PORT || "5173", 10);
const BASE = `http://127.0.0.1:${VITE_PORT}`;

function tcpOpen(host, port) {
  return new Promise((resolve) => {
    const s = createConnection({ host, port }, () => {
      s.destroy();
      resolve(true);
    });
    s.on("error", () => resolve(false));
    s.setTimeout(800, () => {
      s.destroy();
      resolve(false);
    });
  });
}

function lsof(port) {
  try {
    const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN 2>/dev/null || true`, { encoding: "utf8" });
    const lines = out.trim().split("\n").filter(Boolean);
    const pids = lines.slice(1).map((l) => l.split(/\s+/)[1]).filter(Boolean);
    return { listening: lines.length > 0, pids: [...new Set(pids)] };
  } catch {
    return { listening: false, pids: [] };
  }
}

async function httpCode(url, method = "GET", body = undefined) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  try {
    const c = await fetch(url, { ...opts, signal: AbortSignal.timeout(6000) });
    return c.status;
  } catch {
    return "ERR";
  }
}

async function run() {
  const report = { ports: {}, vite: null, proxy: {}, conflicts: {}, status: "PASS" };

  for (const [name, port] of Object.entries(PORTS)) {
    const open = await tcpOpen("127.0.0.1", port);
    const listen = lsof(port);
    report.ports[name] = { port, open, ...listen };
    if (!open && listen.pids.length > 0) report.conflicts[name] = listen.pids;
  }

  const viteRoot = await httpCode(`${BASE}/`);
  report.vite = { base: BASE, rootStatus: viteRoot };
  if (viteRoot !== 200 && viteRoot !== "ERR") report.status = "FAIL";

  const aiSessionStatus = await httpCode(`${BASE}/api/aiSession`, "POST", { mode: "telemetry", event: {} });
  const searchStatus = await httpCode(`${BASE}/api/globalResourceSearch`, "POST", { query: "test", limit: 1 });
  report.proxy = { aiSession: aiSessionStatus, globalResourceSearch: searchStatus };

  const okProxy = (s) => s === 200 || s === 401 || s === 400;
  if (!okProxy(aiSessionStatus) || !okProxy(searchStatus)) report.status = "FAIL";

  const hubOk = report.ports.hub?.open === true;
  const functionsOk = report.ports.functions?.open === true;
  if (!hubOk || !functionsOk) report.status = "FAIL";

  report.summary = {
    hubOk,
    functionsOk,
    proxyOk: okProxy(aiSessionStatus) && okProxy(searchStatus),
    viteOk: viteRoot === 200,
  };

  console.log("EMU_DOCTOR");
  console.log(JSON.stringify(report, null, 2));
  console.log(report.status);
  process.exit(report.status === "PASS" ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
