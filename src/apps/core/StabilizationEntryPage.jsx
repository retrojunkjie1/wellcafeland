// src/apps/core/StabilizationEntryPage.jsx
// Phase 54A: Voice-first stabilization entry — calm, minimal, no auth required

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

const ANCHOR_SENTENCE = "You don't have to explain—just tell me what's happening right now, in one breath.";

export default function StabilizationEntryPage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleContinue = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    navigate(`/chat?prefill=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 space-y-6">
        {/* Breathing orb */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-full border border-white/10 bg-white/5 ${
              prefersReducedMotion ? "" : "animate-pulse"
            }`}
            style={prefersReducedMotion ? {} : { animationDuration: "4s" }}
            aria-hidden
          />
        </div>

        {/* Primary sentence */}
        <p className="text-xl sm:text-2xl font-light text-white/90 text-center leading-relaxed">
          {ANCHOR_SENTENCE}
        </p>

        {/* Input row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say it simply…"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 text-base"
          />
          <button
            type="button"
            onClick={handleContinue}
            disabled={!text.trim()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Voice-first button */}
        <button
          type="button"
          onClick={() => navigate("/tools/voice-checkin")}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-white/80 hover:bg-white/10 transition"
        >
          <Mic className="h-5 w-5" />
          Talk instead
        </button>

        {/* Secondary actions */}
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/assistance")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
          >
            <ShieldAlert className="h-4 w-4" />
            I need immediate help
          </button>
          <button
            type="button"
            onClick={() => navigate("/tools")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
          >
            <Sparkles className="h-4 w-4" />
            Open tools
          </button>
          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
          >
            <Sparkles className="h-4 w-4" />
            Browse
          </button>
        </div>
      </div>
    </div>
  );
}
