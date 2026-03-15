// src/apps/core/GuidedEntrySessionPage.jsx
// Guided session entry by mode — luxury glass UI, 3 big action cards per mode
// "I'm overwhelmed" runs live intervention (no template navigation).

import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Activity, MessageCircle, ShieldCheck, Waves, ArrowRight } from "lucide-react";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { runIntervention } from "@/engines/liveIntervention/liveInterventionEngine";
import InterventionModal from "@/components/system/InterventionModal";

const ALLOWED_MODES = ["stabilize", "process", "real-help", "cravings"];

const MODE_CONFIG = {
  stabilize: {
    title: "Stabilize",
    subtitle: "Breathing, grounding, panic support",
    icon: Activity,
    cards: [
      { label: "Start breathing", path: "/tools/breathing" },
      { label: "Grounding now", path: "/tools/grounding" },
      { label: "Panic reset", path: "/tools/panic-reset" },
    ],
  },
  process: {
    title: "Process",
    subtitle: "Talk it through, reflect, get support",
    icon: MessageCircle,
    cards: [
      { label: "Talk with guide", path: "/guide" },
      { label: "Reflect & journal", path: "/tools" },
      { label: "Chat support", path: "/chat" },
    ],
  },
  "real-help": {
    title: "Real help",
    subtitle: "Housing, treatment, funding, programs",
    icon: ShieldCheck,
    cards: [
      { label: "Find assistance", path: "/assistance" },
      { label: "Resources", path: "/resources" },
      { label: "Support hub", path: "/support" },
    ],
  },
  cravings: {
    title: "Cravings support",
    subtitle: "Urge surfing and recovery support",
    icon: Waves,
    cards: [
      { label: "Urge surfing", path: "/tools/cravings" },
      { label: "Breathing", path: "/tools/breathing" },
      { label: "Recovery tools", path: "/recovery" },
    ],
  },
};

const GuidedEntrySessionPage = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  const identity = useSessionIdentity();
  const [interventionOpen, setInterventionOpen] = useState(false);
  const [interventionPayload, setInterventionPayload] = useState(null);

  const handleOverwhelmed = useCallback(async () => {
    const sessionId = identity.userId || "guest";
    try {
      const payload = await runIntervention({ sessionId, intent: "overwhelmed", context: { aiEnabled: true } });
      setInterventionPayload(payload);
      setInterventionOpen(true);
      if (import.meta.env.DEV) {
        console.debug("[GuidedEntrySessionPage] intervention variantId:", payload.variantId);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.warn("[GuidedEntrySessionPage] runIntervention failed", err);
      const fallback = await runIntervention({ sessionId, intent: "overwhelmed", context: { aiEnabled: false } });
      setInterventionPayload(fallback);
      setInterventionOpen(true);
    }
  }, [identity.userId]);

  if (import.meta.env.DEV) {
    console.debug("[GuidedEntrySessionPage]", { mode });
  }

  if (!mode || !ALLOWED_MODES.includes(mode)) {
    navigate("/", { replace: true });
    return null;
  }

  const config = MODE_CONFIG[mode];
  const Icon = config.icon;
  const isStabilize = mode === "stabilize";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-14">
          <div className="inline-flex rounded-2xl bg-white/[0.06] border border-white/10 p-4 mb-6">
            <Icon className="h-10 w-10 text-wcGold" aria-hidden />
          </div>
          <h1 className="text-3xl font-light tracking-wide text-white mb-2">
            {config.title}
          </h1>
          <p className="text-base text-white/60 tracking-wide">
            {config.subtitle}
          </p>
        </header>

        {/* I'm overwhelmed — live intervention (no template navigation) */}
        {isStabilize && (
          <section className="mb-6">
            <button
              type="button"
              onClick={handleOverwhelmed}
              className="w-full rounded-3xl border border-wcGold/30 bg-wcGold/10 hover:bg-wcGold/20 transition-all duration-200 p-5 text-left"
            >
              <span className="text-lg font-medium text-white">I'm overwhelmed</span>
            </button>
          </section>
        )}

        {/* 3 big action cards */}
        <section className="space-y-4">
          {config.cards.map((card) => (
            <button
              key={card.path}
              type="button"
              onClick={() => navigate(card.path)}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-wcGold/30 transition-all duration-200 p-6 text-left flex items-center justify-between group"
            >
              <span className="text-lg font-medium text-white">{card.label}</span>
              <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-wcGold transition-colors" />
            </button>
          ))}
        </section>

        <InterventionModal
          open={interventionOpen}
          onClose={() => setInterventionOpen(false)}
          payload={interventionPayload}
        />

        {/* Back */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-white/50 hover:text-white/80 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedEntrySessionPage;
