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
  amber: "from-[#302719] to-[#1A1712] text-[#F4EDE0] border-amber-200/25 hover:from-[#3B2E1C] hover:to-[#211B12]",
  lavender: "from-[#281D37] to-[#1D1727] text-[#F3EAFB] border-violet-200/25 hover:from-[#332345] hover:to-[#241B31]",
  mint: "from-[#183428] to-[#14251E] text-[#E3F3EA] border-emerald-200/25 hover:from-[#204332] hover:to-[#193126]",
  blue: "from-[#172B3C] to-[#14212D] text-[#E5F1FA] border-sky-200/25 hover:from-[#1D374D] hover:to-[#192A39]",
};

const iconThemes = {
  amber: "bg-amber-300/10 text-amber-200",
  lavender: "bg-violet-300/10 text-violet-200",
  mint: "bg-emerald-300/10 text-emerald-200",
  blue: "bg-sky-300/10 text-sky-200",
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
                <p className="mt-1.5 text-sm leading-snug text-white/75">
                  {pathway.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white">Choose this <span aria-hidden>→</span></span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PrimaryPathways;
