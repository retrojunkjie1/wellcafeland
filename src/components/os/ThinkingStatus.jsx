import React, { useEffect, useState } from "react";
import { ChevronDown, Loader2, Sparkles } from "lucide-react";

function formatElapsed(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return seconds === 1 ? "1 second" : `${seconds} seconds`;
}

export default function ThinkingStatus({ intent = "chat", startedAt }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const isDirectory = intent === "directory";

  useEffect(() => {
    if (!startedAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const activityLabel = isDirectory ? "Searching public resources" : "Reviewing your request";
  const elapsedLabel = startedAt ? ` · ${formatElapsed(now - startedAt)}` : "";

  return (
    <div className="max-w-full">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="wc-response-status-details"
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-wcGold"
      >
        <Loader2 className="h-4 w-4 animate-spin text-wcGold motion-reduce:animate-none" aria-hidden="true" />
        <span>{activityLabel}{elapsedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="wc-response-status-details" className="ml-3 mt-1 max-w-md border-l border-white/15 py-1 pl-3 text-sm leading-relaxed text-white/60">
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-wcGold/75" aria-hidden="true" />
            {isDirectory
              ? "I’m checking public resources for this request. I’ll show the results with the reply."
              : "I’m using your message and the context of this conversation to prepare a useful reply."}
          </p>
        </div>
      )}
    </div>
  );
}
