// src/components/interaction/UnifiedInteractionDock.jsx
// Phase 55A.2: ONE interaction surface — mic + tools + support (crisis always reachable)
// Rail-aware: when railMode true, renders only the dock card (parent BottomRail owns positioning).

import React, {useEffect} from "react";
import {Mic, Loader2, MessageCircle, AlertCircle, Wrench, LifeBuoy} from "lucide-react";

// Phase 56 Day 3: voice lifecycle labels and state-aware UI
const VOICE_STATE_LABELS = {
  idle: "Mic",
  permission: "Allow",
  ready: "Mic",
  listening: "Listening",
  processing: "Thinking",
  speaking: "Guiding",
  error: "Retry",
};

// Dev-only: warn if legacy dock is mounted alongside this (One Surface Rule)
function useLegacyDockGuard(contextKey) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const composer = document.getElementById("wc-composer-dock");
    if (composer?.children?.length) {
      console.warn("[UnifiedInteractionDock] Legacy composer dock detected on same page. One Surface Rule violation.", {contextKey});
    }
  }, [contextKey]);
}

export default function UnifiedInteractionDock({
  contextKey = "default",
  onMicPress,
  onToolsPress,
  onSupportPress,
  showTools = true,
  showSupport = true,
  disabled = false,
  variant = "default",
  railMode = true,
  voiceState,
  onRetry,
}) {
  useLegacyDockGuard(contextKey);

  const state = voiceState ?? "idle";
  const label = VOICE_STATE_LABELS[state] ?? VOICE_STATE_LABELS.idle;
  const isActive = state === "listening" || state === "processing" || state === "speaking";
  const isRequesting = state === "permission";
  const isError = state === "error";
  const ariaLabel = isError ? "Retry microphone" : `Voice: ${label}`;

  const isFocus = variant === "focus";
  const cardClass = "w-full rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl p-3 flex items-center justify-between gap-2 " + (isFocus ? "ring-1 ring-amber-400/20" : "");

  const micButtonClass =
    "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm disabled:pointer-events-none transition " +
    (isError ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200" : "bg-white/10 hover:bg-white/15 disabled:opacity-40");
  const micRing = isActive ? " ring-2 ring-amber-400/40 animate-pulse" : isRequesting ? " ring-2 ring-white/30" : "";

  const Icon =
    state === "processing" || state === "permission"
      ? Loader2
      : state === "speaking"
        ? MessageCircle
        : state === "error"
          ? AlertCircle
          : Mic;

  const card = (
    <div className={cardClass} data-wc-unified-dock={contextKey} data-voice-state={state}>
      <button
        type="button"
        onClick={() => (isError && onRetry ? onRetry() : onMicPress?.())}
        disabled={disabled && !isError}
        aria-label={ariaLabel}
        className={micButtonClass + micRing}
      >
        <Icon className={`h-5 w-5 text-white/90 ${state === "processing" || state === "permission" ? "animate-spin" : ""}`} />
        <span>{label}</span>
      </button>
      {showTools && (
        <button
          type="button"
          onClick={() => onToolsPress?.()}
          disabled={disabled}
          aria-label="Tools"
          className="flex items-center justify-center rounded-xl px-3 py-3 text-sm bg-transparent hover:bg-white/10 transition"
        >
          <Wrench className="h-5 w-5 text-white/70" />
        </button>
      )}
      {showSupport && (
        <button
          type="button"
          onClick={() => onSupportPress?.()}
          disabled={disabled}
          aria-label="Support / Crisis"
          className="flex items-center justify-center rounded-xl px-3 py-3 text-sm bg-transparent hover:bg-white/10 transition"
        >
          <LifeBuoy className="h-5 w-5 text-amber-300/90" />
        </button>
      )}
    </div>
  );

  if (railMode) return card;
  return (
    <div className="fixed inset-x-0 z-40 flex justify-center px-3" style={{bottom: "calc(var(--wc-bottom-nav-h, 72px) + env(safe-area-inset-bottom, 0px) + 8px)"}}>
      <div className="w-full max-w-md mx-auto">{card}</div>
    </div>
  );
}
