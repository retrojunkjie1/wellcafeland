// src/apps/core/StabilizationEntryPage.jsx
// Phase 54A: Voice-first stabilization entry — calm, minimal, no auth required

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight, Shield, Home, Wrench, Compass } from "lucide-react";

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

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    navigate(`/chat?prefill=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-8 pb-[env(safe-area-inset-bottom)]">
      {/* A) Ambient breathing orb */}
      <div className="mb-8">
        <div
          className={`w-24 h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm ${
            prefersReducedMotion ? "" : "animate-pulse"
          }`}
          style={prefersReducedMotion ? {} : { animationDuration: "4s" }}
          aria-hidden
        />
      </div>

      {/* B) Primary sentence */}
      <p className="text-xl sm:text-2xl font-light text-white/90 text-center max-w-md mb-10 leading-relaxed">
        {ANCHOR_SENTENCE}
      </p>

      {/* C) Voice-first input row */}
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2">
          <button
            type="button"
            onClick={() => navigate("/tools/voice-checkin")}
            className="flex-shrink-0 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:bg-white/10 transition"
            aria-label="Voice check-in"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type here…"
            className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-white/40 focus:outline-none text-base"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* D) Secondary actions */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/assistance")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          <Shield className="h-4 w-4" />
          I need immediate help
        </button>
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          <Wrench className="h-4 w-4" />
          Open tools
        </button>
        <button
          type="button"
          onClick={() => navigate("/explore")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          <Compass className="h-4 w-4" />
          Browse
        </button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
      </div>
    </div>
  );
}
