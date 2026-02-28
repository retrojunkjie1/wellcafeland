#!/usr/bin/env node
// scripts/phase52-route-audit.mjs
// Phase 52: Build-time route audit — ensure catch-all "*" exists

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appPath = join(__dirname, "../src/App.jsx");
const content = readFileSync(appPath, "utf8");

const routePathRegex = /path=["']([^"']+)["']/g;
const paths = [];
let m;
while ((m = routePathRegex.exec(content)) !== null) {
  paths.push(m[1]);
}

const hasCatchAll = paths.some((p) => p === "*");
if (!hasCatchAll) {
  console.error("phase52-route-audit: FAIL — No catch-all route (path=\"*\") found in App.jsx");
  process.exit(1);
}

console.log("phase52-route-audit: PASS");
console.log(`  Routes: ${paths.length}`);
console.log(`  Catch-all: path="*" ✓`);
