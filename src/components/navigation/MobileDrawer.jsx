// src/components/navigation/MobileDrawer.jsx

import React, { useState } from "react";

const MobileDrawer = ({ open, onClose, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ease-out md:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute inset-y-0 left-0 bg-slate-950/95 border-r border-white/10 shadow-2xl transition-all duration-300 ease-out ${
          open
            ? isHovered
              ? "w-[70vw] max-w-[280px] translate-x-0"
              : "w-[60vw] max-w-[240px] translate-x-0"
            : "-translate-x-full w-[70vw] max-w-[280px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white">
              Menu
            </p>
            <button
              type="button"
              className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] text-white/70 hover:text-white hover:bg-white/10 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-12">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;

