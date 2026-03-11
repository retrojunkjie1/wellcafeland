#!/usr/bin/env node
/**
 * build_steward_context.mjs
 * Compiles constitutional source-of-truth documents into a single steward context payload.
 * n8n Development Steward Board consumes docs/runtime/STEWARD_CONTEXT.json.
 * Fails closed on any validation error. Output includes versioning and freshness metadata
 * so n8n can refuse to act on stale or invalid context.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const MANIFEST_PATH = path.join(ROOT, "docs/automation/SOURCE_OF_TRUTH_MANIFEST.json");
const OUTPUT_PATH = path.join(ROOT, "docs/runtime/STEWARD_CONTEXT.json");
const SCRIPT_NAME = "build_steward_context.mjs";

function fail(message, detail = null) {
  const err = new Error(message);
  err.detail = detail;
  throw err;
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    fail(`Manifest missing: ${MANIFEST_PATH}`);
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch (e) {
    fail(`Manifest invalid JSON: ${MANIFEST_PATH}`, e.message);
  }
  if (!Array.isArray(manifest.required_documents)) {
    fail("Manifest must contain required_documents array", MANIFEST_PATH);
  }
  return manifest;
}

function resolvePath(relativePath) {
  const absolute = path.join(ROOT, relativePath);
  if (!path.resolve(absolute).startsWith(path.resolve(ROOT))) {
    fail(`Path escapes repo root: ${relativePath}`);
  }
  return absolute;
}

function getMtimeIso(absolutePath) {
  try {
    const stat = fs.statSync(absolutePath);
    return stat.mtime.toISOString();
  } catch (e) {
    return null;
  }
}

function buildStewardContext(manifest) {
  const generated_at = new Date().toISOString();
  const manifest_version = manifest.manifest_version ?? manifest.version ?? "1.0";
  const steward_context_version = manifest.steward_context_version ?? "1.0";
  const policy = manifest.freshness_policy || {};
  const max_context_age_minutes = policy.max_context_age_minutes ?? 60;

  const source_documents = {};
  const integrity = {
    all_required_present: true,
    all_non_empty: true,
    today_json_valid: false,
    stale: false,
  };

  for (const doc of manifest.required_documents) {
    const key = doc.key ?? doc.id;
    if (!key) {
      fail("Each required_documents entry must have key (or id)", { path: doc.path });
    }

    const absolutePath = resolvePath(doc.path);

    if (!fs.existsSync(absolutePath)) {
      integrity.all_required_present = false;
      fail(`Required document missing: ${doc.path}`, { key, absolute: absolutePath });
    }

    const content = fs.readFileSync(absolutePath, "utf8");
    const trimmed = content.trim();

    if (doc.must_be_non_empty && trimmed.length === 0) {
      integrity.all_non_empty = false;
      fail(`Required document is empty: ${doc.path}`, { key });
    }

    const mtime = getMtimeIso(absolutePath);
    const entry = {
      path: doc.path,
      content: content,
      mtime: mtime,
    };

    if (doc.parse_json) {
      try {
        entry.parsed = JSON.parse(content);
        integrity.today_json_valid = true;
      } catch (e) {
        fail(`Invalid JSON in ${doc.path}`, { key, message: e.message });
      }
    }

    source_documents[key] = entry;
  }

  return {
    generated_at,
    generated_by: SCRIPT_NAME,
    manifest_version,
    steward_context_version,
    max_context_age_minutes,
    source_documents,
    integrity,
  };
}

function main() {
  try {
    const manifest = loadManifest();
    const payload = buildStewardContext(manifest);
    const outDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
    console.log("STEWARD_CONTEXT written:", OUTPUT_PATH);
    process.exit(0);
  } catch (err) {
    console.error("[build_steward_context]", err.message);
    if (err.detail) console.error(err.detail);
    process.exit(1);
  }
}

main();
