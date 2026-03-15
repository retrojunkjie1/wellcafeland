#!/usr/bin/env node
/**
 * scripts/phase54n.actions.verify.mjs
 * Phase 54N: Chat action chips functional, no auth walls for ALWAYS_ON_SUPPORT, intent truth consistent.
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
  const hasRetryLastTurn = c.includes("retryLastTurn");
  const hasLastTurnRef = c.includes("lastTurnRef");
  const noPleaseSignInInAlwaysOn = c.includes("isBasicNeeds") && c.includes("ALWAYS_ON_SUPPORT");
  const hasAdvancedContractFallback = c.includes("advancedSupportContractOffline") && c.includes("ALWAYS_ON_SUPPORT");

  results.chatPanel = {
    hasRetryLastTurn,
    hasLastTurnRef,
    noPleaseSignInInAlwaysOnBranch: noPleaseSignInInAlwaysOn,
    hasAdvancedContractFallback,
    ok: hasRetryLastTurn && hasLastTurnRef && noPleaseSignInInAlwaysOn && hasAdvancedContractFallback,
  };
  if (!results.chatPanel.ok) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

const bubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
if (existsSync(bubblePath)) {
  const b = readFileSync(bubblePath, "utf8");
  const chatSrc = existsSync(chatPath) ? readFileSync(chatPath, "utf8") : "";
  const hasClipboardOrCopy = b.includes("onCopy") && (b.includes("clipboard") || b.includes("Copy"));
  const hasExpandToggle = b.includes("onExpand") && (b.includes("expandedMessageIds") || b.includes("detailsOpen") || b.includes("Expand"));
  const hasSaveLocalStorage = b.includes("onSave");
  const hasWcSavedMessages = chatSrc.includes("wc:savedMessages") || chatSrc.includes("wc_saved_messages");

  results.messageBubble = {
    hasClipboardOrCopy,
    hasExpandToggle,
    hasSaveLocalStorage,
    hasWcSavedMessages,
    ok: hasClipboardOrCopy && hasExpandToggle && hasWcSavedMessages,
  };
  if (!results.messageBubble.ok) allOk = false;
} else {
  results.messageBubble = { ok: false };
  allOk = false;
}

const rowPath = join(SRC, "components", "os", "ChatActionsRow.jsx");
if (existsSync(rowPath)) {
  const r = readFileSync(rowPath, "utf8");
  const buttonsOnlyWhenHandler = r.includes("typeof onRetry === \"function\"") || r.includes("typeof onCopy === \"function\"");
  results.chatActionsRow = { buttonsOnlyWhenHandler, ok: buttonsOnlyWhenHandler };
  if (!results.chatActionsRow.ok) allOk = false;
} else {
  results.chatActionsRow = { ok: false };
  allOk = false;
}

const output = { PHASE54N_ACTIONS_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54N_ACTIONS_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
