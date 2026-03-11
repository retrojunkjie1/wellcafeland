#!/usr/bin/env node
/**
 * scripts/phaseUX.trust.verify.mjs
 * Verifies trust layer: required files, MessageBubble wiring, planResponse export.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const REQUIRED_FILES = [
  join(SRC, "engines", "trust", "responsePlanner.js"),
  join(SRC, "engines", "trust", "rolePolicy.js"),
  join(SRC, "engines", "trust", "safetyPolicy.js"),
  join(SRC, "components", "system", "ReasoningDisclosure.jsx"),
  join(SRC, "components", "system", "ThinkingTimer.jsx"),
];

const results = {};
let allOk = true;

for (const p of REQUIRED_FILES) {
  const ok = existsSync(p);
  results[p.replace(ROOT + "/", "")] = { ok };
  if (!ok) allOk = false;
}

const messageBubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
if (existsSync(messageBubblePath)) {
  const content = readFileSync(messageBubblePath, "utf8");
  const hasReasoningDisclosure = content.includes("ReasoningDisclosure");
  const hasThinkingTimer = content.includes("ThinkingTimer");
  results.messageBubbleWiring = { ok: hasReasoningDisclosure && hasThinkingTimer, hasReasoningDisclosure, hasThinkingTimer };
  if (!hasReasoningDisclosure || !hasThinkingTimer) allOk = false;
} else {
  results.messageBubbleWiring = { ok: false };
  allOk = false;
}

const plannerPath = join(SRC, "engines", "trust", "responsePlanner.js");
if (existsSync(plannerPath)) {
  const content = readFileSync(plannerPath, "utf8");
  const hasPlanResponse = content.includes("planResponse");
  results.responsePlannerExport = { ok: hasPlanResponse };
  if (!hasPlanResponse) allOk = false;
} else {
  results.responsePlannerExport = { ok: false };
  allOk = false;
}

const output = { PHASEUX_TRUST_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASEUX_TRUST_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
