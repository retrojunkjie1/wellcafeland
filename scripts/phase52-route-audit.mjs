#!/usr/bin/env node
// scripts/phase52-route-audit.mjs
// Phase 52: Build-time route audit — ensure catch-all "*" exists

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const CATCH_ALL_PATTERNS = [
  /path:\s*"\*"/,
  /path:\s*'\*'/,
  /path\s*=\s*"\*"/,
  /path\s*=\s*'\*'/,
  /\{\s*path:\s*"\*"/,
  /<Route\s+path="\*"/,
  /<Route\s+path='\*'/,
];

function hasCatchAll(text) {
  return CATCH_ALL_PATTERNS.some((re) => re.test(text));
}

function collectCandidates() {
  const candidates = [
    path.join(root, "src", "App.jsx"),
    path.join(root, "src", "main.jsx"),
    path.join(root, "src", "router.jsx"),
    path.join(root, "src", "routes.jsx"),
  ];
  const osDir = path.join(root, "src", "os");
  const appsDir = path.join(root, "src", "apps");
  if (fs.existsSync(osDir)) {
    fs.readdirSync(osDir).forEach((f) => {
      if (f.endsWith(".jsx")) candidates.push(path.join(osDir, f));
    });
  }
  if (fs.existsSync(appsDir)) {
    fs.readdirSync(appsDir).forEach((f) => {
      const p = path.join(appsDir, f);
      if (fs.statSync(p).isDirectory()) {
        fs.readdirSync(p).forEach((sub) => {
          if (sub.endsWith(".jsx")) candidates.push(path.join(p, sub));
        });
      } else if (f.endsWith(".jsx")) candidates.push(p);
    });
  }
  return candidates;
}

const candidates = collectCandidates();
let inspected = null;
let found = false;

for (const file of candidates) {
  if (!fs.existsSync(file)) continue;
  try {
    const text = fs.readFileSync(file, "utf8");
    if (hasCatchAll(text)) {
      inspected = path.relative(root, file);
      found = true;
      break;
    }
  } catch {
    continue;
  }
}

console.log("phase52-route-audit: inspected", inspected || "(none matched)");

if (!found) {
  console.error("phase52-route-audit: FAIL — No catch-all route (path=\"*\") found.");
  console.error("Add a catch-all route, e.g.: <Route path=\"*\" element={<NotFound />} />");
  console.error("Searched:", candidates.map((c) => path.relative(root, c)).filter((c) => fs.existsSync(path.join(root, c))).join(", "));
  process.exit(1);
}

console.log("phase52-route-audit: PASS");
console.log("  Catch-all: path=\"*\" ✓");
