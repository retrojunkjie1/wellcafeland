// src/engines/memory/contentMemoryEngine.js
// PHASE 44 — Content & Topic Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * Track which therapeutic topic the user is currently exploring.
 * Example topicId: "grief-and-loss", topicType: "mir" | "education" | "tool"
 */
export function rememberTopic(topicId, topicType) {
  if (!topicId) return;
  memoryStore.setLastTopic(topicId, topicType || null);
}

export function getLastTopic() {
  const state = memoryStore.getState();
  if (!state.lastTopicId) return null;
  return {
    id: state.lastTopicId,
    type: state.lastTopicType,
    visitedAt: state.lastTopicVisitedAt,
  };
}

