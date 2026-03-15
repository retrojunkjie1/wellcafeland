#!/usr/bin/env node
/**
 * scripts/phase54m.router.verify.mjs
 * Phase 54M: Router Truth + Guest Continuity — intent rules, no sign-in hijack for support, single thought timer.
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
  const hasAlwaysOnSupportTherapy = c.includes("therapy") && (c.includes("ALWAYS_ON_SUPPORT") || c.includes("ALWAYS_ON_SUPPORT_PHRASES"));
  const hasAlwaysOnSupportTalkToSomeone = c.includes("talk to someone") && (c.includes("ALWAYS_ON_SUPPORT") || c.includes("ALWAYS_ON_SUPPORT_PHRASES"));
  const hasRestrictedBookOrAppointment = (c.includes("book") || c.includes("appointment")) && (c.includes("RESTRICTED") || c.includes("RESTRICTED_PHRASES"));
  const hasClassifyRouteIntent = c.includes("classifyRouteIntent");
  const isBasicNeedsIncludesRouteIntent = c.includes("routeIntent === \"ALWAYS_ON_SUPPORT\"") && (c.includes("routeIntent === \"DIRECTORY\"") || c.includes("routeIntent === \"DIRECTORY_SUPPORT\"")) && c.includes("isBasicNeeds");
  const hasSignInAlternative = c.includes("I can help right now") && c.includes("SIGNIN_ALTERNATIVE");
  const hasContinueWithGuidance = c.includes("Continue with guidance") && c.includes("continue_guidance");
  const hasResponseContract = c.includes("responseContract") && c.includes("ADVANCED_SUPPORT_V1");
  const hasContractSections = c.includes("contractSections") && c.includes("reflect") && c.includes("clarify") && c.includes("steps") && c.includes("options") && c.includes("safety");
  const hasMaxClarify = c.includes("maxClarify") && c.includes("2");

  results.chatPanel = {
    hasAlwaysOnSupportIntentKeywords: hasAlwaysOnSupportTherapy && hasAlwaysOnSupportTalkToSomeone,
    hasRestrictedActionKeywords: hasRestrictedBookOrAppointment,
    hasClassifyRouteIntent,
    isBasicNeedsIncludesRouteIntent,
    hasSignInAlternativeCopy: hasSignInAlternative,
    hasContinueWithGuidanceAction: hasContinueWithGuidance,
    hasResponseContract,
    hasContractSections,
    hasMaxClarify,
    ok:
      hasAlwaysOnSupportTherapy &&
      hasAlwaysOnSupportTalkToSomeone &&
      hasRestrictedBookOrAppointment &&
      hasClassifyRouteIntent &&
      isBasicNeedsIncludesRouteIntent &&
      hasSignInAlternative &&
      hasContinueWithGuidance &&
      hasResponseContract &&
      hasContractSections &&
      hasMaxClarify,
  };
  if (!results.chatPanel.ok) allOk = false;
} else {
  results.chatPanel = { ok: false };
  allOk = false;
}

const bubblePath = join(SRC, "components", "os", "MessageBubble.jsx");
if (existsSync(bubblePath)) {
  const b = readFileSync(bubblePath, "utf8");
  const hasThoughtMsGate = b.includes("thoughtMs") && b.includes("250");
  const hasRoleAssistantGate = b.includes("role") && b.includes("assistant") && (b.includes("showThoughtMs") || b.includes("thoughtMs"));
  const noDuplicateThought = (b.match(/Thought for/g) || []).length <= 2;

  results.messageBubble = {
    hasThoughtMs250Gate: hasThoughtMsGate,
    hasRoleAssistantForThought: hasRoleAssistantGate,
    noDuplicateThoughtLabel: noDuplicateThought,
    ok: hasThoughtMsGate && hasRoleAssistantGate,
  };
  if (!results.messageBubble.ok) allOk = false;
} else {
  results.messageBubble = { ok: false };
  allOk = false;
}

const output = { PHASE54M_ROUTER_VERIFY: true, results, status: allOk ? "PASS" : "FAIL" };
console.log("PHASE54M_ROUTER_VERIFY");
console.log(JSON.stringify(output, null, 2));
console.log(allOk ? "PASS" : "FAIL");
process.exit(allOk ? 0 : 1);
