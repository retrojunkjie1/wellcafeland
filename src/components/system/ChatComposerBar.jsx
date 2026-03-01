// src/components/system/ChatComposerBar.jsx
// Phase 54B: Luxury chat composer (voice-first, large hit targets)

import React from "react";
import { Mic, ArrowUp, Loader2, Smile } from "lucide-react";

const ChatComposerBar = ({
  value,
  onChange,
  onSend,
  onMic,
  onFaceScan,
  disabled = false,
  placeholder = "Ask anything",
  isSending = false,
  inputRef,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value?.trim() && !disabled && !isSending) {
        onSend?.();
      }
    }
  };

  const canSend = value?.trim() && !disabled && !isSending;

  return (
    <div
      data-wc-composer="1"
      className="sticky bottom-0 z-20 px-4 pb-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg px-3 py-2 flex items-end gap-2">
        {onFaceScan && (
          <button
            type="button"
            onClick={onFaceScan}
            disabled={disabled}
            aria-label="Read my expression"
            className="flex-shrink-0 flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 hover:bg-white/12 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Smile className="h-5 w-5" />
          </button>
        )}
        {onMic && (
          <button
            type="button"
            onClick={onMic}
            disabled={disabled}
            aria-label="Voice input"
            className="flex-shrink-0 flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-white/[0.08] border border-white/10 hover:bg-white/12 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 min-h-[48px] max-h-32 resize-none rounded-xl bg-slate-950/30 border border-white/10 px-3 py-3 text-sm sm:text-base text-white placeholder:text-slate-400 focus:border-white/20 focus:outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => canSend && onSend?.()}
          disabled={!canSend}
          aria-label="Send"
          className="flex-shrink-0 flex h-11 min-w-[44px] items-center justify-center rounded-xl bg-white/12 border border-white/15 hover:bg-white/18 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowUp className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatComposerBar;
