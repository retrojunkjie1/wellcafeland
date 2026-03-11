#!/usr/bin/env node
/**
 * scripts/phase54h.directory.verify.mjs
 * Phase 54H: Real Help results UI — ResourceResultCard, DirectoryResultsPanel, ChatPanel wiring, normalizer.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const cardPath = join(SRC, "components", "directory", "ResourceResultCard.jsx");
results.resourceResultCardExists = existsSync(cardPath);
if (!results.resourceResultCardExists) allOk = false;

const panelPath = join(SRC, "components", "directory", "DirectoryResultsPanel.jsx");
results.directoryResultsPanelExists = existsSync(panelPath);
if (!results.directoryResultsPanelExists) allOk = false;

const chatPath = join(SRC, "components", "os", "ChatPanel.jsx");
if (existsSync(chatPath)) {
  const c = readFileSync(chatPath, "utf8");
  results.chatPanelKindDirectoryResults = c.includes('kind:"directoryResults"') || c.includes("kind: \"directoryResults\"");
  results.chatPanelDirectoryResultsPanel = c.includes("DirectoryResultsPanel");
  if (!results.chatPanelKindDirectoryResults || !results.chatPanelDirectoryResultsPanel) allOk = false;
} else {
  results.chatPanelKindDirectoryResults = false;
  results.chatPanelDirectoryResultsPanel = false;
  allOk = false;
}

const searchPath = join(SRC, "services", "resourceSearch.js");
if (existsSync(searchPath)) {
  const c = readFileSync(searchPath, "utf8");
  results.resourceSearchNormalize = c.includes("normalizeResourceItem");
  results.resourceSearchLocationLine = c.includes("locationLine");
  if (!results.resourceSearchNormalize || !results.resourceSearchLocationLine) allOk = false;
} else {
  results.resourceSearchNormalize = false;
  results.resourceSearchLocationLine = false;
  allOk = false;
}

const output = { PHASE54H_DIRECTORY_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54H_DIRECTORY_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
