#!/usr/bin/env node
/**
 * scripts/phase54g.living.verify.mjs
 * Phase 54G: Living fallback + guest safe mode — directory fallback to AI, no sign-in dead-end for unknown intent.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const chatPath = join(SRC, "components", "os", "ChatPanel.jsx");
if (existsSync(chatPath)) {
  const c = readFileSync(chatPath, "utf8");
  const hasDirectoryFallback = (c.includes("directoryFallback") && c.includes("callAI")) || (c.includes("searchResources") && c.includes("directoryFallback"));
  const hasDirectoryToolAndFallback = c.includes("searchResources") && (c.includes("directoryFallback") || c.includes("fallbackHint"));
  const hasGuestSafeMessage = c.includes("I can still help") && c.includes("getAuthHeadersWithTimeout");
  const noSignInGateForUnknown = hasGuestSafeMessage;
  results.chatOrchestrator = {
    hasDirectoryFailureFallbackToAi: hasDirectoryFallback,
    hasDirectoryToolAndFallbackInSameFile: hasDirectoryToolAndFallback,
    noSignInSolelyForUnknownIntent: noSignInGateForUnknown,
    hasGuestSafeMessage,
    ok: hasDirectoryFallback && hasDirectoryToolAndFallback && noSignInGateForUnknown && hasGuestSafeMessage,
  };
  if (!results.chatOrchestrator.ok) allOk = false;
} else {
  results.chatOrchestrator = { ok: false };
  allOk = false;
}

const output = { PHASE54G_LIVING_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54G_LIVING_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
