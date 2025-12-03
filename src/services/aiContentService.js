// src/services/aiContentService.js
// AI Content Synthesis Service (Phase 35A)
// Generates trauma-informed content modules via AI with safety controls

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Call your AI backend to generate content.
 * This assumes you have an API route or Cloud Function like /api/ai/generate-content
 * You can change the URL to match your setup.
 */
async function callAIContentEndpoint(payload) {
  const response = await fetch("/api/ai/generate-content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "AI content endpoint failed");
  }

  const data = await response.json();
  return data;
}

/**
 * Generate a content module specification + markdown body via AI.
 * @param {Object} params
 * @returns {Promise<{ title, body, tags, emotionalThemes, riskLevel }>}
 */
export async function generateAIContentDraft(params) {
  const {
    section,
    subtype,
    topic,
    audience,
    intensity,
    tone,
    language = "en",
    maxWords = 900,
  } = params;

  const payload = {
    section,
    subtype,
    topic,
    audience,
    intensity,
    tone,
    language,
    maxWords,
  };

  const data = await callAIContentEndpoint({
    kind: "content-module",
    params: payload,
  });

  // Expect the backend to return a safe, structured object.
  // If not, we normalize with fallbacks.
  return {
    title: data.title || topic || "Untitled Module",
    body: data.body || "# Draft\n\nContent not available.",
    tags: Array.isArray(data.tags) ? data.tags : [],
    emotionalThemes: Array.isArray(data.emotionalThemes)
      ? data.emotionalThemes
      : [],
    riskLevel: data.riskLevel || "low",
  };
}

/**
 * Persist an AI-generated module into Firestore as a draft or approved module.
 * @param {Object} params
 * @returns {Promise<{ id: string }>}
 */
export async function saveContentModule(params) {
  const {
    title,
    section,
    subtype,
    audience,
    intensity,
    format = "markdown",
    body,
    tags = [],
    emotionalThemes = [],
    riskLevel = "low",
    status = "draft",
    createdBy = "ai",
  } = params;

  const ref = collection(db, "contentModules");
  const docRef = await addDoc(ref, {
    title,
    section,
    subtype,
    audience,
    intensity,
    format,
    body,
    tags,
    emotionalThemes,
    riskLevel,
    createdBy,
    status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

