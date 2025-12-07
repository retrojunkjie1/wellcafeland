// src/engines/memory/sessionMemoryEngine.js
// PHASE 44 — Session & Route Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * Records route visits across the OS.
 * Call from a router listener / layout effect.
 */
export function rememberRouteVisit(path, context) {
  if (!path) return;
  memoryStore.setLastVisitedRoute(path, {
    source: context?.source || "route-change",
    timestamp: context?.timestamp ?? Date.now(),
  });
}

export function getLastVisitedRoute() {
  return memoryStore.getState().lastVisitedRoute || "/";
}

export function getLastVisitedAt() {
  return memoryStore.getState().lastVisitedAt || null;
}

