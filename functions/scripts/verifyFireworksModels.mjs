#!/usr/bin/env node
/**
 * Verify Fireworks models locally.
 * Reads functions/.env (or .env in cwd) and checks that FIREWORKS_MODEL_CHAT
 * and FIREWORKS_MODEL_REASONING exist in the Fireworks models list.
 *
 * Exit codes:
 *   0 - both models exist
 *   2 - chat model missing
 *   3 - reasoning model missing
 *   4 - API key missing
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FUNCTIONS_ROOT = join(__dirname, "..");
const ENV_PATH = join(FUNCTIONS_ROOT, ".env");

const TOKENS = ["cogito", "deepseek", "r1", "llama", "70b"];
const MODELS_URL = "https://api.fireworks.ai/inference/v1/models";

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(ENV_PATH, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) {
        const val = m[2].replace(/^["']|["']$/g, "").trim();
        env[m[1]] = val;
      }
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return env;
}

function modelExistsInList(modelId, models) {
  const id = (modelId || "").trim();
  if (!id) return false;
  const normalized = id.toLowerCase();
  const toMatch = normalized.includes("/") ? normalized : `models/${normalized}`;
  return models.some((m) => {
    const n = String(m.id || m.name || m || "").toLowerCase();
    return n === normalized || n === toMatch || n.endsWith("/" + normalized) || n.includes(normalized);
  });
}

function findClosestMatches(models, tokens) {
  const names = models.map((m) => m.id || m.name || m).filter(Boolean);
  const lower = names.map((n) => n.toLowerCase());
  const out = [];
  for (const token of tokens) {
    const t = token.toLowerCase();
    const matches = lower.filter((n) => n.includes(t));
    if (matches.length) {
      out.push(...matches.slice(0, 5).map((m) => names[lower.indexOf(m)]));
    }
  }
  return [...new Set(out)].slice(0, 10);
}

async function main() {
  const env = loadEnv();
  const apiKey = (env.FIREWORKS_API_KEY || "").trim();
  const chatModel = (env.FIREWORKS_MODEL_CHAT || "").trim();
  const reasoningModel = (env.FIREWORKS_MODEL_REASONING || "").trim();

  console.log("API key present:", !!apiKey);
  if (!apiKey) {
    console.error("FIREWORKS_API_KEY missing. Add it to functions/.env");
    process.exit(4);
  }

  let models = [];
  try {
    const res = await fetch(MODELS_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    models = data.data || data.models || [];
    if (!Array.isArray(models)) models = [];
  } catch (e) {
    console.error("Failed to fetch models:", e.message);
    process.exit(1);
  }

  const chatExists = modelExistsInList(chatModel, models);
  const reasoningExists = modelExistsInList(reasoningModel, models);

  console.log("FIREWORKS_MODEL_CHAT exists:", chatExists);
  console.log("FIREWORKS_MODEL_REASONING exists:", reasoningExists);

  if (!chatExists || !reasoningExists) {
    const closest = findClosestMatches(models, TOKENS);
    if (closest.length) {
      console.log("Closest matches (cogito/deepseek/r1/llama/70b):", closest.join(", "));
    }
  }

  if (!chatExists) {
    console.error("Chat model not found:", chatModel || "(empty)");
    process.exit(2);
  }
  if (!reasoningExists) {
    console.error("Reasoning model not found:", reasoningModel || "(empty)");
    process.exit(3);
  }

  console.log("OK: both models exist");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
