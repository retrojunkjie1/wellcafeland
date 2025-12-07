import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User } from "lucide-react";
import LogoWC from "@/assets/LogoWC.png";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSessionMemory } from "@/hooks/useSessionMemory";

const TABS = [
  {
    id: "home",
    label: "Home",
    path: "/",
    icon: Home,
  },
  {
    id: "explore",
    label: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    id: "assistance",
    label: "Assistance",
    path: "/assistance",
    icon: LifeBuoy,
  },
  {
    id: "signals",
    label: "Signals",
    path: "/dashboard",
    icon: Activity,
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: User,
  },
];

const OSLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useUserSettings(); // Phase 34: hydrate & persist settings
  useSessionMemory(); // Phase 44: remember route visits

  const isActivePath = (tabPath) => {
    if (!tabPath) return false;
    // Home: treat "/" and "/chat" as active
    if (tabPath === "/" && (location.pathname === "/" || location.pathname.startsWith("/chat"))) {
      return true;
    }
    // Explore: /explore or /directory or /tools etc
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
    // Assistance: /assistance or /workspace/real-help or /directory (help domains)
    if (
      tabPath === "/assistance" &&
      (location.pathname.startsWith("/assistance") ||
        location.pathname.startsWith("/workspace/real-help") ||
        location.pathname.startsWith("/directory"))
    ) {
      return true;
    }
    // Signals: /dashboard (main signals view)
    if (tabPath === "/dashboard" && location.pathname.startsWith("/dashboard")) {
      return true;
    }
    // Profile: /profile and simple account pages
    if (
      tabPath === "/profile" &&
      (location.pathname.startsWith("/profile") ||
        location.pathname.startsWith("/onboarding") ||
        location.pathname.startsWith("/settings"))
    ) {
      return true;
    }
    // Fallback exact match
    return location.pathname === tabPath;
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      {/* Top App Bar */}
      <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-2 sm:px-6 sm:py-3 backdrop-blur">
        {/* Left: Logo/Home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          {LogoWC ? (
            <img
              src={LogoWC}
              alt="WellnessCafe"
              className="h-8 w-8 rounded-full border border-amber-400/40 bg-black/40 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-black/40 text-xs font-semibold tracking-[0.12em]">
              WC
            </div>
          )}
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
              WellnessCafe OS
            </span>
            <span className="text-[11px] text-white/60">
              Luxury recovery operating system
            </span>
          </div>
        </button>

        {/* Right: current mode stub (can be wired later) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">
              LIVE SESSION
            </span>
            <span className="text-xs text-amber-200/90">Living Guide Online</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/70">Anonymous</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t border-white/10 bg-slate-950/95 backdrop-blur-md px-2 pb-[env(safe-area-inset-bottom)]">
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
                  ${
                    active
                      ? "bg-amber-400/10 text-amber-200"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <div className="relative mb-0.5 flex h-5 w-5 items-center justify-center sm:h-5 sm:w-5">
                  <Icon
                    className={`h-4 w-4 ${
                      active ? "text-amber-300" : "text-white/60"
                    }`}
                  />
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
