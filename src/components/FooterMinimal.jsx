// src/components/FooterMinimal.jsx

import React from "react";
import { Link } from "react-router-dom";

const links = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Cookie Notice", to: "/cookies" },
];

const FooterMinimal = () => {
  return (
    <footer className="border-t border-white/5 bg-background/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 py-3 text-[10px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span className="uppercase tracking-[0.2em] text-white/60 text-[9px]">
            WellnessCafe
          </span>
          <div className="flex flex-wrap items-center gap-3 text-[10px]">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-white/80 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterMinimal;

