import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MANIFEST_PATH = path.join(ROOT, "functions/production-deployment.json");
export const ENTRY_PATH = path.join(ROOT, "functions/src/index.js");

export function validateManifest(manifest, entrySource) {
  if (!manifest || !Array.isArray(manifest.functions) || manifest.functions.length === 0) {
    throw new Error("Production function deployment manifest must contain a non-empty functions array.");
  }

  const seen = new Set();
  const exported = new Set([...entrySource.matchAll(/exports\.([A-Za-z_$][\w$]*)\s*=/g)].map((match) => match[1]));
  for (const name of manifest.functions) {
    if (typeof name !== "string" || !/^[A-Za-z][A-Za-z0-9]*$/.test(name)) {
      throw new Error(`Invalid Firebase function name in production deployment manifest: ${String(name)}`);
    }
    if (seen.has(name)) throw new Error(`Duplicate Firebase function in production deployment manifest: ${name}`);
    seen.add(name);
    if (!exported.has(name)) throw new Error(`Manifest function is not exported from functions/src/index.js: ${name}`);
  }
  return seen;
}

export function addedFunctionExports(diff) {
  const names = new Set();
  for (const line of diff.split(/\r?\n/)) {
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    const match = line.match(/^\+\s*exports\.([A-Za-z_$][\w$]*)\s*=/);
    if (match) names.add(match[1]);
  }
  return names;
}

export function assertNewExportsAreDeployable(diff, manifestNames) {
  const missing = [...addedFunctionExports(diff)].filter((name) => !manifestNames.has(name));
  if (missing.length) {
    throw new Error(`New Firebase function export(s) missing from functions/production-deployment.json: ${missing.join(", ")}`);
  }
}

export function getProductionDeployTarget(manifest) {
  return `functions:${manifest.functions.join(",functions:")}`;
}

export function loadProductionManifest() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const entrySource = fs.readFileSync(ENTRY_PATH, "utf8");
  return { manifest, names: validateManifest(manifest, entrySource) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { manifest, names } = loadProductionManifest();
    if (process.argv.includes("--check")) {
      const base = process.env.PR_BASE_SHA;
      const head = process.env.PR_HEAD_SHA;
      if (!base || !head) throw new Error("PR_BASE_SHA and PR_HEAD_SHA are required for --check.");
      const { execFileSync } = await import("node:child_process");
      const diff = execFileSync("git", ["diff", "--unified=0", `${base}...${head}`, "--", "functions/src/index.js"], { encoding: "utf8" });
      assertNewExportsAreDeployable(diff, names);
      console.log("New Firebase function exports are included in the production deployment manifest.");
    } else {
      console.log(getProductionDeployTarget(manifest));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
