// src/components/os/WelcomeScreen.jsx
// Welcome screen shown before conversation starts (like ChatGPT home)

import React from "react";
import { useOSStore } from "@/stores/useOSStore";
import Logo from "@/components/Logo";

const QUICK_ACTIONS = [
  "I need grounding right now",
  "Help me process what I'm feeling",
  "Guide me through a practice",
  "I'm struggling with cravings",
];

const WelcomeScreen = ({ onAction }) => {
  const { messages } = useOSStore();
  const hasStarted = messages.length > 1; // More than welcome message

  if (hasStarted) return null;

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="mx-auto max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" showText={true} />
        </div>

        {/* Welcome Message - Luxury typography */}
        <div className="space-y-6">
          <p className="text-xl font-light text-white/80 tracking-wide leading-relaxed max-w-xl mx-auto">
            I'm here to walk with you. Tell me what's real for you right now, or choose a practice below.
          </p>
        </div>

        {/* Quick Actions - Simple cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-8 max-w-2xl mx-auto">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction?.(action)}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-base text-white/90 transition hover:bg-white/10 hover:text-white hover:border-white/20 text-left"
            >
              {action}
          </button>
          ))}
        </div>

        {/* Guide Info - Simple presentation */}
        <div className="pt-10 space-y-1">
          <p className="text-sm text-white/50 font-light">
            Your guide is here, present with you
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

