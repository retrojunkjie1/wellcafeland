// Phase 46 — Module Horizon Carousel
// Luxury horizontal scrolling carousel with 6 healing modules

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Shield,
  Brain,
  Activity,
  Waves,
  Sparkles,
} from "lucide-react";
import { launchSession } from "@/engines/sessions/sessionDispatcher";

const DEFAULT_MODULES = [
  {
    key: "foundations",
    title: "Healing Foundations",
    subtitle: "Core recovery insights",
    icon: Heart,
    sessionKey: "module-foundations",
  },
  {
    key: "trauma",
    title: "Trauma Recovery",
    subtitle: "Stability & safety",
    icon: Shield,
    sessionKey: "module-trauma",
  },
  {
    key: "emotional",
    title: "Emotional Mastery",
    subtitle: "Work with your emotions",
    icon: Brain,
    sessionKey: "module-emotional-mastery",
  },
  {
    key: "nervous",
    title: "Nervous System Reset",
    subtitle: "Regulate, breathe, restore",
    icon: Activity,
    sessionKey: "module-nervous-system",
  },
  {
    key: "cravings",
    title: "Craving Interventions",
    subtitle: "Ride the wave safely",
    icon: Waves,
    sessionKey: "module-cravings",
  },
  {
    key: "spiritual",
    title: "Spiritual Stability",
    subtitle: "Compassion & grounding",
    icon: Sparkles,
    sessionKey: "module-spiritual",
  },
];

export default function ModuleCarousel({ modules }) {
  const navigate = useNavigate();
  const displayModules = modules || DEFAULT_MODULES;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Module Horizon
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayModules.map((module) => {
          const Icon = module.icon;
          const isIconComponent = typeof Icon !== "string";
          
          return (
            <button
              key={module.key}
              type="button"
              onClick={() => launchSession(module.sessionKey, navigate)}
              className="group rounded-lg border border-slate-700/70 bg-slate-900/60 hover:bg-slate-900/80 hover:border-amber-400/60 p-2.5 transition-all"
            >
              <div className="flex flex-col items-center gap-1.5 text-center">
                <div className="rounded-full bg-amber-500/10 p-1.5 group-hover:bg-amber-500/20 transition-colors">
                  {isIconComponent ? (
                    <Icon className="h-4 w-4 text-amber-300" />
                  ) : (
                    <span className="text-base">{Icon}</span>
                  )}
                </div>
                <div className="min-w-0 w-full">
                  <h4 className="text-sm font-medium text-slate-100 group-hover:text-amber-100 transition-colors leading-tight">
                    {module.title}
                  </h4>
                  {module.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 leading-tight line-clamp-2">
                      {module.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

