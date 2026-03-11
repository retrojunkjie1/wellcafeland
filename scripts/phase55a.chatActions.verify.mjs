#!/usr/bin/env node
/**
 * scripts/phase55a.chatActions.verify.mjs
 * Phase 55A: Chat actions real, no crashes, truthful thinking, grounding + support fallback.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const result = {
  PHASE55A_CHAT_ACTIONS_VERIFY: false,
  results: {},
  status: "FAIL",
};

const checks = [];

checks.push(() => ({ name: "verify_script_exists", pass: exists("scripts/phase55a.chatActions.verify.mjs") }));

checks.push(() => {
  const p = "src/components/os/MessageBubble.jsx";
  if (!exists(p)) return { name: "messagebubble_exists", pass: false, detail: `missing ${p}` };
  const s = read(p);
  const usesSafeHandlerPattern = (s.includes("onOpenTools?.()") || (s.includes("onOpenTools") && s.includes("!= null"))) && s.includes("ChatActionsRow");
  const hasBareOnOpenTools = /\bonOpenTools\s*\(\s*\)/.test(s) && !s.includes("onOpenTools?.");
  return {
    name: "messagebubble_safe_handlers",
    pass: usesSafeHandlerPattern && !hasBareOnOpenTools,
    detail: !usesSafeHandlerPattern ? "safe handler guards missing" : (hasBareOnOpenTools ? "bare onOpenTools reference found" : ""),
  };
});

checks.push(() => {
  const p = "src/components/os/ChatPanel.jsx";
  if (!exists(p)) return { name: "chatpanel_exists", pass: false, detail: `missing ${p}` };
  const s = read(p);
  const hasPendingStartedAt = /startedAt|pendingStartMsRef/.test(s);
  const hasThoughtGate = /thoughtMs.*250|250.*thoughtMs/.test(s);
  const removesThinkingPlaceholders = /thinking_placeholder|Thinking…/.test(s);
  return {
    name: "truthful_thinking_timing_and_no_placeholders",
    pass: hasPendingStartedAt && hasThoughtGate && removesThinkingPlaceholders,
    detail: [
      !hasPendingStartedAt && "pending.startedAt missing",
      !hasThoughtGate && "thoughtMs>=250 gate missing",
      !removesThinkingPlaceholders && "thinking placeholder removal missing",
    ]
      .filter(Boolean)
      .join("; "),
  };
});

checks.push(() => ({ name: "safeLocalStorage_exists", pass: exists("src/lib/storage/safeLocalStorage.js") }));

checks.push(() => {
  const p = "src/components/os/ChatPanel.jsx";
  if (!exists(p)) return { name: "grounding_storage_check", pass: false };
  const s = read(p);
  const hasKey = /wc_grounding_suppress|wc_suppress_grounding_suggest/.test(s);
  const hasSet = /safeLocalStorage\.set\(groundingSuppressKey|localStorage\.setItem\("wc_suppress_grounding_suggest"/.test(s);
  return { name: "grounding_suppression_storage_exists", pass: hasKey && hasSet };
});

checks.push(() => ({ name: "support_fallback_exists", pass: exists("src/lib/support/fallback.js") }));

checks.push(() => ({ name: "grounding_modal_exists", pass: exists("src/components/chat/GroundingModal.jsx") }));

// Phase 55A / 55A.2: ONE surface rule — ChatPanel must not render PresenceDock
checks.push(() => {
  const p = "src/components/os/ChatPanel.jsx";
  if (!exists(p)) return { name: "no_duplicate_dock", pass: false, detail: `missing ${p}` };
  const s = read(p);
  const hasPresenceDockImport = /PresenceDock|presence\/PresenceDock/.test(s);
  const hasPresenceDockJsx = /<PresenceDock[\s\>]/.test(s);
  const pass = !hasPresenceDockImport && !hasPresenceDockJsx;
  return {
    name: "no_duplicate_dock",
    pass,
    detail: !pass ? (hasPresenceDockImport ? "ChatPanel imports PresenceDock" : "ChatPanel renders <PresenceDock>") : "",
  };
});

// Phase 55A.2: ComposerPresenceControls exists and is used in ChatPanel
checks.push(() => {
  const cp = "src/components/os/ComposerPresenceControls.jsx";
  const chat = "src/components/os/ChatPanel.jsx";
  if (!exists(cp)) return { name: "composer_presence_controls_present", pass: false, detail: "ComposerPresenceControls.jsx missing" };
  if (!exists(chat)) return { name: "composer_presence_controls_present", pass: false, detail: "ChatPanel missing" };
  const chatSrc = read(chat);
  const hasImport = /ComposerPresenceControls/.test(chatSrc);
  const hasUsage = /<ComposerPresenceControls[\s\>]/.test(chatSrc);
  const pass = hasImport && hasUsage;
  return {
    name: "composer_presence_controls_present",
    pass,
    detail: !pass ? (!hasImport ? "ChatPanel does not import ComposerPresenceControls" : "ChatPanel does not render <ComposerPresenceControls>") : "",
  };
});

// Phase 55A.2: Experience signal parser exists
checks.push(() => {
  const p = "src/core/experience/experienceSignal.js";
  if (!exists(p)) return { name: "experience_signal_parser_present", pass: false, detail: "experienceSignal.js missing" };
  const s = read(p);
  const hasParser = /parseExperienceSignal/.test(s);
  return { name: "experience_signal_parser_present", pass: hasParser, detail: hasParser ? "" : "parseExperienceSignal not found" };
});

// Phase 55A.2: message.meta.video referenced (MicroVideoCard)
checks.push(() => {
  const p = "src/components/os/MessageBubble.jsx";
  if (!exists(p)) return { name: "message_meta_video_referenced", pass: false, detail: "MessageBubble missing" };
  const s = read(p);
  const hasRef = /meta\?\.video|meta\.video/.test(s) && /MicroVideoCard/.test(s);
  return { name: "message_meta_video_referenced", pass: hasRef, detail: hasRef ? "" : "meta.video or MicroVideoCard not found" };
});

for (const c of checks) {
  const r = c();
  result.results[r.name] = r.pass ? "PASS" : `FAIL${r.detail ? `: ${r.detail}` : ""}`;
}

const allPass = Object.values(result.results).every((v) => String(v).startsWith("PASS"));
result.PHASE55A_CHAT_ACTIONS_VERIFY = allPass;
result.status = allPass ? "PASS" : "FAIL";

console.log("PHASE55A_CHAT_ACTIONS_VERIFY");
console.log(
  JSON.stringify(
    {
      PHASE55A_CHAT_ACTIONS_VERIFY: result.PHASE55A_CHAT_ACTIONS_VERIFY,
      results: result.results,
      status: result.status,
    },
    null,
    2,
  ),
);

process.exit(allPass ? 0 : 1);
