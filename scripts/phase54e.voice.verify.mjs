#!/usr/bin/env node
/**
 * scripts/phase54e.voice.verify.mjs
 * Phase 54E: Voice waveform wiring — AnalyserNode, requestAnimationFrame, no alert.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const modalPath = join(SRC, "components", "tools", "VoiceCheckInModal.jsx");
if (existsSync(modalPath)) {
  const content = readFileSync(modalPath, "utf8");
  const hasAnalyser = content.includes("AnalyserNode") || content.includes("createAnalyser");
  const hasRAF = content.includes("requestAnimationFrame");
  const noAlert = !content.includes("alert(");
  results.voiceWaveformWiring = { ok: hasAnalyser && hasRAF && noAlert, hasAnalyser, hasRAF, noAlert };
  if (!hasAnalyser || !hasRAF || !noAlert) allOk = false;
} else {
  results.voiceWaveformWiring = { ok: false };
  allOk = false;
}

const output = { PHASE54E_VOICE_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54E_VOICE_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
