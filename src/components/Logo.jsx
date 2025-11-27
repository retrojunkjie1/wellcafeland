// src/components/Logo.jsx
// Luxury logo component using LogoWC.png

import React from "react";
import logoImage from "@/assets/LogoWC.png";

const Logo = ({ variant = "default", className = "", showText = true, size = "md" }) => {
  // Size variants - luxury sizing
  const sizes = {
    sm: { icon: "h-12 w-12", text: "text-sm", container: "gap-2" },
    md: { icon: "h-20 w-20", text: "text-lg", container: "gap-3" },
    lg: { icon: "h-32 w-32", text: "text-2xl", container: "gap-4" },
    xl: { icon: "h-40 w-40", text: "text-3xl", container: "gap-5" },
  };

  const sizeClasses = sizes[size] || sizes.md;

  // Color variants - gold/beige for dark, dark for light
  const isDark = variant === "dark" || variant === "default";
  const textColor = isDark ? "text-amber-300" : "text-slate-900";

  return (
    <div className={`flex flex-col items-center ${sizeClasses.container} ${className}`}>
      {/* Logo Image - Luxury styling with subtle glow */}
      <div className={`${sizeClasses.icon} relative`}>
        <img
          src={logoImage}
          alt="WellnessCafe"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            filter: isDark 
              ? "drop-shadow(0 4px 12px rgba(251, 191, 36, 0.2))" 
              : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))",
          }}
          onError={(e) => {
            // Fallback if image fails to load
            console.warn("LogoWC.png failed to load - please restore the original file");
            e.target.style.display = 'none';
          }}
        />
      </div>

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
