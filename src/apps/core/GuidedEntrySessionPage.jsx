// src/apps/core/GuidedEntrySessionPage.jsx
// Guided session entry by mode — luxury glass UI, 3 big action cards per mode
// "I'm overwhelmed" runs live intervention (no template navigation).

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Activity, MessageCircle, HandHeart, Waves, ArrowRight, Compass, BookOpen, PenLine, HeartHandshake, Sparkles } from "lucide-react";

const ALLOWED_MODES = ["stabilize", "process", "real-help", "cravings"];

const MODE_CONFIG = {
  stabilize: {
    title: "Find a steadier next step",
    subtitle: "Choose the kind of help that feels possible. No breathing exercise is required.",
    icon: Activity,
    cards: [
      { label: "Help me choose", detail: "Movement, connection, orientation, or fewer demands", path: "/tools/emotion-regulator", icon: Sparkles, theme: "amber" },
      { label: "Notice what is around me", detail: "Use the senses that feel comfortable; skip the rest", path: "/tools/grounding", icon: Compass, theme: "mint" },
      { label: "Talk with the guide", detail: "Say as much or as little as you want", path: "/chat", icon: MessageCircle, theme: "lavender" },
    ],
  },
  process: {
    title: "Take it one piece at a time",
    subtitle: "You can talk, write, or look at one situation together.",
    icon: MessageCircle,
    cards: [
      { label: "Talk it through", detail: "Start with one short question from the guide", path: "/chat", icon: MessageCircle, theme: "lavender" },
      { label: "Write without a plan", detail: "Choose an open page or a guided prompt", path: "/tools/journaling", icon: PenLine, theme: "amber" },
      { label: "Untangle one situation", detail: "Separate facts, assumptions, needs, and options", path: "/tools/self-surgeon", icon: BookOpen, theme: "blue" },
    ],
  },
  "real-help": {
    title: "Find practical support",
    subtitle: "Start with the kind of help you need. Location helps us narrow the options.",
    icon: HandHeart,
    cards: [
      { label: "Search local assistance", detail: "Housing, food, shelter, and benefits", path: "/assistance", icon: HandHeart, theme: "mint" },
      { label: "Find recovery support", detail: "Meetings, peer groups, and recovery services", path: "/assistance", icon: HeartHandshake, theme: "blue" },
      { label: "Browse the resource library", detail: "Explore guides and service categories", path: "/resources", icon: BookOpen, theme: "amber" },
    ],
  },
  cravings: {
    title: "Get through this urge",
    subtitle: "You do not have to make a big decision right now. Pick one kind of support.",
    icon: Waves,
    cards: [
      { label: "Pause and map the urge", detail: "Choose a short or longer guided check-in", path: "/tools/urge-surfing", icon: Waves, theme: "blue" },
      { label: "Talk it through", detail: "Get a response without having to explain perfectly", path: "/chat", icon: MessageCircle, theme: "lavender" },
      { label: "Find recovery support", detail: "Look for a group, peer, or local service", path: "/assistance", icon: HeartHandshake, theme: "mint" },
    ],
  },
};

const cardThemes = {
  amber: "from-amber-50 to-orange-100/80 border-amber-200 text-amber-950",
  mint: "from-emerald-50 to-teal-100/80 border-emerald-200 text-emerald-950",
  lavender: "from-violet-50 to-fuchsia-100/80 border-violet-200 text-violet-950",
  blue: "from-sky-50 to-cyan-100/80 border-sky-200 text-sky-950",
};

const GuidedEntrySessionPage = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  if (!mode || !ALLOWED_MODES.includes(mode)) {
    navigate("/", { replace: true });
    return null;
  }

  const config = MODE_CONFIG[mode];
  const Icon = config.icon;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f1eee5] via-[#f4f5f1] to-[#e7f0ee] px-3 py-5 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_20px_70px_rgba(42,55,48,0.12)] backdrop-blur sm:p-8">
        {/* Header */}
        <header className="mb-7 text-center sm:mb-9">
          <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3">
            <Icon className="h-8 w-8 text-emerald-800" aria-hidden />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Choose one small step</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {config.title}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {config.subtitle}
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 sm:gap-4" aria-label="Ways to get support">
          {config.cards.map((card) => (
            (() => {
              const CardIcon = card.icon;
              return (
                <button
                  key={card.path}
                  type="button"
                  onClick={() => navigate(card.path)}
                  className={`group flex min-h-36 w-full items-start gap-3 rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 sm:p-5 ${cardThemes[card.theme]}`}
                >
                  <span className="rounded-xl bg-white/75 p-2.5"><CardIcon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold leading-snug">{card.label}</span>
                    <span className="mt-1.5 block text-sm leading-snug opacity-75">{card.detail}</span>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </button>
              );
            })()
          ))}
        </section>

        {/* Back */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-h-11 rounded-full px-4 text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:bg-white/80 hover:text-slate-950"
          >
            Back to choices
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedEntrySessionPage;
