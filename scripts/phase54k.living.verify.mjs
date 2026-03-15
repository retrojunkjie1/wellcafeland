#!/usr/bin/env node
/**
 * scripts/phase54k.living.verify.mjs
 * Phase 54K: Living Responses + Intent Truth — variation metadata, anti-repeat, directory stable outcome.
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
  const hasTurnId = c.includes("metadata.turnId") || (c.includes("turnId") && c.includes("callAI"));
  const hasVariationSeed = c.includes("variationSeed");
  const hasStyleHints = c.includes("styleHints");
  const hasIntent = c.includes("metadata.intent") || (c.includes("intent") && c.includes("directory_fallback"));
  const hasWcHash = c.includes("wcHash");
  const hasLastHashesRef = c.includes("lastHashesRef");
  const hasAntiRepeat = c.includes("user_repeated_prompt") || c.includes("nudge");
  const directoryReturnsEarly = c.includes("searchResponse?.results?.length > 0") && c.includes("return;");
  const noPlaceholderInDirectory = !(c.includes("addMessage") && c.includes("assistant") && c.includes("pending") && c.includes("directoryQueries"));
  const hasDirectoryResultsKind = c.includes("directory_results");

  results.chatPanel = {
    hasMetadataTurnId: hasTurnId,
    hasMetadataVariationSeed: hasVariationSeed,
    hasMetadataStyleHints: hasStyleHints,
    hasMetadataIntent: hasIntent,
    hasWcHash: hasWcHash,
    hasLastHashesRef: hasLastHashesRef,
    hasAntiRepeatNudge: hasAntiRepeat,
    directoryReturnsEarlyOnResults: directoryReturnsEarly,
    noPlaceholderAssistantInDirectoryPath: noPlaceholderInDirectory,
    hasDirectoryResultsKind: hasDirectoryResultsKind,
    ok:
      hasVariationSeed &&
      hasStyleHints &&
      (hasIntent || c.includes("directory_fallback")) &&
      hasWcHash &&
      hasLastHashesRef &&
      directoryReturnsEarly &&
      hasDirectoryResultsKind,
  };
  if (!results.chatPanel.ok) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

const output = { PHASE54K_LIVING_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54K_LIVING_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
