// src/hooks/useToolMemory.js
// PHASE 44 — Tool Memory Hook

import { useMemo } from "react";
import { useMemoryStore } from "@/store/memoryStore";
import {
  startToolSession,
  updateToolSession,
  endToolSession,
} from "@/engines/memory/toolsMemoryEngine";

/**
 * Hook for breathing tools, body scan, urge surfing, etc.
 */
export function useToolMemory(toolId) {
  const lastToolSession = useMemoryStore((s) => s.lastToolSession);

  const resumeSession =
    lastToolSession && lastToolSession.toolId === toolId
      ? lastToolSession
      : null;

  const api = useMemo(
    () => ({
      startSession: (mode) => startToolSession(toolId, mode),
      updateSession: (metrics) => updateToolSession(toolId, metrics),
      endSession: (metrics) => endToolSession(toolId, metrics),
    }),
    [toolId]
  );

  return {
    lastToolSession: resumeSession,
    ...api,
  };
}

