#!/usr/bin/env node
// scripts/check-deploy.js
// Pre-deployment validation script to prevent wrong-project deploys

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const REQUIRED_PROJECT_ID = "wellnesscafelanding";

function readJsonFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

function readEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const env = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
    return env;
  } catch (err) {
    return null;
  }
}

function checkFirebaserc() {
  const firebasercPath = join(rootDir, ".firebaserc");
  const config = readJsonFile(firebasercPath);
  
  if (!config) {
    console.error("❌ .firebaserc not found");
    return { valid: false, error: ".firebaserc file missing" };
  }

  const defaultProject = config.projects?.default;
  if (!defaultProject) {
    console.error("❌ .firebaserc missing 'projects.default'");
    return { valid: false, error: ".firebaserc missing default project" };
  }

  if (defaultProject !== REQUIRED_PROJECT_ID) {
    console.error(`❌ .firebaserc default project is "${defaultProject}", expected "${REQUIRED_PROJECT_ID}"`);
    return {
      valid: false,
      error: `Wrong Firebase project: "${defaultProject}" (expected: "${REQUIRED_PROJECT_ID}")`,
    };
  }

  console.log(`✅ .firebaserc: default project is "${defaultProject}"`);
  return { valid: true, projectId: defaultProject };
}

function checkEnvFile() {
  const envPaths = [
    join(rootDir, ".env.production"),
    join(rootDir, ".env"),
  ];

  for (const envPath of envPaths) {
    const env = readEnvFile(envPath);
    if (env && env.VITE_FIREBASE_PROJECT_ID) {
      const projectId = env.VITE_FIREBASE_PROJECT_ID;
      if (projectId !== REQUIRED_PROJECT_ID) {
        console.error(`❌ ${envPath}: VITE_FIREBASE_PROJECT_ID is "${projectId}", expected "${REQUIRED_PROJECT_ID}"`);
        return {
          valid: false,
          error: `Wrong project ID in ${envPath}: "${projectId}" (expected: "${REQUIRED_PROJECT_ID}")`,
        };
      }
      const required = [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
        "VITE_FIREBASE_FUNCTIONS_URL",
      ];
      const missing = required.filter((key) => !env[key]);
      if (missing.length) {
        console.error(`❌ ${envPath}: missing Firebase web configuration: ${missing.join(", ")}`);
        return { valid: false, error: `Missing Firebase web configuration in ${envPath}` };
      }
      console.log(`✅ ${envPath}: Firebase web configuration is present for "${projectId}"`);
      return { valid: true, projectId };
    }
  }

  console.error("❌ No .env or .env.production file found with Firebase web configuration");
  return { valid: false, error: "Firebase web configuration is missing" };
}

function checkVideoAppCheckConfig() {
  // Vite reads production.local after production, while process variables have
  // the highest precedence. Merge in that order so preflight sees the same
  // public client settings that a production build will receive.
  const env = {};
  for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
    Object.assign(env, readEnvFile(join(rootDir, name)) || {});
  }
  Object.assign(env, process.env);

  if (env.VITE_WELLNESSCAFE_VIDEO_ENABLED !== "true") {
    console.log("ℹ️  First-party video is disabled; no client App Check key is required");
    return { valid: true };
  }

  if (!env.VITE_RECAPTCHA_SITE_KEY && !env.VITE_RECAPTCHA_KEY) {
    console.error("❌ First-party video is enabled, but the client App Check site key is missing");
    return {
      valid: false,
      error: "Configure VITE_RECAPTCHA_SITE_KEY (or VITE_RECAPTCHA_KEY) before deploying App-Check-protected video",
    };
  }

  console.log("✅ First-party video client App Check key is present");
  return { valid: true };
}

function checkFirebaseJson() {
  const firebaseJsonPath = join(rootDir, "firebase.json");
  const config = readJsonFile(firebaseJsonPath);
  
  if (!config) {
    console.error("❌ firebase.json not found");
    return { valid: false, error: "firebase.json file missing" };
  }

  if (!config.hosting) {
    console.warn("⚠️  firebase.json missing hosting configuration");
  } else {
    console.log("✅ firebase.json: hosting configuration present");
  }

  return { valid: true };
}

