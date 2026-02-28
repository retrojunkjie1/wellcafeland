#!/usr/bin/env node
/**
 * Phase 51 smoke test
 * Verifies env vars and POSTs to /api/aiSession and /api/globalResourceSearch (expect 200)
 * Requires: Functions + Auth emulators, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY
 * Run: npm run smoke:phase-51
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const envPath = resolve(root, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
const apiKey = process.env.VITE_FIREBASE_API_KEY;
const baseUrl = process.env.BASE_URL || "http://localhost:5173";
const useApiPrefix = !baseUrl.includes("5001");

function checkEnv() {
  const missing = [];
  if (!projectId) missing.push("VITE_FIREBASE_PROJECT_ID");
  if (!apiKey) missing.push("VITE_FIREBASE_API_KEY");
  if (missing.length) {
    console.error("[smoke] Missing env vars (no secrets printed):", missing.join(", "));
    return false;
  }
  console.log("[smoke] Env check OK (projectId present, apiKey present)");
  return true;
}

async function getAuthToken() {
  const { initializeApp } = await import("firebase/app");
  const { getAuth, signInAnonymously, connectAuthEmulator } = await import("firebase/auth");

  const app = initializeApp({
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
  });
  const auth = getAuth(app);

  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });

  const { user } = await signInAnonymously(auth);
  const token = await user.getIdToken();
  return token;
}

async function postAiSession(token) {
  const path = useApiPrefix ? "/api/aiSession" : "/aiSession";
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      mode: "chat",
      messages: [{ role: "user", content: "Hi" }],
    }),
  });
  return { status: res.status, url };
}

async function postGlobalResourceSearch() {
  const path = useApiPrefix ? "/api/globalResourceSearch" : "/globalResourceSearch";
  const url = `${baseUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "health" }),
  });
  return { status: res.status, url };
}

async function main() {
  if (!checkEnv()) process.exit(1);

  let token;
  try {
    token = await getAuthToken();
  } catch (e) {
    console.error("[smoke] Auth failed (ensure Auth emulator running):", e.message);
    process.exit(1);
  }

  const ai = await postAiSession(token);
  const grs = await postGlobalResourceSearch();

  const aiOk = ai.status === 200;
  const grsOk = grs.status === 200;

  console.log(`[smoke] POST ${ai.url} -> ${ai.status} ${aiOk ? "PASS" : "FAIL"}`);
  console.log(`[smoke] POST ${grs.url} -> ${grs.status} ${grsOk ? "PASS" : "FAIL"}`);

  if (aiOk && grsOk) {
    console.log("[smoke] PASS");
    process.exit(0);
  }
  console.error("[smoke] FAIL");
  process.exit(1);
}

main().catch((e) => {
  console.error("[smoke] Error:", e.message);
  process.exit(1);
});
