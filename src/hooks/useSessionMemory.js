// src/hooks/useSessionMemory.js
// PHASE 44 — Session Memory Hook

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMemoryStore } from "@/store/memoryStore";
import { rememberRouteVisit } from "@/engines/memory/sessionMemoryEngine";

/**
 * Global hook for OSLayout / App shell.
 * It watches route changes and records them in memory.
 */
export function useSessionMemory() {
  const location = useLocation();
  const lastVisitedRoute = useMemoryStore((s) => s.lastVisitedRoute);

  useEffect(() => {
    if (!location?.pathname) return;
    rememberRouteVisit(location.pathname, { source: "navigation" });
  }, [location?.pathname]);

  return {
    lastVisitedRoute: lastVisitedRoute || "/",
  };
}

