/**
 * src/engines/liveIntervention/liveInterventionEngine.js
 * Session-aware, non-repeating, escalating interventions.
 * Uses store + optional AI (strict schema); fallback to variationLibrary.
 */

import { getIntentState, recordIntent, bumpLevel, recentVariants } from "./liveInterventionStore.js";
import { getVariantsForLevel } from "./variationLibrary.js";
import { callAiSession } from "@/services/aiSessionClient.js";
import { planResponse } from "@/engines/trust/responsePlanner.js";

const RAPID_WINDOW_MS = 90 * 1000;
const RECENT_N = 5;

function pickVariant(variants, excludeIds) {
  const allowed = variants.filter((v) => !excludeIds.includes(v.variantId));
  const pool = allowed.length ? allowed : variants;
  return pool[Math.floor(Math.random() * pool.length)];
}

function isValidPayload(data) {
  if (!data || typeof data !== "object") return false;
  const hasTitle = typeof data.title === "string";
  const hasLines = Array.isArray(data.lines) && data.lines.every((l) => typeof l === "string");
  const hasInstruction = typeof data.instruction === "string";
  const hasChoices = Array.isArray(data.choices) && data.choices.length >= 2;
  const hasPreset = typeof data.uiPreset === "string";
  const hasMode = typeof data.mode === "string";
  return hasTitle && hasLines && hasInstruction && hasChoices && hasPreset && hasMode;
}

function normalizePayload(data, variantId) {
  return {
    variantId: data.variantId || variantId || "fallback",
    mode: data.mode || "stabilize",
    uiPreset: data.uiPreset || "orb",
    title: data.title || "Pause",
    lines: (data.lines || []).slice(0, 3),
    instruction: data.instruction || "",
    choices: (data.choices || []).slice(0, 3),
  };
}

/**
 * Run intervention for session + intent. Escalates on rapid repeat; avoids repeating last 5 variants.
 * @param {{ sessionId: string, intent: string, context?: { aiEnabled?: boolean } }}
 * @returns {Promise<{ variantId: string, mode: string, uiPreset: string, title: string, lines: string[], instruction: string, choices: string[], level: number, stepLabel?: string }>}
 */
export async function runIntervention({ sessionId, intent, context = {} }) {
  const state = getIntentState(sessionId, intent);
  const now = Date.now();
  const last = state.history[state.history.length - 1];
  const rapidRepeat = last && now - last.ts < RAPID_WINDOW_MS;

  if (rapidRepeat) {
    bumpLevel(sessionId, intent);
  }
  const level = getIntentState(sessionId, intent).level;
  const variants = getVariantsForLevel(intent, level);
  const excluded = recentVariants(sessionId, intent, RECENT_N);
  const libraryVariant = pickVariant(variants, excluded);

  let payload = null;
  const aiEnabled = context.aiEnabled !== false;

  if (aiEnabled && libraryVariant) {
    try {
      const excludeThemes = excluded.map((id) => id).join(", ");
      const prompt = `You are a brief wellness intervention. Intent: ${intent}. Level: ${level}. Return JSON only, no markdown, exactly: {"title":"string","lines":["string","string"],"instruction":"string","choices":["string","string"],"uiPreset":"orb|wave|stepper","mode":"stabilize|crisis|handoff"}. Keep each line short. Do NOT repeat these theme IDs: ${excludeThemes}.`;
      const data = await callAiSession({ mode: "intervention", intent, level, prompt });
      const parsed = typeof data?.response === "string" ? (() => { try { return JSON.parse(data.response); } catch { return data; } })() : data;
      if (isValidPayload(parsed)) {
        payload = normalizePayload(parsed, `ai-${intent}-${level}-${now}`);
      }
    } catch (_) {
      // AI unavailable or invalid — use library
    }
  }

  if (!payload) {
    payload = normalizePayload(libraryVariant, libraryVariant.variantId);
  }

  recordIntent(sessionId, intent, { variantId: payload.variantId, level });

  const stepCount = state.history.length;
  const stepLabel = stepCount > 1 ? `Stabilizing • Step ${Math.min(stepCount, 4)}/4` : undefined;

  let reasoning = null;
  try {
    const plan = await planResponse({ userText: intent, requestedDepth: "brief", requestedRole: "default" });
    reasoning = plan.reasoning;
  } catch (_) {}

  if (import.meta.env.DEV) {
    console.debug("[liveIntervention]", { sessionId, intent, variantId: payload.variantId, level, stepLabel });
  }

  return {
    ...payload,
    level,
    stepLabel,
    reasoning,
  };
}
