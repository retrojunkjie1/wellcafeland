// src/components/system/ChatComposerBar.jsx
// Phase 54B: Luxury chat composer (voice-first, large hit targets)

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Mic, ArrowUp, Loader2 } from "lucide-react";
import { useSheet } from "@/context/SheetContext";

const ChatComposerBar = forwardRef((props, ref) => {
  const { sheetOpen } = useSheet();
  const {
    value,
    onChange,
    onSend,
    onMic,
    onFaceScan,
    disabled = false,
    placeholder = "Ask anything",
    isSending = false,
    compact = false,
    entryMode = false,
    onEntrySubmit,
  } = props;

  const inputRef = useRef(null);
  const [entryInput, setEntryInput] = React.useState("");
  const displayValue = entryMode ? entryInput : (value ?? "");
  const setDisplayValue = entryMode ? setEntryInput : (v) => onChange?.(v);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = entryMode ? entryInput : value;
      if (text?.trim() && !disabled && !isSending) {
        if (entryMode && onEntrySubmit) {
          onEntrySubmit(text.trim());
          setEntryInput("");
        } else {
          onSend?.();
        }
      }
    }
  };

  const canSend = displayValue?.trim() && !disabled && !isSending;
  const handleSendClick = () => {
    if (entryMode && onEntrySubmit && entryInput?.trim()) {
      onEntrySubmit(entryInput.trim());
      setEntryInput("");
    } else if (canSend) {
      onSend?.();
    }
  };

  return (
    <div
      data-wc-composer="1"
      className={`${compact ? "px-0" : "sticky bottom-0 z-20 px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"} transition-opacity ${sheetOpen ? "opacity-0 pointer-events-none" : ""}`}
    >
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow flex items-end gap-2 min-h-[56px]">
        {onMic && (
          <button
            type="button"
            onClick={onMic}
            disabled={disabled || isSending}
            className="flex-shrink-0 flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/12 border border-white/10 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        {onFaceScan && (
          <button
            type="button"
            onClick={onFaceScan}
            disabled={disabled || isSending}
            className="flex-shrink-0 flex h-11 w-11 min-w-[44px] min-h-[44px] items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/12 border border-white/10 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Read my expression"
            title="Read my expression"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
        <div className="flex-1 min-w-0 flex items-center">
          <textarea
            ref={inputRef}
            value={displayValue}
            onChange={(e) => setDisplayValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={disabled || isSending}
            className="w-full resize-none min-h-[44px] py-3.5 px-4 rounded-xl bg-slate-950/30 border border-white/10 text-white placeholder:text-slate-400 focus:border-white/20 focus:outline-none transition-colors text-[15px] sm:text-base"
          />
        </div>
        <button
          type="button"
          onClick={handleSendClick}
          disabled={!canSend}
          className="flex-shrink-0 flex min-w-[44px] min-h-[44px] w-11 h-11 items-center justify-center rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-200 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/12 disabled:border-white/15 disabled:hover:bg-white/12"
          aria-label="Send"
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
});

ChatComposerBar.displayName = "ChatComposerBar";

export default ChatComposerBar;
