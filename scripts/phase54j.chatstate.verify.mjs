#!/usr/bin/env node
/**
 * scripts/phase54j.chatstate.verify.mjs
 * Phase 54J: Chat State Sanitizer — no Thinking bubble, pending state, actions only on final messages.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const chatPath = join(SRC, "components", "os", "ChatPanel.jsx");
if (existsSync(chatPath)) {
  const c = readFileSync(chatPath, "utf8");
  const hasLiteralThinkingInAssistant = (c.includes('"Thinking...') || c.includes("Thinking…")) && (c.includes("addMessage") || c.includes("updateLastAssistantMessage")) && c.includes("assistant");
  const noThinkingBubble = !hasLiteralThinkingInAssistant;
  const hasSetPending = c.includes("setPending(");
  const hasSetPendingNull = c.includes("setPending(null");
  results.chatPanel = {
    noThinkingAsAssistantMessage: noThinkingBubble,
    hasSetPending,
    hasSetPendingNull,
    ok: noThinkingBubble && hasSetPending && hasSetPendingNull,
  };
  if (!results.chatPanel.ok) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

const bubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
if (existsSync(bubblePath)) {
  const c = readFileSync(bubblePath, "utf8");
  const hasIsPending = c.includes("isPending");
  const hasListenCondition = c.includes("Listen") && (c.includes("isPending") || c.includes("showListen"));
  results.messageBubble = {
    hasPendingGuard: hasIsPending,
    hasListenCondition,
    ok: hasIsPending && hasListenCondition,
  };
  if (!results.messageBubble.ok) allOk = false;
} else {
  results.messageBubble = { ok: false };
  allOk = false;
}

const output = { PHASE54J_CHATSTATE_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54J_CHATSTATE_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
