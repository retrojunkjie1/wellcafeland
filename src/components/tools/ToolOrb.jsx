// src/components/tools/ToolOrb.jsx
// Animated breathing orb with cinematic effects
// Phase 36B: OS Integration

import React, { useEffect, useState } from "react";

const ToolOrb = ({ controller, theme = "calm" }) => {
  const [state, setState] = useState({
    scale: 1,
    instruction: "Begin",
    phase: "idle",
  });

  useEffect(() => {
    if (!controller) return;

    const interval = setInterval(() => {
      const orbState = controller.getState();
      setState({
        scale: orbState.scale,
        instruction: orbState.instruction,
        phase: orbState.phase,
      });
    }, 50);

    return () => clearInterval(interval);
  }, [controller]);

  const themes = {
    calm: {
      primary: "rgba(251, 191, 36, 0.8)",
      secondary: "rgba(20, 184, 166, 0.6)",
      glow: "rgba(251, 191, 36, 0.5)",
    },
    focus: {
      primary: "rgba(99, 102, 241, 0.8)",
      secondary: "rgba(147, 51, 234, 0.6)",
      glow: "rgba(99, 102, 241, 0.5)",
    },
    release: {
      primary: "rgba(239, 68, 68, 0.7)",
      secondary: "rgba(251, 146, 60, 0.6)",
      glow: "rgba(239, 68, 68, 0.4)",
    },
    peace: {
      primary: "rgba(34, 211, 238, 0.8)",
      secondary: "rgba(59, 130, 246, 0.6)",
      glow: "rgba(34, 211, 238, 0.5)",
    },
  };

  const currentTheme = themes[theme] || themes.calm;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Orb container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-2xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${currentTheme.glow}, transparent)`,
            transform: `scale(${state.scale * 1.5})`,
            transition: "transform 0.3s cubic-bezier(0.77, 0, 0.175, 1)",
          }}
        />

        {/* Main orb */}
        <div
          className="relative rounded-full backdrop-blur-xl"
          style={{
            width: "280px",
            height: "280px",
            background: `radial-gradient(circle at 30% 30%, ${currentTheme.primary}, ${currentTheme.secondary})`,
            boxShadow: `
              0 0 60px ${currentTheme.glow},
              0 0 120px ${currentTheme.glow},
              inset 0 0 60px rgba(255, 255, 255, 0.1)
            `,
            transform: `scale(${state.scale})`,
            transition: "transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)",
          }}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: "linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
              backgroundSize: "200% 200%",
              animation: "shimmer 3s linear infinite",
            }}
          />

          {/* Inner glow */}
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent)`,
            }}
          />
        </div>
      </div>

      {/* Instruction text */}
      <div className="mt-8 text-center">
        <p className="text-white/90 text-lg font-light tracking-wide">
          {state.instruction}
        </p>
        <p className="text-white/50 text-sm mt-1 capitalize">
          {state.phase === "idle" ? "Ready to begin" : state.phase}
        </p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default ToolOrb;

