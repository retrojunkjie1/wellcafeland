#!/usr/bin/env node
/**
 * scripts/phase54i.living.verify.mjs
 * Phase 54I: Living Responses Engine — living module, session hook, ChatPanel meta, MessageBubble trust UI.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

// A) src/lib/living.js — detectRoleIntent, pickVariantText
const livingPath = join(SRC, "lib", "living.js");
if (existsSync(livingPath)) {
  const c = readFileSync(livingPath, "utf8");
  results.living = {
    exists: true,
    hasDetectRoleIntent: c.includes("detectRoleIntent"),
    hasPickVariantText: c.includes("pickVariantText"),
    ok: c.includes("detectRoleIntent") && c.includes("pickVariantText"),
  };
  if (!results.living.ok) allOk = false;
} else {
  results.living = { exists: false, ok: false };
  allOk = false;
}

// B) src/hooks/useLivingSession.js — wc_chat_role, wc_turn_id
const hookPath = join(SRC, "hooks", "useLivingSession.js");
if (existsSync(hookPath)) {
  const c = readFileSync(hookPath, "utf8");
  results.useLivingSession = {
    exists: true,
    hasWcChatRole: c.includes("wc_chat_role"),
    hasWcTurnId: c.includes("wc_turn_id"),
    ok: c.includes("wc_chat_role") && c.includes("wc_turn_id"),
  };
  if (!results.useLivingSession.ok) allOk = false;
} else {
  results.useLivingSession = { exists: false, ok: false };
  allOk = false;
}

// C) ChatPanel.jsx — makeLivingMeta and metadata/meta passed to aiSession
const chatPath = join(SRC, "components", "os", "ChatPanel.jsx");
if (existsSync(chatPath)) {
  const c = readFileSync(chatPath, "utf8");
  const hasMakeLivingMeta = c.includes("makeLivingMeta");
  const hasMetaPassed = (c.includes("metadata:") && c.includes("callAI") && c.includes("aiSession")) || (c.includes("meta:") && c.includes("callAI"));
  results.chatPanel = {
    hasMakeLivingMeta,
    hasMetaPassedToAiSession: hasMetaPassed,
    ok: hasMakeLivingMeta && hasMetaPassed,
  };
  if (!results.chatPanel.ok) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

// D) MessageBubble.jsx — "Thought for", "How I'm approaching this"
const bubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
if (existsSync(bubblePath)) {
  const c = readFileSync(bubblePath, "utf8");
  results.messageBubble = {
    hasThoughtFor: c.includes("Thought for"),
    hasHowApproaching: c.includes("How I'm approaching this"),
    ok: c.includes("Thought for") && c.includes("How I'm approaching this"),
  };
  if (!results.messageBubble.ok) allOk = false;
} else {
  results.messageBubble = { ok: false };
  allOk = false;
}

const output = { PHASE54I_LIVING_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54I_LIVING_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
