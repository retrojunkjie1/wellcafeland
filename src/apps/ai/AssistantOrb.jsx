// src/apps/ai/AssistantOrb.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAIStore } from "./useAIStore";
import { getLastSession } from "../../services/sessionHistory";

const AssistantOrb = () => {
  const navigate = useNavigate();
  // Defensive: Ensure useAIStore doesn't crash orb if store fails
  // Orb must NOT depend on chat success or tool session state
  let toggleConsole = () => {};
  let isThinking = false;
  try {
    const store = useAIStore();
    toggleConsole = store?.toggleConsole || (() => {});
    isThinking = store?.isThinking || false;
  } catch (err) {
    // Silently fail - orb must always render
    toggleConsole = () => {};
    isThinking = false;
  }
  
  const [lastSession, setLastSession] = useState(null);
  // Phase 5: Debounce orb state updates - prevent thrashing
  const [debouncedIsThinking, setDebouncedIsThinking] = useState(false);
  const thinkingTimeoutRef = React.useRef(null);
  
  // Phase 5: Only update orb state when thinking actually changes
  useEffect(() => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
    }
    thinkingTimeoutRef.current = setTimeout(() => {
      setDebouncedIsThinking(isThinking);
    }, 100); // 100ms debounce
    
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, [isThinking]);

  useEffect(() => {
    // Initialize last session (must not throw)
    const loadSession = () => {
      try {
        const sess = getLastSession();
        setLastSession(sess);
      } catch (err) {
        console.warn("[AssistantOrb] Failed to load last session (non-blocking):", err);
      }
    };
    
    loadSession();

    // Watch storage changes (e.g., when a new session is viewed)
    const handleStorage = (event) => {
      if (event.key === "wc-last-session-v1") {
        const newSess = event.newValue ? JSON.parse(event.newValue) : null;
        setLastSession(newSess);
      }
    };
    window.addEventListener("storage", handleStorage);
    
    // Also check on focus in case storage changed in another tab
    const handleFocus = () => {
      loadSession();
    };
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  function handleOpenConsole() {
    toggleConsole();
  }

  function handleRepeatFromOrb() {
    if (!lastSession) return;

    navigate(
      `/sessions/view/${encodeURIComponent(
        lastSession.id || "last-session"
      )}`,
      { state: { session: lastSession, from: "orb_last_session" } }
    );
  }

  return (
    <>
      {/* Last session pill - Stable positioning */}
      {lastSession && (
        <button
          type="button"
          onClick={handleRepeatFromOrb}
          className="fixed max-w-[220px] truncate rounded-full border border-border bg-background/95 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm hover:bg-muted transition-colors z-[9998]"
          style={{
            bottom: "calc(140px + env(safe-area-inset-bottom))",
            right: "calc(16px + env(safe-area-inset-right))",
            maxBottom: "calc(100vh - 160px)",
            maxRight: "calc(100vw - 80px)",
          }}
        >
          Last session ·{" "}
          <span className="font-medium text-foreground">
            {lastSession.title?.length > 22
              ? lastSession.title.slice(0, 19) + "…"
              : lastSession.title || "Open"}
          </span>
        </button>
      )}

      {/* Orb - Stable positioning, deterministic, never drifts */}
      <button
        type="button"
        onClick={handleOpenConsole}
        className="fixed flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 shadow-lg hover:bg-amber-400 transition-transform hover:scale-105 active:scale-95 z-[9999] pointer-events-auto"
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom))",
          right: "calc(16px + env(safe-area-inset-right))",
          position: "fixed",
          touchAction: "manipulation",
        }}
        aria-label="Open Living Guide"
      >
        {debouncedIsThinking ? (
          <div className="h-5 w-5 animate-pulse rounded-full bg-black/60" />
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
    </>
  );
};

export default AssistantOrb;
