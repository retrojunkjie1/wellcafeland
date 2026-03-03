#!/usr/bin/env node
/**
 * scripts/phaseUX.verify.mjs
 * Phase UX verifier — enforces UX spine rules (OSLayout, OSPageChrome, AppDock, VoiceCheckIn).
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const REQUIRED = [
  join(SRC, "layouts", "OSLayout.jsx"),
  join(SRC, "components", "nav", "OSPageChrome.jsx"),
  join(SRC, "apps", "tools", "VoiceCheckIn.jsx"),
];

const missing = [];
for (const p of REQUIRED) {
  if (!existsSync(p)) missing.push(p);
}

const failed = [];
const details = {};

function readSafe(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

const osLayoutPath = join(SRC, "layouts", "OSLayout.jsx");
const osPageChromePath = join(SRC, "components", "nav", "OSPageChrome.jsx");
const voiceCheckInPath = join(SRC, "apps", "tools", "VoiceCheckIn.jsx");

// A) OSLayout contains "--wc-topbar-h"
if (!missing.includes(osLayoutPath)) {
  const c = readSafe(osLayoutPath);
  const hasTopbarVar = c.includes("--wc-topbar-h");
  details.osLayoutTopbarVar = { ok: hasTopbarVar, file: osLayoutPath, needle: "--wc-topbar-h" };
  if (!hasTopbarVar) failed.push("osLayoutTopbarVar");
}

// B) OSPageChrome contains "top-[var(--wc-topbar-h"
if (!missing.includes(osPageChromePath)) {
  const c = readSafe(osPageChromePath);
  const hasTopbarClass = c.includes("top-[var(--wc-topbar-h");
  details.osPageChromeTopbar = { ok: hasTopbarClass, file: osPageChromePath, needle: "top-[var(--wc-topbar-h" };
  if (!hasTopbarClass) failed.push("osPageChromeTopbar");
}

// C) OSLayout renders AppDock
if (!missing.includes(osLayoutPath)) {
  const c = readSafe(osLayoutPath);
  const hasJsx = c.includes("<AppDock");
  const hasImport = c.includes("import") && c.includes("AppDock");
  const hasUsage = c.includes("AppDock");
  const ok = hasJsx || (hasImport && hasUsage);
  details.osLayoutAppDock = { ok, file: osLayoutPath, hasJsx, hasImportAndUsage: hasImport && hasUsage };
  if (!ok) failed.push("osLayoutAppDock");
}

// D) VoiceCheckIn must NOT contain "alert("
if (!missing.includes(voiceCheckInPath)) {
  const c = readSafe(voiceCheckInPath);
  const hasNoAlert = !c.includes("alert(");
  details.voiceCheckInNoAlert = { ok: hasNoAlert, file: voiceCheckInPath, needle: "alert(", mustBeAbsent: true };
  if (!hasNoAlert) failed.push("voiceCheckInNoAlert");
}

const ok = missing.length === 0 && failed.length === 0;

const report = {
  ok,
  missing,
  failed,
  details,
};

console.log("PHASEUX_VERIFY");
console.log(JSON.stringify(report, null, 2));
if (ok) {
  console.log("PASS");
  process.exit(0);
} else {
  console.log("FAIL");
  process.exit(1);
}
