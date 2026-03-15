// src/components/os/ChatActionsRow.jsx — wired action row (Phase 54L)
// Only render a button when its handler is provided.

import React from "react";
import { Copy, Bookmark, Volume2, ChevronDown } from "lucide-react";

export default function ChatActionsRow({
  message,
  onRetry,
  onOpenTools,
  onOpenRealHelp,
  onContinueOffline,
  onCopy,
  onSave,
  onSpeak,
  onExpand,
}) {
  const buttons = [];
  if (typeof onRetry === "function") {
    buttons.push(
      <button key="retry" type="button" onClick={() => onRetry?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Retry">
        Retry
      </button>
    );
  }
  if (typeof onOpenTools === "function") {
    buttons.push(
      <button key="open_tools" type="button" onClick={() => onOpenTools?.()} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Open tools">
        Open tools
      </button>
    );
  }
  if (typeof onOpenRealHelp === "function") {
    buttons.push(
      <button key="open_real_help" type="button" onClick={() => onOpenRealHelp?.()} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Open Real Help">
        Open Real Help
      </button>
    );
  }
  if (typeof onContinueOffline === "function") {
    buttons.push(
      <button key="offline" type="button" onClick={() => onContinueOffline?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Continue offline">
        Continue offline
      </button>
    );
  }
  if (typeof onCopy === "function") {
    const content = typeof message?.content === "string" ? message.content : message?.text || message?.content?.content || "";
    buttons.push(
      <button key="copy" type="button" onClick={() => onCopy?.(content)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Copy">
        <Copy size={12} />
        <span>Copy</span>
      </button>
    );
  }
  if (typeof onSave === "function") {
    buttons.push(
      <button key="save" type="button" onClick={() => onSave?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Save">
        <Bookmark size={12} />
        <span>Save</span>
      </button>
    );
  }
  if (typeof onSpeak === "function") {
    buttons.push(
      <button key="speak" type="button" onClick={() => onSpeak?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Speak">
        <Volume2 size={12} />
        <span>Speak</span>
      </button>
    );
  }
  if (typeof onExpand === "function") {
    buttons.push(
      <button key="expand" type="button" onClick={() => onExpand?.(message)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[12px] text-white/55 hover:text-white" aria-label="Expand">
        <ChevronDown size={12} />
        <span>Expand</span>
      </button>
    );
  }

  if (buttons.length === 0) return null;

  return (
    <div className="mt-2 flex items-center gap-2 flex-wrap">
      {buttons}
    </div>
  );
}
