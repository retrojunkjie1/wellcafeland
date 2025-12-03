// src/components/tools/Particles.jsx
// Floating particle animation background
// Phase 36B: OS Integration

import React from "react";

const Particles = ({ count = 30, theme = "calm" }) => {
  const particles = Array.from({ length: count }, (_, i) => i);

  const getParticleColor = () => {
    const colors = {
      calm: ["rgba(251, 191, 36, 0.3)", "rgba(20, 184, 166, 0.3)", "rgba(255, 255, 255, 0.2)"],
      focus: ["rgba(99, 102, 241, 0.3)", "rgba(147, 51, 234, 0.3)", "rgba(255, 255, 255, 0.2)"],
      release: ["rgba(239, 68, 68, 0.3)", "rgba(251, 146, 60, 0.3)", "rgba(255, 255, 255, 0.2)"],
      peace: ["rgba(34, 211, 238, 0.3)", "rgba(59, 130, 246, 0.3)", "rgba(255, 255, 255, 0.2)"],
    };
    const themeColors = colors[theme] || colors.calm;
    return themeColors[Math.floor(Math.random() * themeColors.length)];
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => {
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 15;
        const animationDelay = Math.random() * 5;
        const opacity = Math.random() * 0.4 + 0.2;

        return (
          <div
            key={p}
            className="absolute rounded-full animate-float"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: getParticleColor(),
              opacity,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(15px, -20px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate(10px, -40px) scale(1.2);
            opacity: 0.6;
          }
          75% {
            transform: translate(-10px, -20px) scale(1.1);
            opacity: 0.4;
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Particles;

