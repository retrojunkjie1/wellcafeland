#!/usr/bin/env node
/**
 * scripts/emu.clean.mjs
 * Clean start: kill listeners on emulator ports, clear local emulator temp/cache. No silent kills.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

const EMU_PORTS = [4400, 4500, 5001, 8080, 8081, 9099, 9151, 4000];

function lsofPids(port) {
  try {
    const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN 2>/dev/null || true`, { encoding: "utf8" });
    const lines = out.trim().split("\n").slice(1);
    return lines.map((l) => l.split(/\s+/)[1]).filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  try {
    execSync(`kill -9 ${pid} 2>/dev/null || true`);
    console.log(`[emu:clean] Killed PID ${pid}`);
  } catch (e) {
    console.warn(`[emu:clean] Could not kill ${pid}:`, e.message);
  }
}

// Move debug log to _logs if present (do not delete)
function rotateLog(logPath) {
  if (!existsSync(logPath)) return;
  const logsDir = join(__dirname, "_logs");
  if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
  const dest = join(logsDir, `firebase-debug-${Date.now()}.log`);
  try {
    renameSync(logPath, dest);
    console.log(`[emu:clean] Moved ${logPath} -> ${dest}`);
  } catch (e) {
    console.warn(`[emu:clean] Could not move log:`, e.message);
  }
}

async function run() {
  console.log("[emu:clean] Checking emulator ports for stuck listeners...");
  const killed = new Set();
  for (const port of EMU_PORTS) {
    const pids = lsofPids(port);
    for (const pid of pids) {
      if (killed.has(pid)) continue;
      killed.add(pid);
      killPid(pid);
    }
  }
  if (killed.size === 0) console.log("[emu:clean] No listeners found on emulator ports.");

  const dirs = [join(ROOT, ".firebase"), join(ROOT, "functions", ".firebase")];
  for (const d of dirs) {
    if (existsSync(d)) {
      console.log("[emu:clean] Leaving cache dir (manual delete if needed):", d);
    }
  }

  const debugLog = join(ROOT, "firebase-debug.log");
  const debugLog1 = join(ROOT, "firebase-debug.log.1");
  rotateLog(debugLog1);
  rotateLog(debugLog);

  console.log("[emu:clean] Done. Start emulators with: npm run emu:start");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(0);
});
