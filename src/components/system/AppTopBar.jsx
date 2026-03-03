// Phase 55: Single global header — brand, guest indicator, auth status
// Used by OSLayout and ExperienceShell; no overlap, flex layout

import React from "react";
import { Link } from "react-router-dom";
import { User, LogIn } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";
import logoImage from "@/assets/LogoWC.png";

export default function AppTopBar({ isGuest, isAuthenticated, user }) {
  const showGuestChip = featureFlags.showAnonymousBadge && isGuest;

  return (
    <header
      className="wc-topbar sticky top-0 z-[60] border-b border-white/10 bg-black/40 backdrop-blur-xl"
      role="banner"
    >
      <div className="wc-topbar__row">
        {/* Left rail — brand, truncates */}
        <div className="wc-topbar__left flex items-center gap-2 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 shrink-0"
            aria-label="WellnessCafe OS Home"
          >
            <img
              src={logoImage}
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-medium text-amber-200/90 truncate">
                WELLNESSCAFE OS
              </span>
              <span className="wc-topbar__subtitle text-[10px] text-white/50 truncate hidden sm:block">
                Luxury recovery operating system
              </span>
            </div>
          </Link>
        </div>

        {/* Right rail — auth, status chips */}
        <div className="wc-topbar__right">
          {showGuestChip && (
            <div
              className="wc-chip wc-chip--guest flex items-center justify-center"
              aria-label="Guest mode"
            >
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="wc-chip-label">Guest</span>
            </div>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="wc-chip flex items-center gap-2 hover:bg-white/10 transition"
              aria-label="Account"
            >
              <User className="h-4 w-4 shrink-0 text-white/70" />
              <span className="wc-chip-label truncate max-w-[140px]">
                {user?.email?.split("@")[0] || user?.displayName || "Account"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="wc-chip flex items-center gap-2 hover:bg-white/10 transition"
              aria-label="Sign in"
            >
              <LogIn className="h-4 w-4 shrink-0 text-white/70" />
              <span className="wc-chip-label">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
