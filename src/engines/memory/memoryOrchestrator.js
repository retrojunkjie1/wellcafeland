// src/engines/memory/memoryOrchestrator.js
// PHASE 44 — Memory Orchestration & Bootstrap

import { memoryStore } from "@/store/memoryStore";
import { rememberRouteVisit } from "@/engines/memory/sessionMemoryEngine";

/**
 * Called once on app bootstrap.
 * Handles version upgrades and basic initialization.
 */
export function bootstrapMemory() {
  const state = memoryStore.getState();

  // Example place for migrations if schema changes in future
  if (!state.memoryVersion || state.memoryVersion < 1) {
    memoryStore.resetMemory();
  }

  // Mark that the user returned
  const now = Date.now();
  rememberRouteVisit(state.lastVisitedRoute || "/", {
    source: "bootstrap",
    timestamp: now,
  });

  return {
    lastVisitedRoute: state.lastVisitedRoute || "/",
    lastToolSession: state.lastToolSession || null,
    lastTopicId: state.lastTopicId || null,
    lastWorkspaceId: state.lastWorkspaceId || null,
  };
}

/**
 * Helper for restoring a "resume" banner in UI.
 * You can call this in Dashboard or Home to offer "Continue where you left off".
 */
export function getResumeContext() {
  const state = memoryStore.getState();
  return {
    route: state.lastVisitedRoute || "/",
    tool: state.lastToolSession || null,
    topic:
      state.lastTopicId != null
        ? {
            id: state.lastTopicId,
            type: state.lastTopicType,
            visitedAt: state.lastTopicVisitedAt,
          }
        : null,
    workspace:
      state.lastWorkspaceId != null
        ? {
            id: state.lastWorkspaceId,
            context: state.lastWorkspaceContext,
            visitedAt: state.lastWorkspaceVisitedAt,
          }
        : null,
    emotion: state.lastEmotionSnapshot || null,
  };
}

