// src/apps/home/components/PrimaryPathways.jsx
// Clinically-guided luxury pathway cards — 2×2 responsive grid

import React from "react";
import { Activity, MessageCircle, HandHeart, Waves } from "lucide-react";

const PATHWAYS = [
  {
    id: "stabilize",
    title: "Help me feel steadier",
    description: "Choose a kind of support that fits this moment",
    icon: Activity,
    theme: "amber",
  },
  {
    id: "process",
    title: "Talk it through",
    description: "Start with one thing. The guide will take it step by step.",
    icon: MessageCircle,
    theme: "lavender",
  },
  {
    id: "real-help",
    title: "Find practical support",
    description: "Housing, food, recovery groups, treatment, and more",
    icon: HandHeart,
    theme: "mint",
  },
  {
    id: "cravings",
    title: "Get through an urge",
    description: "Pause, choose what helps, and plan the next few minutes",
    icon: Waves,
    theme: "blue",
  },
];

const themes = {
  amber: "from-amber-100/90 to-orange-50/90 text-slate-900 border-amber-200 hover:from-amber-50 hover:to-white",
  lavender: "from-violet-100/90 to-fuchsia-50/90 text-slate-900 border-violet-200 hover:from-violet-50 hover:to-white",
  mint: "from-emerald-100/90 to-teal-50/90 text-slate-900 border-emerald-200 hover:from-emerald-50 hover:to-white",
  blue: "from-sky-100/90 to-cyan-50/90 text-slate-900 border-sky-200 hover:from-sky-50 hover:to-white",
};

const iconThemes = {
  amber: "bg-amber-500/15 text-amber-800",
  lavender: "bg-violet-500/15 text-violet-800",
  mint: "bg-emerald-500/15 text-emerald-800",
  blue: "bg-sky-500/15 text-sky-800",
};

const PrimaryPathways = ({ onPathwayClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
      {PATHWAYS.map((pathway) => {
        const Icon = pathway.icon;
        const handleClick = () => {
          onPathwayClick?.(pathway.id);
        };
        return (
          <button
            key={pathway.id}
            type="button"
            onClick={handleClick}
            className={`group min-h-32 w-full rounded-2xl border bg-gradient-to-br p-4 sm:p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${themes[pathway.theme]}`}
            aria-label={`${pathway.title}: ${pathway.description}`}
          >
            <div className="flex h-full items-start gap-3 sm:gap-4">
              <div className={`flex-shrink-0 rounded-2xl p-3 ${iconThemes[pathway.theme]}`}>
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight">{pathway.title}</h3>
                <p className="mt-1.5 text-sm leading-snug text-slate-700/80">
                  {pathway.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700/75 group-hover:text-slate-950">Choose this <span aria-hidden>→</span></span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PrimaryPathways;
