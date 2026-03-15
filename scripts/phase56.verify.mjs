#!/usr/bin/env node
/**
 * scripts/phase56.verify.mjs
 * Phase 56: Voice + Audio Experience Layer kickstart — file existence + shell gating.
 */

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const exists = (p) => fs.existsSync(path.join(root, p));
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const result = {PHASE56_VERIFY: false, results: {}, status: "FAIL"};

const checks = [
  () => ({name: "VoiceSessionProvider", pass: exists("src/experience/voice/VoiceSessionProvider.jsx")}),
  () => ({name: "useVoiceSession", pass: exists("src/experience/voice/useVoiceSession.js")}),
  () => ({name: "voiceSession.machine", pass: exists("src/experience/voice/voiceSession.machine.js")}),
  () => ({name: "AudioProvider", pass: exists("src/experience/audio/AudioProvider.jsx")}),
  () => ({name: "AudioEngine", pass: exists("src/experience/audio/AudioEngine.js")}),
  () => ({name: "breathingProgram", pass: exists("src/experience/audio/breathingProgram.js")}),
  () => ({name: "BottomRail", pass: exists("src/components/layout/BottomRail.jsx")}),
  () => ({name: "UnifiedInteractionDock", pass: exists("src/components/interaction/UnifiedInteractionDock.jsx")}),
  () => {
    if (!exists("src/system/ExperienceShell.jsx")) return {name: "ExperienceShell_gating", pass: false};
    const s = read("src/system/ExperienceShell.jsx");
    const hasGating = /enableExperienceProviders|!chatRoute && !toolDetailRoute/.test(s);
    const hasProviders = /AudioProvider|VoiceSessionProvider/.test(s);
    return {name: "ExperienceShell_gating", pass: hasGating && hasProviders};
  },
  () => {
    if (!exists("src/components/tools/BreathingSessionView.jsx")) return {name: "breathing_uses_program", pass: false};
    const s = read("src/components/tools/BreathingSessionView.jsx");
    return {name: "breathing_uses_program", pass: /breathingProgram|createBreathingScheduler|runBreathingScheduler/.test(s)};
  },
  () => {
    if (!exists("src/components/tools/BreathingSessionView.jsx")) return {name: "breathing_start_stop", pass: false};
    const s = read("src/components/tools/BreathingSessionView.jsx");
    return {name: "breathing_start_stop", pass: /isActive|schedulerRef|\.stop\(\)/.test(s)};
  },
  () => {
    if (!exists("src/components/tools/BreathingSessionView.jsx")) return {name: "breathing_cleanup", pass: false};
    const s = read("src/components/tools/BreathingSessionView.jsx");
    return {name: "breathing_cleanup", pass: /return \(\) =>|stopAll|unmount|cleanup/.test(s)};
  },
  () => {
    if (!exists("src/system/ExperienceShell.jsx")) return {name: "tool_detail_no_rail", pass: false};
    const s = read("src/system/ExperienceShell.jsx");
    const noRailOnToolDetail = /toolDetailRoute|showBottomRail.*!toolDetailRoute/.test(s);
    return {name: "tool_detail_no_rail", pass: noRailOnToolDetail};
  },
  // Day 3: spoken guidance + voice state feedback
  () => ({name: "spokenGuidance_registry", pass: exists("src/experience/audio/spokenGuidance.js")}),
  () => {
    if (!exists("src/experience/audio/spokenGuidance.js")) return {name: "spokenGuidance_has_registry", pass: false};
    const s = read("src/experience/audio/spokenGuidance.js");
    return {name: "spokenGuidance_has_registry", pass: /SPOKEN_GUIDANCE_REGISTRY|breathing_intro|grounding_intro/.test(s)};
  },
  () => ({name: "useSpokenGuidance", pass: exists("src/experience/audio/useSpokenGuidance.js")}),
  () => {
    if (!exists("src/experience/audio/useSpokenGuidance.js")) return {name: "useSpokenGuidance_api", pass: false};
    const s = read("src/experience/audio/useSpokenGuidance.js");
    return {name: "useSpokenGuidance_api", pass: /playGuidance|stopGuidance|isGuiding|currentGuidanceId/.test(s)};
  },
  () => {
    if (!exists("src/components/tools/BreathingSessionView.jsx")) return {name: "breathing_spoken_intro", pass: false};
    const s = read("src/components/tools/BreathingSessionView.jsx");
    return {name: "breathing_spoken_intro", pass: /playGuidance\s*\(\s*["']breathing_intro["']\)|useSpokenGuidance/.test(s)};
  },
  () => {
    if (!exists("src/components/interaction/UnifiedInteractionDock.jsx")) return {name: "dock_voice_state", pass: false};
    const s = read("src/components/interaction/UnifiedInteractionDock.jsx");
    const hasStateReflect = /data-voice-state|voiceState|VOICE_STATE_LABELS/.test(s);
    return {name: "dock_voice_state", pass: hasStateReflect};
  },
];

for (const c of checks) {
  const r = c();
  result.results[r.name] = r.pass ? "PASS" : "FAIL";
}

const allPass = Object.values(result.results).every((v) => v === "PASS");
result.PHASE56_VERIFY = allPass;
result.status = allPass ? "PASS" : "FAIL";

console.log("PHASE56_VERIFY");
console.log(JSON.stringify(result, null, 2));
process.exit(allPass ? 0 : 1);
