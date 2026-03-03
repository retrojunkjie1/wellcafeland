#!/usr/bin/env node
import fs from "fs";
import os from "os";
import { probeBase, fetchWithTimeout } from "./verify.http.mjs";

const portStr = process.env.VITE_PORT || "5173";
const portsFromEnv = portStr.split(",").map((p) => p.trim()).filter(Boolean);
const defaultPorts = ["5173", "5174", "5175", "4173", "3000"];
const PORTS = [...new Set([...portsFromEnv, ...defaultPorts])];

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "wellnesscafelanding";
const REGION = process.env.FUNCTIONS_REGION || "us-central1";

const overrideBase = (process.env.PHASE53_BASE_URL || "").replace(/\/$/, "");
const authToken = process.env.PHASE53_AUTH_TOKEN || "";

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function postJson(url, body) {
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    timeoutMs: 6000,
  });
  if (res.ok) return { status: res.status };
  return { status: res.status, error: res.error };
}

async function postJsonRetry(url, body, attempts = 3) {
  let last = null;
  for (let i = 0; i < attempts; i++) {
    const res = await postJson(url, body);
    if (res.status !== "ERR" && res.status !== "TIMEOUT") {
      return res;
    }
    last = res;
    await sleep(250 * (i + 1));
  }
  return last || { status: "ERR" };
}

async function waitForProxy(base) {
  const deadline = Date.now() + 12000;
  const payload = { q: "test", limit: 1 };
  while (Date.now() < deadline) {
    const res = await postJsonRetry(`${base}/api/globalResourceSearch`, payload, 1);
    if (res && res.status !== "ERR" && res.status !== "TIMEOUT") {
      return { ready: true, status: res.status };
    }
    await sleep(300);
  }
  return { ready: false, reason: "API_TIMEOUT" };
}

async function resolveBase() {
  const candidates = [];
  if (overrideBase) {
    candidates.push(overrideBase);
  } else {
    const lanIp = getLanIp();
    const hosts = ["127.0.0.1", "localhost"];
    if (lanIp) hosts.push(lanIp);
    for (const port of PORTS) {
      for (const host of hosts) {
        candidates.push(`http://${host}:${port}`);
      }
    }
  }

  const baseProbes = {};
  for (const base of candidates) {
    const p = await probeBase(base);
    baseProbes[base] = {
      ok: p.ok,
      root: { status: p.status },
      client: { ok: p.clientOk, status: p.clientStatus },
    };
    if (p.ok) {
      return { chosen: base, baseProbes };
    }
  }
  return { chosen: "NONE", baseProbes };
}

function print(report) {
  console.log("PHASE53_VERIFY");
  console.log(JSON.stringify(report, null, 2));
}

function fail(report) {
  print(report);
  console.error("FAIL");
  process.exit(1);
}

async function run() {
  const { chosen, baseProbes } = await resolveBase();

  if (chosen === "NONE") {
    return fail({
      chosenBase: chosen,
      baseProbes,
      readiness: { ready: false, reason: "VITE_DOWN" },
      message: "Vite not reachable. Start dev server.",
    });
  }

  const readiness = await waitForProxy(chosen);
  if (!readiness.ready) {
    return fail({
      chosenBase: chosen,
      baseProbes,
      readiness,
      message: "Proxy not ready (timeouts). Ensure Vite + emulators are running.",
    });
  }

  const aiSessionPayload = { mode: "telemetry", event: {} };
  const globalSearchPayload = { query: "test", domain: "", limit: 1 };

  const ai = await postJsonRetry(`${chosen}/api/aiSession`, aiSessionPayload, 3);
  const search = await postJsonRetry(`${chosen}/api/globalResourceSearch`, globalSearchPayload, 3);

  const report = {
    chosenBase: chosen,
    baseProbes,
    readiness,
    projectId: PROJECT_ID,
    region: REGION,
    ports: PORTS,
    breathingExists: fs.existsSync("src/features/breathing/LuxuryBreathing.jsx"),
    proxy: {
      aiSession: ai,
      globalResourceSearch: search,
    },
  };

  const hardBad = (x) => x.status === 404 || x.status === "ERR" || x.status === "TIMEOUT";
  const bothProxyDown = hardBad(report.proxy.aiSession) && hardBad(report.proxy.globalResourceSearch);
  if (bothProxyDown) {
    report.readiness = { ready: false, reason: "API_TIMEOUT" };
    return fail(report);
  }

  const okStatus = (s) => s === 200 || s === 401;
  const ok =
    report.breathingExists === true &&
    okStatus(report.proxy.aiSession.status) &&
    okStatus(report.proxy.globalResourceSearch.status);

  if (!ok) {
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
