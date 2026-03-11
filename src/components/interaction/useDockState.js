// src/components/interaction/useDockState.js
// Phase 55A.2: Light state for dock mode (voice / tools / support)

import {useState, useCallback} from "react";

export function useDockState(initialMode = "voice") {
  const [mode, setMode] = useState(initialMode);
  const setDockMode = useCallback((m) => {
    setMode(m === "voice" || m === "tools" || m === "support" ? m : "voice");
  }, []);
  return {mode, setDockMode};
}
