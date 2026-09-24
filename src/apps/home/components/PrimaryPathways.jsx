// src/apps/home/components/PrimaryPathways.jsx
// Clinically-guided luxury pathway cards — 2×2 responsive grid

import React from "react";
import { Activity, MessageCircle, ShieldCheck, Waves } from "lucide-react";

const PATHWAYS = [
  {
    id: "stabilize",
    title: "Stabilize Me Now",
    description: "Breathing, grounding, panic support",
    icon: Activity,
  },
  {
    id: "process",
    title: "Help Me Process",
    description: "Talk it through, reflect, get support",
    icon: MessageCircle,
  },
  {
    id: "real-help",
    title: "I Need Real Help",
    description: "Shelter, food, recovery homes, AA/NA, treatment, benefits",
    icon: ShieldCheck,
  },
  {
    id: "cravings",
    title: "I'm Struggling With Cravings",
    description: "Urge surfing and recovery support",
    icon: Waves,
  },
];

const cardBase =
  "rounded-2xl border border-white/10 bg-white/[0.03] hover:border-[#D4AF37]/40 transition-all duration-300";

const PrimaryPathways = ({ onPathwayClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
            className={`${cardBase} w-full p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
            aria-label={`${pathway.title}: ${pathway.description}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-xl bg-white/[0.06] p-3">
                <Icon className="h-6 w-6 text-[#D4AF37]/80" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white">{pathway.title}</h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  {pathway.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default PrimaryPathways;
