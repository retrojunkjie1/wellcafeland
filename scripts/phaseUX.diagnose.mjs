#!/usr/bin/env node
/**
 * scripts/phaseUX.diagnose.mjs
 * UX spine regression detector — inspects header/nav/composer ownership,
 * window.open/target=_blank, and position:absolute in header-related files.
 * Exits 0 always (diagnostic tool).
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "src");

const report = {
  headerRenderLocations: [],
  bottomNavRenderLocations: [],
  composerRenderLocations: [],
  windowOpenCount: 0,
  targetBlankCount: 0,
  positionAbsoluteInHeaderFiles: 0,
  experienceShellActive: false,
};

function readSafe(p) {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return "";
  }
}

function grep(content, pattern) {
  const re = new RegExp(pattern, "g");
  return (content.match(re) || []).length;
}

function scanDir(dir, acc) {
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules") {
        scanDir(full, acc);
      } else if (e.isFile() && /\.(jsx?|tsx?)$/.test(e.name)) {
        const c = readSafe(full);
        acc.windowOpen += grep(c, "window\\.open\\(");
        acc.targetBlank += grep(c, 'target="_blank"');
      }
    }
  } catch {}
}

// Header render locations
const osLayoutPath = join(SRC, "layouts", "OSLayout.jsx");
if (existsSync(osLayoutPath)) {
  const c = readSafe(osLayoutPath);
  if (c.includes("<header") || c.includes("header className") || c.includes("Top App Bar")) {
    report.headerRenderLocations.push("layouts/OSLayout.jsx");
  }
}
const pageChromePath = join(SRC, "components", "nav", "OSPageChrome.jsx");
if (existsSync(pageChromePath)) {
  const c = readSafe(pageChromePath);
  if (c.includes("sticky top-0") || c.includes("OSPageChrome")) {
    report.headerRenderLocations.push("components/nav/OSPageChrome.jsx");
  }
}

// ExperienceShell
report.experienceShellActive = existsSync(join(SRC, "system", "ExperienceShell.jsx"));

// BottomNav
const osLayout = readSafe(join(SRC, "layouts", "OSLayout.jsx"));
if (osLayout.includes("<nav") && osLayout.includes("Bottom Nav")) {
  report.bottomNavRenderLocations.push("layouts/OSLayout.jsx (OSLayoutInner)");
}

// Composer
const chatPanel = readSafe(join(SRC, "components", "os", "ChatPanel.jsx"));
if (chatPanel.includes("ChatComposerBar")) {
  report.composerRenderLocations.push("components/os/ChatPanel.jsx");
}
const composerBar = readSafe(join(SRC, "components", "system", "ChatComposerBar.jsx"));
if (composerBar.includes("data-wc-composer")) {
  report.composerRenderLocations.push("components/system/ChatComposerBar.jsx (def)");
}

// window.open and target=_blank
const acc = { windowOpen: 0, targetBlank: 0 };
scanDir(SRC, acc);
report.windowOpenCount = acc.windowOpen;
report.targetBlankCount = acc.targetBlank;

// position:absolute in header-related files
const headerFiles = [
  "layouts/OSLayout.jsx",
  "components/nav/OSPageChrome.jsx",
  "components/system/PageHeader.jsx",
  "components/navigation/PageHeader.jsx",
  "components/Header.css",
  "components/Navbar.css",
];
for (const rel of headerFiles) {
  const p = join(SRC, rel);
  if (existsSync(p)) {
    const c = readSafe(p);
    report.positionAbsoluteInHeaderFiles += grep(c, "position:\\s*(absolute|fixed)");
    report.positionAbsoluteInHeaderFiles += grep(c, "position:\\s*\\[");
  }
}

console.log(JSON.stringify(report, null, 2));
process.exit(0);
