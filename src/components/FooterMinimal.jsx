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
    <footer className="border-t border-border/40 bg-background/80">
      <div className="lux-shell">
        <div className="flex flex-col gap-3 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="uppercase tracking-[0.25em] text-foreground/70">
            WellnessCafe
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition-colors hover:text-foreground hover:underline"
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

