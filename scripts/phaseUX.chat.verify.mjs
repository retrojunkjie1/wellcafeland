#!/usr/bin/env node
/**
 * scripts/phaseUX.chat.verify.mjs
 * Verifies chat living UI: MarkdownLite, MessageBubble typography + action row + composer.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const results = {};
let allOk = true;

const markdownLitePath = join(SRC, "components", "system", "MarkdownLite.jsx");
results.markdownLiteExists = { ok: existsSync(markdownLitePath) };
if (!results.markdownLiteExists.ok) allOk = false;

const messageBubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
const actionRowPath = join(SRC, "components", "os", "ChatActionsRow.jsx");
if (existsSync(messageBubblePath)) {
  const content = readFileSync(messageBubblePath, "utf8");
  const actionRow = existsSync(actionRowPath) ? readFileSync(actionRowPath, "utf8") : "";
  const hasMarkdownLite = content.includes("MarkdownLite");
  const hasClipboard = actionRow.includes("Copy") && actionRow.includes("onCopy");
  const hasTypography = content.includes("text-base sm:text-lg") || content.includes("text-[15px]") || content.includes("text-[16px]");
  const hasCopy = actionRow.includes("Copy");
  const hasBookmark = actionRow.includes("Bookmark");
  const hasVolume2 = actionRow.includes("Volume2");
  const hasActionRowClass = actionRow.includes("rounded-full border border-white/10");
  results.messageBubbleWiring = {
    ok: hasMarkdownLite && hasClipboard && hasTypography && hasCopy && hasBookmark && hasVolume2 && hasActionRowClass,
    hasMarkdownLite,
    hasClipboard,
    hasTypography,
    hasCopy,
    hasBookmark,
    hasVolume2,
    hasActionRowClass,
  };
  if (!results.messageBubbleWiring.ok) allOk = false;
} else {
  results.messageBubbleWiring = { ok: false };
  allOk = false;
}

const composerPath = join(SRC, "components", "system", "ChatComposerBar.jsx");
if (existsSync(composerPath)) {
  const content = readFileSync(composerPath, "utf8");
  const hasInputSizing = content.includes("min-h-[44px]") || content.includes("h-11") || content.includes("py-3");
  const hasButtonHitArea = content.includes("min-w-[40px]") || content.includes("min-w-[44px]") || content.includes("h-11");
  results.composerSizing = { ok: hasInputSizing && hasButtonHitArea, hasInputSizing, hasButtonHitArea };
  if (!results.composerSizing.ok) allOk = false;
} else {
  results.composerSizing = { ok: false };
  allOk = false;
}

const output = { PHASEUX_CHAT_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASEUX_CHAT_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
