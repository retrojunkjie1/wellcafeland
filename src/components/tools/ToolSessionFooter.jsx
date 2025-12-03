// src/components/tools/ToolSessionFooter.jsx
// Suggested next step after tool sessions
// Phase 43: Full Intelligent UI Activation Layer

import React from "react";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export function ToolSessionFooter({ toolId }) {
  const navigate = useNavigate();

  const suggestion =
    toolId === "breathing"
      ? {
          label: "Ground with your senses",
          text: "If you still feel activated, a quick 5-4-3-2-1 grounding can help anchor you.",
          action: () => navigate("/tools/grounding"),
        }
      : toolId === "grounding"
      ? {
          label: "Capture what shifted",
          text: "A two-minute journal can help your nervous system remember this calmer state.",
          action: () => navigate("/tools/journaling"),
        }
      : {
          label: "Check your signals",
          text: "If you'd like, explore your broader patterns in the Signals dashboard.",
          action: () => navigate("/dashboard"),
        };

  return (
    <section className="mt-6">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="w-4 h-4 text-amber-300" />
        <h3 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
          Suggested next step
        </h3>
      </div>
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-amber-100 mb-1">
            {suggestion.label}
          </p>
          <p className="text-[11px] text-slate-300 leading-snug">
            {suggestion.text}
          </p>
        </div>
        <button
          type="button"
          onClick={suggestion.action}
          className="inline-flex items-center justify-center px-3 py-2 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-100 border border-amber-400/60 hover:bg-amber-500/25 hover:shadow-[0_0_20px_rgba(245,197,94,0.45)] transition-all"
        >
          Go
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>
    </section>
  );
}

