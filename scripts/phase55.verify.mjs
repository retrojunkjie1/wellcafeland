#!/usr/bin/env node
/**
 * scripts/phase55.verify.mjs
 * Phase 55: Emulator spine — hub ok, functions port open, /api endpoints return not-500.
 */

import { createConnection } from "node:net";

const PORTS = { hub: 4400, functions: 5001 };
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

async function httpStatus(url, method, body) {
  try {
    const opts = { method, headers: body !== undefined ? { "Content-Type": "application/json" } : {} };
    if (body !== undefined) opts.body = typeof body === "string" ? body : JSON.stringify(body);
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(6000) });
    return r.status;
  } catch {
    return "ERR";
  }
}

async function run() {
  const report = { PHASE55_VERIFY: true, hub: null, functions: null, api: {}, status: "PASS" };

  report.hub = { port: PORTS.hub, open: await tcpOpen("127.0.0.1", PORTS.hub) };
  report.functions = { port: PORTS.functions, open: await tcpOpen("127.0.0.1", PORTS.functions) };

  const aiStatus = await httpStatus(`${BASE}/api/aiSession`, "POST", { mode: "telemetry", event: {} });
  const searchStatus = await httpStatus(`${BASE}/api/globalResourceSearch`, "POST", { query: "test", limit: 1 });
  report.api = { aiSession: aiStatus, globalResourceSearch: searchStatus };

  const not500 = (s) => s !== 500 && s !== "ERR";
  if (!report.hub.open || !report.functions.open) report.status = "FAIL";
  if (!not500(aiStatus) || !not500(searchStatus)) report.status = "FAIL";

  console.log("PHASE55_VERIFY");
  console.log(JSON.stringify(report, null, 2));
  console.log(report.status);
  process.exit(report.status === "PASS" ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
