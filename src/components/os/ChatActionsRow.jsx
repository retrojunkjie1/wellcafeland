// src/components/os/ChatActionsRow.jsx — wired action row (Phase 54L)
// Only render a button when its handler is provided.

import React, { useState } from "react";
import { Copy, Volume2, ThumbsUp, ThumbsDown, Share2, Check } from "lucide-react";
import VoiceResponse from "./VoiceResponse";

export default function ChatActionsRow({
  message,
  onRetry,
  onContinueOffline,
  onCopy,
  onSpeak,
  onShare,
}) {
  const [feedback, setFeedback] = useState(null);
  const [notice, setNotice] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const buttons = [];
  const isServiceError = message?.type === "assistant_error" || message?.meta?.kind === "service_error";
  const actionIds = new Set((Array.isArray(message?.actions) ? message.actions : []).map((action) => action?.action));
  // Recovery controls belong to an actual failed response, never a successful reply.
  // Failure messages normally provide their own context-specific actions; these are
  // fallback controls only when the message does not already include them.
  if (isServiceError && typeof onRetry === "function" && !actionIds.has("retry")) {
    buttons.push(
      <button key="retry" type="button" onClick={() => onRetry?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Retry">
        Retry
      </button>
    );
  }
  if (isServiceError && typeof onContinueOffline === "function" && !actionIds.has("offline") && !actionIds.has("continue_guidance")) {
    buttons.push(
      <button key="offline" type="button" onClick={() => onContinueOffline?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Continue offline">
        Continue offline
      </button>
    );
  }
  if (typeof onCopy === "function") {
    const content = typeof message?.content === "string" ? message.content : message?.text || message?.content?.content || "";
    buttons.push(
      <button key="copy" type="button" onClick={async () => { const copied = await onCopy?.(content); setNotice(copied === false ? "Could not copy" : "Copied"); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold" aria-label="Copy response" title="Copy response">
        {notice === "Copied" ? <Check size={17} /> : <Copy size={17} />}
      </button>
    );
  }
  if (onSpeak) {
    buttons.push(
      <button key="speak" type="button" onClick={() => setVoiceOpen((open) => !open)} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold ${voiceOpen ? "text-amber-200" : "text-white/55"}`} aria-label={voiceOpen ? "Close voice response player" : "Read response aloud"} aria-expanded={voiceOpen} title="Read response aloud">
        <Volume2 size={17} aria-hidden="true" />
      </button>
    );
  }
  if (typeof onCopy === "function") {
    buttons.push(
      <React.Fragment key="feedback">
        <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
        <button type="button" onClick={() => { setFeedback("helpful"); setNotice("Thanks for the feedback"); }} aria-label="Helpful response" aria-pressed={feedback === "helpful"} title="Helpful" className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold ${feedback === "helpful" ? "text-emerald-200" : "text-white/55"}`}>
          <ThumbsUp size={17} />
        </button>
        <button type="button" onClick={() => { setFeedback("not-helpful"); setNotice("Thanks for the feedback"); }} aria-label="Not helpful response" aria-pressed={feedback === "not-helpful"} title="Not helpful" className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold ${feedback === "not-helpful" ? "text-amber-200" : "text-white/55"}`}>
          <ThumbsDown size={17} />
        </button>
      </React.Fragment>
    );
  }
  if (typeof onShare === "function") {
    buttons.push(
      <button key="share" type="button" onClick={async () => { const result = await onShare?.(message); setNotice(result === false ? "Could not share this response" : result === "copied" ? "Copied to share" : result === "cancelled" ? "" : "Share options opened"); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold" aria-label="Share response" title="Share response">
        <Share2 size={17} />
      </button>
    );
  }

  if (buttons.length === 0) return null;

  return (
    <div className="mt-3 border-t border-white/10 pt-2" aria-label="Response actions">
      <div className="flex min-h-9 items-center gap-1">
        {buttons}
        {notice && <span className="ml-2 text-xs text-white/50" role="status">{notice}</span>}
      </div>
      {voiceOpen && <VoiceResponse text={typeof message?.content === "string" ? message.content : message?.text || ""} compact />}
    </div>
  );
}
