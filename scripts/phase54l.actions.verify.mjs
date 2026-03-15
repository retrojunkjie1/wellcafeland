#!/usr/bin/env node
/**
 * scripts/phase54l.actions.verify.mjs
 * Phase 54L: Interaction Wiring + Calm Signals — actions, thought gate, grounding route, sessionPrefs.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const chatActionsPath = join(SRC, "components", "os", "ChatActionsRow.jsx");
const chatPanelPath = join(SRC, "components", "os", "ChatPanel.jsx");
const messageBubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
const appPath = join(SRC, "App.jsx");
const sessionPrefsPath = join(SRC, "services", "sessionPrefs.js");

results.chatActionsRowExists = existsSync(chatActionsPath);
let actionsOrWiring = results.chatActionsRowExists;
if (!actionsOrWiring && existsSync(messageBubblePath)) {
  const bubble = readFileSync(messageBubblePath, "utf8");
  if (bubble.includes("onCopy") && (bubble.includes("onRetry") || bubble.includes("retry"))) {
    results.messageBubbleHasWiring = true;
    actionsOrWiring = true;
  }
}
results.actionsOrWiring = actionsOrWiring;

if (existsSync(messageBubblePath)) {
  const bubble = readFileSync(messageBubblePath, "utf8");
  results.noReactionsComing = !bubble.includes("Reactions coming");
} else {
  results.noReactionsComing = false;
}

if (existsSync(messageBubblePath)) {
  const bubble = readFileSync(messageBubblePath, "utf8");
  results.thoughtGate = bubble.includes("thoughtMs") && (bubble.includes(">= 250") || bubble.includes(">=250"));
} else {
  results.thoughtGate = false;
}

if (existsSync(appPath)) {
  const app = readFileSync(appPath, "utf8");
  results.groundingRouteExists = app.includes("/tools/grounding/54321");
} else {
  results.groundingRouteExists = false;
}

if (existsSync(sessionPrefsPath)) {
  const prefs = readFileSync(sessionPrefsPath, "utf8");
  results.sessionPrefsWcPrefs = prefs.includes("wc_prefs");
} else {
  results.sessionPrefsWcPrefs = false;
}

results.ok =
  results.actionsOrWiring &&
  results.noReactionsComing &&
  results.thoughtGate &&
  results.groundingRouteExists &&
  results.sessionPrefsWcPrefs;
if (!results.ok) allOk = false;

const output = { PHASE54L_ACTIONS_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54L_ACTIONS_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
