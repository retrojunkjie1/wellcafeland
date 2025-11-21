// src/components/Logo.jsx

import React from "react";

const Logo = ({ variant = "default", className = "", showText = true, size = "md" }) => {
  // Size variants - made larger
  const sizes = {
    sm: { icon: "h-12 w-12", text: "text-sm", container: "gap-2" },
    md: { icon: "h-20 w-20", text: "text-lg", container: "gap-3" },
    lg: { icon: "h-28 w-28", text: "text-2xl", container: "gap-4" },
    xl: { icon: "h-36 w-36", text: "text-3xl", container: "gap-5" },
  };

  const sizeClasses = sizes[size] || sizes.md;

  // Color variants - gold/beige for dark, dark for light
  const isDark = variant === "dark" || variant === "default";
  const iconColor = isDark ? "text-amber-300" : "text-slate-900";
  const textColor = isDark ? "text-amber-300" : "text-slate-900";

  return (
    <div className={`flex flex-col items-center ${sizeClasses.container} ${className}`}>
      {/* Logo Icon: Cup facing right, Mountains, Waves - Exact match to your design */}
      <svg
        className={`${sizeClasses.icon} ${iconColor}`}
        viewBox="0 0 140 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Waves (bottom layer - two horizontal wavy lines, extending wider) */}
        <path
          d="M20 140 Q30 135, 40 140 T60 140 T80 140 T100 140 T120 140"
          stroke="currentColor"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M15 150 Q25 145, 35 150 T55 150 T75 150 T95 150 T105 150 T125 150"
          stroke="currentColor"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Mountains (two peaks, left taller and more prominent) */}
        <path
          d="M30 100 L50 50 L70 100"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60 100 L75 70 L90 100"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Coffee Cup (facing right, resting on mountains) */}
        <path
          d="M45 25 L45 95 L95 95 L95 25"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Cup handle (on the right side) */}
        <path
          d="M95 40 L105 40 Q110 40, 110 50 Q110 60, 105 60 L95 60"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Steam (wavy plume from top-left of cup) */}
        <path
          d="M50 20 Q48 10, 45 5 Q42 0, 40 5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Text - Elegant serif font, all caps with É accent */}
      {showText && (
        <span className={`${sizeClasses.text} ${textColor} font-serif font-normal tracking-wide`}>
          WELLNESSCAFÉ
        </span>
      )}
    </div>
  );
};

export default Logo;
