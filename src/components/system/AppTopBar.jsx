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
      className="wc-topbar sticky top-0 z-50 pt-[env(safe-area-inset-top)] border-b border-white/10 bg-black/40 backdrop-blur-xl min-h-[var(--wc-topbar-h)]"
      role="banner"
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-1.5">
        {/* Left rail — brand, truncates */}
        <div className="flex items-center gap-2 min-w-0">
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

        <div className="min-w-0 text-center truncate text-xs text-white/60 px-2">WellnessCafe</div>

        {/* Right cluster — never overflow */}
        <div className="flex items-center justify-end gap-2 min-w-0 flex-wrap max-w-[min(560px,48vw)]">
          {showGuestChip && (
            <div className="shrink-0 wc-chip wc-chip--guest flex items-center justify-center" aria-label="Guest mode">
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="wc-chip-label hidden sm:inline">Guest</span>
            </div>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="shrink-0 wc-chip flex items-center gap-2 hover:bg-white/10 transition min-w-0 max-w-[10rem] sm:max-w-[14rem]"
              aria-label="Account"
            >
              <User className="h-4 w-4 shrink-0 text-white/70" />
              <span className="wc-chip-label truncate">
                {user?.email?.split("@")[0] || user?.displayName || "Account"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="shrink-0 wc-chip flex items-center gap-2 hover:bg-white/10 transition"
              aria-label="Sign in"
            >
              <LogIn className="h-4 w-4 shrink-0 text-white/70" />
              <span className="wc-chip-label hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
