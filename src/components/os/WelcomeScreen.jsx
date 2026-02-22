// src/components/os/WelcomeScreen.jsx
// Welcome screen shown before conversation starts — clinically-guided luxury pathway layout

import React from "react";
import { useOSStore } from "@/stores/useOSStore";
import Logo from "@/components/Logo";
import PrimaryPathways from "@/apps/home/components/PrimaryPathways";

const WelcomeScreen = ({ onAction }) => {
  const { messages } = useOSStore();
  const hasStarted = messages.length > 1; // More than welcome message

  if (hasStarted) return null;

  const handlePathwayClick = (pathwayId) => {
    // TODO: wire navigation when handlers are implemented
    const prompts = {
      stabilize: "I need to stabilize right now",
      process: "Help me process what I'm feeling",
      "real-help": "I need real help — housing, treatment, or programs",
      cravings: "I'm struggling with cravings",
    };
    onAction?.(prompts[pathwayId] ?? pathwayId);
  };

  return (
    <div className="flex h-full items-center justify-center px-4 py-12">
      <div className="mx-auto max-w-2xl w-full text-center space-y-12">
        {/* Logo — WELLNESSCAFÉ headline */}
        <div className="flex justify-center">
          <Logo size="lg" showText={true} />
        </div>

        {/* Hero subtext — calm, premium */}
        <div className="space-y-2">
          <p className="text-lg font-light text-white/80 tracking-wide leading-relaxed max-w-xl mx-auto">
            Support that meets you where you are.
          </p>
          <p className="text-base font-light text-white/60 tracking-wide leading-relaxed max-w-xl mx-auto">
            Tell me what's happening, or choose a path below.
          </p>
        </div>

        {/* Primary Pathways — 2×2 clinically-guided grid */}
        <div className="pt-4">
          <PrimaryPathways onPathwayClick={handlePathwayClick} />
        </div>

        {/* Guide presence — minimal */}
        <div className="pt-8">
          <p className="text-sm text-white/50 font-light">
            Your guide is here, present with you
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

