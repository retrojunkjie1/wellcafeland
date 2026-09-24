// src/apps/core/HomePage.jsx
// Phase 2E: Luxury clinical wellness OS — premium, non-repetitive layout

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Heart,
  Wrench,
  Wind,
  Mountain,
  Moon,
  Home,
  Building2,
  DollarSign,
  Phone,
  Flame,
  Calendar,
  ChevronDown,
  HeartPulse,
} from "lucide-react";
import { trackPageView } from "../../services/telemetry";
import Logo from "@/components/Logo";
import { listResources } from "@/data/resources";
import { ensureDevAuth } from "@/dev/ensureAuth";
import { getLastSession, getStreakStats } from "@/services/sessionHistory";

const HomePage = () => {
  const navigate = useNavigate();
  const [hasResources, setHasResources] = useState(null);
  const [showStabilizers, setShowStabilizers] = useState(false);
  const [lastSession] = useState(() => getLastSession());
  const [streak] = useState(() => getStreakStats()?.currentStreak || 0);

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

  const tileBase =
    "rounded-xl border border-white/10 bg-white/[0.03] hover:border-wcGold/30 transition-all duration-200 p-4 text-left";

  return (
    <div className="space-y-6 py-6">
      {/* Hero — 1 headline, 1 line */}
      <section className="text-center space-y-2">
        <Logo size="lg" showText={true} />
        <h1 className="text-xl font-light text-white/90 tracking-wide">
          Support that meets you where you are
        </h1>
        <p className="text-sm text-white/50">Choose a path below</p>
      </section>

      {/* 1) Primary Pathways — 3 tiles max */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className={tileBase}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-wcGold/20 p-2.5 flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-wcGold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-white">Talk</h2>
              <p className="text-xs text-white/50 truncate">Your guide is here</p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate("/assistance")}
          className={tileBase}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2.5 flex-shrink-0">
              <Heart className="h-5 w-5 text-white/70" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-white">Find Real Help</h2>
              <p className="text-xs text-white/50 truncate">Housing, treatment, funding</p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className={tileBase}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-2.5 flex-shrink-0">
              <Wrench className="h-5 w-5 text-white/70" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-white">Tools</h2>
              <p className="text-xs text-white/50 truncate">Breathing, grounding, journaling</p>
            </div>
          </div>
        </button>
      </section>

      {/* A clear, low-pressure entry to the daily check-in */}
      <section className="rounded-xl border border-wcGold/20 bg-wcGold/[0.045] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-wcGold/15 p-2.5 text-wcGold">
            <HeartPulse className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Daily check-in</h2>
            <p className="mt-1 text-xs leading-5 text-white/55">Take a quiet moment to notice how you’re doing. Skip anything you don’t want to answer.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/check-in")}
          className="mt-3 w-full rounded-lg border border-wcGold/30 px-4 py-2.5 text-sm font-medium text-wcGold transition hover:bg-wcGold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:mt-0 sm:w-auto sm:shrink-0"
        >
          Begin check-in
        </button>
      </section>

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

      {/* 3) Real-world pathways — compact */}
      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
          Real-world pathways
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => navigate("/assistance?priority=housing")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white text-sm transition"
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            Housing
          </button>
          <button
            type="button"
            onClick={() => navigate("/assistance?priority=programs")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white text-sm transition"
          >
            <Building2 className="h-4 w-4 flex-shrink-0" />
            Treatment
          </button>
          <button
            type="button"
            onClick={() => navigate("/assistance?priority=funding")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white text-sm transition"
          >
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            Funding
          </button>
          <button
            type="button"
            onClick={() => navigate("/resources")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/70 hover:text-white text-sm transition"
          >
            <Phone className="h-4 w-4 flex-shrink-0" />
            Hotlines
          </button>
        </div>
      </section>

      {/* 4) Progress signals — quiet */}
      <section className="flex flex-wrap gap-4 justify-center pt-2">
        {streak > 0 && (
          <button
            type="button"
            onClick={() => navigate("/dashboard?view=moments")}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition"
          >
            <Flame className="h-3.5 w-3.5" />
            {streak} day streak
          </button>
        )}
        {lastSession && (
          <button
            type="button"
            onClick={() => navigate("/guide")}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition"
          >
            <Calendar className="h-3.5 w-3.5" />
            Last session
          </button>
        )}
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
