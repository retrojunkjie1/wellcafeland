#!/usr/bin/env node
/**
 * verify_pod_context.mjs
 * Read-only pod context verification. Ensures steward context exists, is valid,
 * non-stale, and TODAY.json is present and valid. Exit 0 only if all checks pass.
 * Used by orchestration to fail closed before running the pod.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const STEWARD_PATH = path.join(ROOT, "docs/runtime/STEWARD_CONTEXT.json");
const TODAY_PATH = path.join(ROOT, "docs/runtime/TODAY.json");

const REQUIRED_DOC_KEYS = [
  "MASTER_VISION_BLUEPRINT",
  "CURSOR_MEMORY",
  "DEFINITION_OF_DONE",
  "PHASE_ROADMAP",
  "CURRENT_PHASE",
  "TODAY_JSON",
];

function fail(msg, code = 1) {
  console.error("[pod:verify]", msg);
  process.exit(code);
}

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} missing: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    fail(`${label} invalid JSON: ${filePath} — ${e.message}`);
  }
}

function main() {
  const ctx = loadJson(STEWARD_PATH, "STEWARD_CONTEXT");

  if (!ctx.integrity) {
    fail("STEWARD_CONTEXT missing integrity block");
  }
  if (ctx.integrity.all_required_present !== true) {
    fail("STEWARD_CONTEXT integrity: all_required_present is not true");
  }
  if (ctx.integrity.all_non_empty !== true) {
    fail("STEWARD_CONTEXT integrity: all_non_empty is not true");
  }
  if (ctx.integrity.today_json_valid !== true) {
    fail("STEWARD_CONTEXT integrity: today_json_valid is not true");
  }
  if (ctx.integrity.stale === true) {
    fail("STEWARD_CONTEXT integrity: stale is true");
  }
  if (!ctx.steward_context_version) {
    fail("STEWARD_CONTEXT missing steward_context_version");
  }
  if (!ctx.source_documents || typeof ctx.source_documents !== "object") {
    fail("STEWARD_CONTEXT missing or invalid source_documents");
  }
  for (const key of REQUIRED_DOC_KEYS) {
    if (!ctx.source_documents[key]) {
      fail(`STEWARD_CONTEXT source_documents missing key: ${key}`);
    }
  }

  const maxMinutes = ctx.max_context_age_minutes ?? 60;
  const generatedAt = ctx.generated_at;
  if (!generatedAt) {
    fail("STEWARD_CONTEXT missing generated_at");
  }
  const generatedTime = new Date(generatedAt).getTime();
  if (Number.isNaN(generatedTime)) {
    fail("STEWARD_CONTEXT generated_at is not a valid date");
  }
  const ageMinutes = (Date.now() - generatedTime) / 60000;
  if (ageMinutes > maxMinutes) {
    fail(
      `STEWARD_CONTEXT stale: age ${ageMinutes.toFixed(1)} min > max ${maxMinutes} min. Run npm run steward:build.`
    );
  }

  const today = loadJson(TODAY_PATH, "TODAY");
  if (today.active_phase === undefined || today.active_phase === null) {
    fail("TODAY.json missing active_phase");
  }
  if (!Array.isArray(today.focus)) {
    fail("TODAY.json focus must be an array");
  }

  console.log("pod:verify OK — context valid and non-stale; TODAY.json valid");
  process.exit(0);
}

main();
