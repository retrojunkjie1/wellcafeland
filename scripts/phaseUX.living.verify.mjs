#!/usr/bin/env node
/**
 * scripts/phaseUX.living.verify.mjs
 * Verifies live intervention UX: variation library, engine, no template navigation, InterventionModal.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};

// 1) variationLibrary has >= 8 variants for overwhelmed level 0
const variationPath = join(SRC, "engines", "liveIntervention", "variationLibrary.js");
if (!existsSync(variationPath)) {
  results.variationLibrary = { ok: false, reason: "file missing" };
} else {
  const content = readFileSync(variationPath, "utf8");
  if (!content.includes("overwhelmed") || !content.includes("0:")) {
    results.variationLibrary = { ok: false, reason: "overwhelmed level 0 not found" };
  } else {
    const count = (content.match(/variantId:\s*["']ovw-0-[^"']+["']/g) || []).length;
    results.variationLibrary = { ok: count >= 8, count, required: 8 };
  }
}

// 2) liveInterventionEngine exists and exports runIntervention
const enginePath = join(SRC, "engines", "liveIntervention", "liveInterventionEngine.js");
if (!existsSync(enginePath)) {
  results.liveInterventionEngine = { ok: false, reason: "file missing" };
} else {
  const content = readFileSync(enginePath, "utf8");
  const hasExport = content.includes("export async function runIntervention") || (content.includes("export") && content.includes("runIntervention"));
  results.liveInterventionEngine = { ok: hasExport, file: enginePath };
}

// 3) No direct navigation from "overwhelmed" button to a static template (in known entry file)
const guidedPath = join(SRC, "apps", "core", "GuidedEntrySessionPage.jsx");
if (!existsSync(guidedPath)) {
  results.overwhelmedNoTemplateNav = { ok: false, reason: "GuidedEntrySessionPage missing" };
} else {
  const content = readFileSync(guidedPath, "utf8");
  const hasOverwhelmed = content.includes("overwhelmed");
  const usesRunIntervention = content.includes("runIntervention") && content.includes("handleOverwhelmed");
  const overwhelmedButtonNavigates = /overwhelmed[\s\S]*?onClick[\s\S]*?navigate\s*\([^)]*\/tools\/|overwhelmed[\s\S]*?onClick[\s\S]*?navigate\s*\([^)]*\/session\//.test(content);
  const ok = hasOverwhelmed && usesRunIntervention && !overwhelmedButtonNavigates;
  results.overwhelmedNoTemplateNav = { ok, hasOverwhelmed, usesRunIntervention, overwhelmedButtonNavigates };
}

// 4) InterventionModal exists
const modalPath = join(SRC, "components", "system", "InterventionModal.jsx");
results.interventionModal = { ok: existsSync(modalPath), path: modalPath };

const allOk = Object.values(results).every((r) => r.ok === true);
const output = {
  PHASEUX_LIVING_VERIFY: true,
  results,
  status: allOk ? "PASS" : "FAIL",
};

console.log("PHASEUX_LIVING_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
