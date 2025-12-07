// src/engines/memory/emotionMemoryEngine.js
// PHASE 44 — Emotion Snapshot Memory

import { memoryStore } from "@/store/memoryStore";

/**
 * Store a lightweight emotional snapshot after a check-in or tool session.
 * snapshot: { label: string, intensity?: number (0-10), source?: string }
 */
export function rememberEmotionSnapshot(snapshot) {
  if (!snapshot || !snapshot.label) return;
  memoryStore.setEmotionSnapshot(snapshot);
}

export function getLastEmotionSnapshot() {
  return memoryStore.getState().lastEmotionSnapshot || null;
}

