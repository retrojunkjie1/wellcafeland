// src/apps/core/HomePage.jsx
// Phase 2E: Luxury clinical wellness OS — premium, non-repetitive layout

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  HeartHandshake,
  Flower2,
  Wind,
  Mountain,
  Moon,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  HeartPulse,
} from "lucide-react";
import { trackPageView } from "../../services/telemetry";
import { listResources } from "@/data/resources";
import { ensureDevAuth } from "@/dev/ensureAuth";
import PractitionerSupportInbox from "@/components/PractitionerSupportInbox";
import ClientNextSessionCard from "@/components/ClientNextSessionCard";
import ClientWeekProgress from "./ClientWeekProgress";

const HomePage = () => {
  const navigate = useNavigate();
  const [hasResources, setHasResources] = useState(null);
  const [showStabilizers, setShowStabilizers] = useState(false);

  useEffect(() => {
    document.title = "WellnessCafe - Home";
    trackPageView("home");
  }, []);

  useEffect(() => {
    const run = async () => {
      if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
        const ok = await ensureDevAuth();
        if (!ok) {
          setHasResources(false);
          return;
        }
      }
      listResources({ mode: "indexed" })
        .then((r) => {
          if (Array.isArray(r.items)) setHasResources(r.items.length > 0);
          else setHasResources(false);
        })
        .catch(() => setHasResources(false));
    };
    run();
  }, []);

  return (
    <div className="wc-home mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
      <section className="wc-home-hero">
        <p className="wc-home-eyebrow"><Sparkles aria-hidden="true" className="h-4 w-4" /> SUPPORT, AT YOUR PACE</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">What would help most right now?</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">Choose one place to begin. You can change direction whenever you want.</p>
      </section>

      <ClientNextSessionCard />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Choose a kind of support">
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className="wc-home-pathway wc-home-pathway--talk group"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--talk"><MessageCircle aria-hidden="true" className="h-6 w-6" /><Sparkles aria-hidden="true" className="wc-home-pathway__sparkle h-3.5 w-3.5" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Talk it through</span><span className="wc-home-pathway__description">Start with what’s on your mind.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/assistance")}
          className="wc-home-pathway wc-home-pathway--help group"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--help"><HeartHandshake aria-hidden="true" className="h-7 w-7" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Find real-world help</span><span className="wc-home-pathway__description">Housing, food, treatment, and more.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="wc-home-pathway wc-home-pathway--practice group"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--practice"><Flower2 aria-hidden="true" className="h-7 w-7" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Daily Practice</span><span className="wc-home-pathway__description">A practice you can choose and keep.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
      </section>

      <section className="wc-home-checkin">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="wc-home-checkin__icon">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">A moment for you</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Daily check-in</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/65">Share only what you want. You can leave any question blank.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/check-in")}
          className="wc-home-checkin-cta mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-wcGold px-5 text-sm font-semibold text-slate-950 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:mt-0 sm:w-auto sm:shrink-0"
        >
          Begin check-in <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </section>

      <ClientWeekProgress />

      <PractitionerSupportInbox />

      {/* 2) Stabilizers — small row, only on tap */}
      <section>
        <button
          type="button"
          onClick={() => setShowStabilizers((s) => !s)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition text-sm"
        >
          <span>Quick stabilizers</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showStabilizers ? "rotate-180" : ""}`}
          />
        </button>
        {showStabilizers && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => navigate("/tools/breathing")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Wind className="h-4 w-4" />
              Breathing
            </button>
            <button
              type="button"
              onClick={() => navigate("/tools/grounding")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Mountain className="h-4 w-4" />
              Grounding
            </button>
            <button
              type="button"
              onClick={() => navigate("/tools/recovery.sleep-and-recovery")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Moon className="h-4 w-4" />
              Sleep
            </button>
          </div>
        )}
      </section>

      {/* Keep the resource reminder small; check-in progress is shown above from saved check-ins. */}
      <section className="flex flex-wrap gap-4 justify-center pt-2">
        {hasResources && (
          <button
            type="button"
            onClick={() => navigate("/resources")}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition"
          >
            Resources available
          </button>
        )}
      </section>
    </div>
  );
};

export default HomePage;
