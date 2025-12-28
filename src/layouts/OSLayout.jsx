import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User } from "lucide-react";
import LogoWC from "@/assets/LogoWC.png";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSessionMemory } from "@/hooks/useSessionMemory";

// Phase 70: Universal Navigation System
import { NavigationProvider } from "@/navigation/NavigationContext";
import { OSPageChrome } from "@/components/nav/OSPageChrome";

// Feature flags
import { featureFlags } from "@/config/featureFlags";

// Navigation history tracking
import { navPush } from "@/navigation/navHistory";

// Auth context for guest mode detection
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

// C1: Global constants for safe area calculations
const BOTTOM_NAV_HEIGHT = 88; // px

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

const OSLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useSessionIdentity();

  useUserSettings(); // hydrate & persist settings
  useSessionMemory(); // remember route visits

  useEffect(() => {
    navPush(location.pathname);
  }, [location.pathname]);

  // Live session state (default to false)
  const isLiveSessionActive = false;

  // Guest mode detection
  const isGuest = !user && identity.mode === "guest";

  const isActivePath = (tabPath) => {
    if (!tabPath) return false;

    if (tabPath === "/" && (location.pathname === "/" || location.pathname.startsWith("/chat"))) {
      return true;
    }

    if (
      tabPath === "/explore" &&
      (location.pathname.startsWith("/explore") ||
        location.pathname.startsWith("/tools") ||
        location.pathname.startsWith("/recovery") ||
        location.pathname.startsWith("/milestones") ||
        location.pathname.startsWith("/agents"))
    ) {
      return true;
    }

    if (
      tabPath === "/assistance" &&
      (location.pathname.startsWith("/assistance") ||
        location.pathname.startsWith("/workspace/real-help") ||
        location.pathname.startsWith("/directory"))
    ) {
      return true;
    }

    if (tabPath === "/dashboard" && location.pathname.startsWith("/dashboard")) {
      return true;
    }

    if (
      tabPath === "/profile" &&
      (location.pathname.startsWith("/profile") ||
        location.pathname.startsWith("/onboarding") ||
        location.pathname.startsWith("/settings"))
    ) {
      return true;
    }

    return location.pathname === tabPath;
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Guest banner */}
      {isGuest && (
        <div className="flex items-center justify-between gap-3 bg-yellow-500/10 text-yellow-200 text-xs px-4 py-1.5 border-b border-yellow-500/20">
          <span className="truncate">Guest mode</span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="shrink-0 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-3 py-0.5 text-[11px] font-medium hover:bg-yellow-300/20 transition"
          >
            Sign in
          </button>
        </div>
      )}

      {/* TOP BAR — C1: treat as a BAR, not a rounded panel (no glass-panel) */}
      <header className="relative z-50 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl px-4 py-2 sm:px-6 sm:py-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0"
          >
            {LogoWC ? (
              <img
                src={LogoWC}
                alt="WellnessCafe"
                className="h-8 w-8 rounded-full border border-amber-400/40 bg-black/30 object-contain"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-black/30 text-xs font-semibold tracking-[0.12em]">
                WC
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left min-w-0">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300 truncate">
                WellnessCafe OS
              </span>
              <span className="text-[11px] text-white/60 truncate">
                Luxury recovery operating system
              </span>
            </div>
          </button>
        </div>

        {/* Center spacer */}
        <div className="min-w-0" />

        {/* Right cluster — C1: no overlaps */}
        <div className="flex items-center gap-2 shrink-0">
          {featureFlags.showEmotionTelemetry && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 shrink-0" />
              <span className="text-white/70 whitespace-nowrap truncate max-w-[92px]">Emotion</span>
            </div>
          )}

          {featureFlags.showAnonymousBadge && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] sm:text-xs shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-white/70 whitespace-nowrap truncate max-w-[120px]">
                Anonymous
              </span>
            </div>
          )}

          {featureFlags.showLiveSessionStatus && isLiveSessionActive && (
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <div className="flex flex-col items-end min-w-0">
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/50 truncate">
                  LIVE SESSION
                </span>
                <span className="text-xs text-amber-200/90 truncate">
                  Living Guide Online
                </span>
              </div>
              <div className="h-8 w-px bg-white/10 shrink-0" />
            </div>
          )}
        </div>
      </header>

      {/* MAIN — C1 bottom safe padding so nav never overlaps */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))` }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <Outlet />
        </NavigationProvider>
      </main>

      {/* BOTTOM NAV — C1: BAR (no glass-panel rounding) */}
      <nav className="relative z-50 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-1 py-2 sm:py-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActivePath(tab.path);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] sm:text-xs transition
                  ${active ? "bg-amber-400/10 text-amber-200" : "text-white/50 hover:bg-white/5 hover:text-white"}
                `}
              >
                <div className="relative mb-0.5 flex h-5 w-5 items-center justify-center sm:h-5 sm:w-5">
                  <Icon className={`h-4 w-4 ${active ? "text-amber-300" : "text-white/60"}`} />
                  {active && (
                    <span className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-amber-300/80" />
                  )}
                </div>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default OSLayout;
