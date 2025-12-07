// src/engines/memory/toolsMemoryEngine.js
// PHASE 44 — Tools Session Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * Call when a tool session is started.
 */
export function startToolSession(toolId, mode) {
  if (!toolId) return;
  const snapshot = {
    toolId,
    mode: mode || "default",
    startedAt: Date.now(),
    endedAt: null,
    durationSec: 0,
    metrics: {},
  };
  memoryStore.setLastToolSession(toolId, snapshot);
  return snapshot;
}

/**
 * Call as metrics update during a session (e.g. cycles, coherence).
 */
export function updateToolSession(toolId, partialMetrics) {
  if (!toolId) return;
  const current = memoryStore.getState().lastToolSession;
  if (!current || current.toolId !== toolId) {
    // No current session; don't create one silently
    return;
  }
  const now = Date.now();
  const durationSec =
    current.startedAt != null
      ? Math.max(0, Math.floor((now - current.startedAt) / 1000))
      : current.durationSec || 0;

  memoryStore.setLastToolSession(toolId, {
    ...current,
    durationSec,
    metrics: {
      ...(current.metrics || {}),
      ...(partialMetrics || {}),
    },
    // do not mark ended here
  });
}

/**
 * Call when a session is gracefully ended.
 */
export function endToolSession(toolId, finalMetrics) {
  if (!toolId) return;
  const current = memoryStore.getState().lastToolSession;
  if (!current || current.toolId !== toolId) return;

  const now = Date.now();
  const durationSec =
    current.startedAt != null
      ? Math.max(0, Math.floor((now - current.startedAt) / 1000))
      : current.durationSec || 0;

  memoryStore.setLastToolSession(toolId, {
    ...current,
    durationSec,
    metrics: {
      ...(current.metrics || {}),
      ...(finalMetrics || {}),
    },
    endedAt: now,
  });
}

export function getLastToolSession() {
  return memoryStore.getState().lastToolSession || null;
}

export function getLastToolId() {
  return memoryStore.getState().lastToolId || null;
}

