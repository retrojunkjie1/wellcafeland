#!/usr/bin/env node
/**
 * scripts/phase54f.auth.verify.mjs
 * Phase 54F: Auth/token handling — ensureIdToken, 401 retry, Authorization on protected endpoints.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const aiSessionPath = join(SRC, "services", "aiSessionClient.js");
if (existsSync(aiSessionPath)) {
  const c = readFileSync(aiSessionPath, "utf8");
  const hasForceRefresh = c.includes("getIdToken(true)") || (c.includes("forceRefresh") && c.includes("getIdToken"));
  const has401Retry = c.includes("401") && (c.includes("retry") || c.includes("forceRefresh"));
  results.aiSessionClient = {
    hasForceRefresh,
    has401Retry,
    ok: hasForceRefresh && has401Retry,
  };
  if (!results.aiSessionClient.ok) allOk = false;
} else {
  results.aiSessionClient = { ok: false };
  allOk = false;
}

const dirSearchPath = join(SRC, "services", "directorySearch.js");
if (existsSync(dirSearchPath)) {
  const c = readFileSync(dirSearchPath, "utf8");
  const hasAuth = c.includes("Authorization") || (c.includes("getAuthHeaders") && c.includes("authHeaders"));
  results.directorySearch = { hasAuthorization: hasAuth, ok: hasAuth };
  if (!hasAuth) allOk = false;
} else {
  results.directorySearch = { ok: false };
  allOk = false;
}

const apiHelpersPath = join(SRC, "lib", "apiHelpers.js");
if (existsSync(apiHelpersPath)) {
  const c = readFileSync(apiHelpersPath, "utf8");
  const hasAuthSupport = c.includes("apiAuthProvider") || (c.includes("authHeaders") && c.includes("getAuthHeaders"));
  results.apiHelpers = { hasAuthSupport, ok: hasAuthSupport };
  if (!hasAuthSupport) allOk = false;
} else {
  results.apiHelpers = { ok: false };
  allOk = false;
}

const chatPanelPath = join(SRC, "components", "os", "ChatPanel.jsx");
if (existsSync(chatPanelPath)) {
  const c = readFileSync(chatPanelPath, "utf8");
  const hasGuard = c.includes("getAuthHeaders") && (c.includes("!authHeaders.Authorization") || c.includes("!authHeaders?.Authorization"));
  results.chatPanel = { hasAuthGuard: hasGuard, ok: hasGuard };
  if (!hasGuard) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

const output = { PHASE54F_AUTH_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54F_AUTH_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
