// src/apps/ai/AssistantOrb.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAIStore } from "./useAIStore";
import { getLastSession } from "../../services/sessionHistory";

const AssistantOrb = () => {
  const navigate = useNavigate();
  const { toggleConsole, isThinking } = useAIStore();
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    // Initialize last session
    const loadSession = () => {
      const sess = getLastSession();
      setLastSession(sess);
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
      {/* Last session pill */}
      {lastSession && (
        <button
          type="button"
          onClick={handleRepeatFromOrb}
          className="fixed right-6 bottom-24 z-40 max-w-[220px] truncate rounded-full border border-border bg-background/95 px-3 py-1.5 text-[11px] text-muted-foreground shadow-sm hover:bg-muted transition-colors"
        >
          Last session ·{" "}
          <span className="font-medium text-foreground">
            {lastSession.title?.length > 22
              ? lastSession.title.slice(0, 19) + "…"
              : lastSession.title || "Open"}
          </span>
        </button>
      )}

      {/* Orb */}
      <button
        type="button"
        onClick={handleOpenConsole}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 shadow-lg hover:bg-amber-400 transition-colors"
        aria-label="Open Living Guide"
      >
        {isThinking ? (
          <div className="h-5 w-5 animate-ping rounded-full bg-black/60" />
        ) : (
          <span className="text-xl">💬</span>
        )}
      </button>
    </>
  );
};

export default AssistantOrb;