function collectFunctionSourceFiles(directory) {
  const skippedDirectories = new Set(["node_modules", "test", "tests", "scripts", ".git"]);
  return readdirSync(directory).flatMap((name) => {
    if (skippedDirectories.has(name)) return [];
    const path = join(directory, name);
    const stats = statSync(path);
    if (stats.isDirectory()) return collectFunctionSourceFiles(path);
    return /\.(?:js|cjs|mjs)$/.test(name) ? [path] : [];
  });
}

function checkFunctionsRuntime() {
  const functionsDir = join(rootDir, "functions");
  const packageConfig = readJsonFile(join(functionsDir, "package.json"));
  if (!packageConfig) {
    console.error("❌ functions/package.json could not be read");
    return { valid: false, error: "Functions package configuration is missing" };
  }

  if (packageConfig.engines?.node !== "22") {
    console.error(`❌ Functions runtime is Node.js ${packageConfig.engines?.node || "not specified"}; expected Node.js 22`);
    return { valid: false, error: "Functions runtime must stay on Node.js 22" };
  }

  const legacyConfigCall = /\bfunctions\s*\.\s*config\s*\(/;
  const legacyFiles = collectFunctionSourceFiles(functionsDir)
    .filter((path) => legacyConfigCall.test(readFileSync(path, "utf-8")));
  if (legacyFiles.length) {
    const files = legacyFiles.map((path) => path.replace(`${rootDir}/`, "")).join(", ");
    console.error(`❌ Deprecated functions.config() call found in: ${files}`);
    return { valid: false, error: "Migrate Runtime Config usage before deploying Functions" };
  }

  console.log("✅ Cloud Functions runtime is pinned to Node.js 22");
  console.log("✅ Functions source contains no deprecated functions.config() calls");
  return { valid: true };
}

function main() {
  console.log("🔍 Running pre-deployment checks...\n");

  const firebasercCheck = checkFirebaserc();
  const envCheck = checkEnvFile();
  const videoAppCheckCheck = checkVideoAppCheckConfig();
  const firebaseJsonCheck = checkFirebaseJson();
  const functionsRuntimeCheck = checkFunctionsRuntime();

  console.log("");

  const errors = [];
  if (!firebasercCheck.valid) {
    errors.push(firebasercCheck.error);
  }
  if (!envCheck.valid) {
    errors.push(envCheck.error);
  }
  if (!videoAppCheckCheck.valid) {
    errors.push(videoAppCheckCheck.error);
  }
  if (!firebaseJsonCheck.valid) {
    errors.push(firebaseJsonCheck.error);
  }
  if (!functionsRuntimeCheck.valid) {
    errors.push(functionsRuntimeCheck.error);
  }

  if (errors.length > 0) {
    console.error("❌ Deployment check FAILED:\n");
    errors.forEach((err) => console.error(`   - ${err}`));
    console.error("\n💡 Fix the issues above before deploying.");
    console.error(`💡 Ensure .firebaserc default project is "${REQUIRED_PROJECT_ID}"`);
    console.error(`💡 Ensure complete Firebase web configuration is present in .env or .env.production`);
    process.exit(1);
  }

  // Check for project ID mismatch between .firebaserc and .env
  if (firebasercCheck.projectId && envCheck.projectId) {
    if (firebasercCheck.projectId !== envCheck.projectId) {
      console.error("❌ Project ID mismatch:");
      console.error(`   .firebaserc: "${firebasercCheck.projectId}"`);
      console.error(`   .env: "${envCheck.projectId}"`);
      process.exit(1);
    }
  }

  console.log("✅ All deployment checks passed!");
  console.log(`✅ Ready to deploy to "${REQUIRED_PROJECT_ID}"`);
  process.exit(0);
}

main();
