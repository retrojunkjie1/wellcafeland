// src/components/tools/CinematicContainer.jsx
// Cinematic backdrop container with gradients
// Phase 36B: OS Integration

import React from "react";
import Particles from "./Particles";

const CinematicContainer = ({ children, theme = "calm" }) => {
  const gradients = {
    calm: "from-slate-900 via-slate-800 to-amber-900/20",
    focus: "from-slate-900 via-indigo-900/30 to-purple-900/20",
    release: "from-slate-900 via-red-900/30 to-orange-900/20",
    peace: "from-slate-900 via-cyan-900/30 to-blue-900/20",
  };

  const gradient = gradients[theme] || gradients.calm;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradient} relative overflow-hidden`}>
      {/* Ambient glow overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40 pointer-events-none" />
      
      {/* Floating particles */}
      <Particles count={30} theme={theme} />
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CinematicContainer;

