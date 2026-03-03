#!/usr/bin/env node
import fs from "fs";
import os from "os";
import { probeBase, fetchWithTimeout } from "./verify.http.mjs";

const portStr = process.env.VITE_PORT || "5173,5174,5175,4173,3000";
const PORTS = portStr.split(",").map((p) => p.trim()).filter(Boolean);

const overrideBase = (process.env.PHASE53_BASE_URL || process.env.PHASE53C_BASE_URL || "").replace(/\/$/, "");

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
      return { chosenBase: base, baseProbes };
    }
  }
  return { chosenBase: "NONE", baseProbes };
}

const ROUTES = ["/", "/chat", "/tools", "/profile", "/admin"];
const FILES = [
  "src/apps/admin/AdminHubPage.jsx",
  "src/components/system/PageHeader.jsx",
  "src/components/system/BackButton.jsx",
  "src/components/system/NotReadyCard.jsx",
];

function print(report) {
  console.log("PHASE53C_VERIFY");
  console.log(JSON.stringify(report, null, 2));
}

function fail(report) {
  print(report);
  console.error("FAIL");
  process.exit(1);
}

async function run() {
  const { chosenBase, baseProbes } = await resolveBase();

  if (chosenBase === "NONE") {
    console.error("Vite not reachable. Start dev server.");
    return fail({
      chosenBase: "NONE",
      baseProbes,
      message: "Vite not reachable. Start dev server.",
    });
  }

  const routeResults = {};
  for (const path of ROUTES) {
    const res = await fetchWithTimeout(`${chosenBase}${path}`, { timeoutMs: 4000 });
    routeResults[path] = res.ok && res.status === 200 ? { status: 200 } : { status: res.status || "ERR" };
  }

  const fileExists = {};
  for (const f of FILES) {
    fileExists[f] = fs.existsSync(f);
  }

  const report = {
    chosenBase,
    baseProbes,
    routes: routeResults,
    files: fileExists,
  };

  const allRoutesOk = ROUTES.every((r) => routeResults[r]?.status === 200);
  const allFilesExist = FILES.every((f) => fileExists[f]);
  const admin404 = routeResults["/admin"]?.status === 404;

  if (admin404) {
    report.message = "Phase 53C requires /admin hub wired. Got 404.";
    return fail(report);
  }
  if (!allRoutesOk || !allFilesExist) {
    return fail(report);
  }

  print(report);
  console.log("PASS");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
