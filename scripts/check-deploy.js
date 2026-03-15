#!/usr/bin/env node
// scripts/check-deploy.js
// Pre-deployment validation script to prevent wrong-project deploys

import { readFileSync } from "fs";
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
      console.log(`✅ ${envPath}: VITE_FIREBASE_PROJECT_ID is "${projectId}"`);
      return { valid: true, projectId };
    }
  }

  console.warn("⚠️  No .env or .env.production file found with VITE_FIREBASE_PROJECT_ID");
  return { valid: true, projectId: null, warning: true };
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

function main() {
  console.log("🔍 Running pre-deployment checks...\n");

  const firebasercCheck = checkFirebaserc();
  const envCheck = checkEnvFile();
  const firebaseJsonCheck = checkFirebaseJson();

  console.log("");

  const errors = [];
  if (!firebasercCheck.valid) {
    errors.push(firebasercCheck.error);
  }
  if (!envCheck.valid) {
    errors.push(envCheck.error);
  }
  if (!firebaseJsonCheck.valid) {
    errors.push(firebaseJsonCheck.error);
  }

  if (errors.length > 0) {
    console.error("❌ Deployment check FAILED:\n");
    errors.forEach((err) => console.error(`   - ${err}`));
    console.error("\n💡 Fix the issues above before deploying.");
    console.error(`💡 Ensure .firebaserc default project is "${REQUIRED_PROJECT_ID}"`);
    console.error(`💡 Ensure VITE_FIREBASE_PROJECT_ID="${REQUIRED_PROJECT_ID}" in .env or .env.production`);
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

