// src/core/content/aiContentEngine.js
// Phase 35A — AI Content Synthesis Engine (orchestration layer)
// Orchestrates AI content generation with emotional analysis and risk assessment

import { generateAIContentDraft, saveContentModule } from "@/services/aiContentService";
import { analyzeMessageEmotion } from "@/services/emotionalAnalysis";
import { evaluateMessageRisk } from "@/services/riskService";

/**
 * Normalize high-level admin request into engine params.
 */
function normalizeRequest(input) {
  const {
    section = "tools",
    subtype = "breathing",
    topic,
    audience = "general",
    intensity = "low",
    tone = "calm",
    language = "en",
  } = input;

  return {
    section,
    subtype,
    topic: topic || "Untitled module",
    audience,
    intensity,
    tone,
    language,
  };
}

/**
 * Post-process content for emotional + risk tagging.
 */
function analyzeContentBody(body) {
  const emotion = analyzeMessageEmotion(body || "");
  const risk = evaluateMessageRisk({
    text: body || "",
    emotion,
    triggers: [],
  });

  const riskLevel = risk?.riskLevel || "low";
  const emotionalThemes = [];

  if (emotion?.label) emotionalThemes.push(emotion.label);

  if (risk?.domains?.includes("cravings")) emotionalThemes.push("cravings");
  if (risk?.domains?.includes("shame")) emotionalThemes.push("shame");
  if (risk?.domains?.includes("anxiety")) emotionalThemes.push("anxiety");
  if (risk?.domains?.includes("grief")) emotionalThemes.push("grief");
  if (risk?.domains?.includes("trauma")) emotionalThemes.push("trauma");

  return {
    riskLevel,
    emotionalThemes: Array.from(new Set(emotionalThemes)),
  };
}

/**
 * Generate + save a new content module in one call.
 * Returns a summary you can show in the UI.
 */
export async function generateAndStoreContentModule(input) {
  const request = normalizeRequest(input);

  // Step 1: Ask AI for a draft
  const draft = await generateAIContentDraft(request);

  // Step 2: Analyze for emotional + risk signals
  const { riskLevel, emotionalThemes } = analyzeContentBody(draft.body);

  // Step 3: Save as a Firestore module
  const saved = await saveContentModule({
    title: draft.title,
    section: request.section,
    subtype: request.subtype,
    audience: request.audience,
    intensity: request.intensity,
    format: "markdown",
    body: draft.body,
    tags: draft.tags || [],
    emotionalThemes: draft.emotionalThemes?.length
      ? draft.emotionalThemes
      : emotionalThemes,
    riskLevel,
    status: "draft", // admin can later flip to "approved"
    createdBy: "ai",
  });

  return {
    id: saved.id,
    title: draft.title,
    section: request.section,
    subtype: request.subtype,
    audience: request.audience,
    intensity: request.intensity,
    riskLevel,
    emotionalThemes,
  };
}

