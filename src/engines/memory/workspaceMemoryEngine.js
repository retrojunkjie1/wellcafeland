// src/engines/memory/workspaceMemoryEngine.js
// PHASE 44 — Workspace Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * Track which workspace the user last interacted with.
 * Example workspaceId: "real-help", context: { priority: "housing" }
 */
export function rememberWorkspace(workspaceId, context) {
  if (!workspaceId) return;
  memoryStore.setLastWorkspace(workspaceId, context || null);
}

export function getLastWorkspace() {
  const state = memoryStore.getState();
  if (!state.lastWorkspaceId) return null;
  return {
    id: state.lastWorkspaceId,
    context: state.lastWorkspaceContext,
    visitedAt: state.lastWorkspaceVisitedAt,
  };
}

