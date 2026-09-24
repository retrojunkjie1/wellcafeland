// src/components/os/ThreadCueBar.jsx
// Phase 54B: Calm thread continuity cue (trauma-safe, no guilt language)

import React from "react";
import { useNavigate } from "react-router-dom";
import { useContinuityStore } from "@/engines/continuity/continuityStore";

const ANCHOR_SENTENCE = "No need to explain. Start wherever you are.";

const ThreadCueBar = ({ onContinue }) => {
  const navigate = useNavigate();
  const { lastTopic, recentActions } = useContinuityStore();

  const displayTopic = lastTopic || null;
  const actionChips = recentActions.slice(0, 2);

  return (
    <div
      data-wc-threadcue="1"
      className="border-b border-white/[0.10] bg-white/[0.05] backdrop-blur-sm px-4 py-2 flex items-center justify-between gap-3 min-h-[40px]"
    >
      <div className="flex-1 min-w-0 truncate text-sm text-white/70">
        {displayTopic ? (
          <span>
            Still on: <span className="text-white/90">{displayTopic}</span>
          </span>
        ) : (
          <span>{ANCHOR_SENTENCE}</span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 transition"
          >
            Continue
          </button>
        )}
        {actionChips.map((a, i) => (
          <a
            key={a.ts + i}
            href={a.href}
            onClick={(e) => {
              e.preventDefault();
              navigate(a.href);
            }}
            className="px-2 py-1 text-xs rounded border border-white/10 bg-white/5 text-white/60 hover:text-white/80 hover:bg-white/10 transition truncate max-w-[120px]"
          >
            {a.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ThreadCueBar;
