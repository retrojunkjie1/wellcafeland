// src/components/os/ThreadCueBar.jsx
// Phase 54B: Calm thread continuity cue (trauma-safe, no guilt language)

import React from "react";
import { useContinuityStore } from "@/engines/continuity/continuityStore";

const ANCHOR_SENTENCE = "No need to explain. Start wherever you are.";

const ThreadCueBar = ({ onContinue }) => {
  const { lastTopic } = useContinuityStore();

  const displayTopic = lastTopic || null;

  return (
    <div
      data-wc-threadcue="1"
      className="border-b border-white/[0.10] bg-white/[0.05] backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-3 min-h-[40px]"
    >
      <div className="flex-1 min-w-0 truncate text-sm text-white/70">
        {displayTopic ? (
          <span>You were talking about: <span className="text-white/90">{displayTopic}</span></span>
        ) : (
          <span>{ANCHOR_SENTENCE}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="min-h-10 px-3 py-1.5 text-xs rounded-lg border border-emerald-200/30 bg-emerald-100/10 text-emerald-50 hover:bg-emerald-100/15 transition"
            aria-label="Write a message in the chat"
          >
            Write a message
          </button>
        )}
      </div>
    </div>
  );
};

export default ThreadCueBar;
