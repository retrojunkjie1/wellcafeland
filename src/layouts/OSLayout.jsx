import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User } from "lucide-react";
import LogoWC from "@/assets/LogoWC.png";

import { useUserSettings } from "@/hooks/useUserSettings";
import { useSessionMemory } from "@/hooks/useSessionMemory";
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

// Navigation
import { NavigationProvider } from "@/navigation/NavigationContext";
import { OSPageChrome } from "@/components/nav/OSPageChrome";
import { navPush } from "@/navigation/navHistory";
import { featureFlags } from "@/config/featureFlags";
import { KillSwitchGate } from "@/components/routing/KillSwitchGate";
import GodEyeDrawer from "@/components/os/GodEyeDrawer";

// C1: Global constants for safe area calculations
const BOTTOM_NAV_HEIGHT = 60;

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

export default function OSLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const identity = useSessionIdentity();

  // Hydration layers
  useUserSettings();
  useSessionMemory();

  // Track navigation history
  useEffect(() => {
    navPush(location.pathname);
  }, [location.pathname]);

  // C1 RULE: AUTH IS THE SOURCE OF TRUTH
  const isAuthenticated = Boolean(user);
  // Anonymous badge must ONLY render when:
  // - auth is resolved (not loading)
  // - AND user === null
  // - AND identity.mode === "guest"
  const authReady = !authLoading && !identity.isLoading;
  const isGuest = authReady && !isAuthenticated && identity.mode === "guest";

  // Debug logging (dev only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[OSLayout] Auth state:", {
        hasUser: !!user,
        userEmail: user?.email || null,
        identityMode: identity.mode,
        isGuest,
      });
    }
  }, [user, identity.mode, isGuest]);

  const isActivePath = (tabPath) => {
    if (!tabPath) return false;

    if (tabPath === "/" && (location.pathname === "/" || location.pathname.startsWith("/chat"))) {
      return true;
    }

    if (
      tabPath === "/explore" &&
      (location.pathname.startsWith("/explore") ||
        location.pathname.startsWith("/tools") ||
        location.pathname.startsWith("/recovery"))
    ) {
      return true;
    }

    if (
      tabPath === "/assistance" &&
      (location.pathname.startsWith("/assistance") ||
        location.pathname.startsWith("/resources") ||
        location.pathname.startsWith("/workspace"))
    ) {
      return true;
    }

    if (tabPath === "/dashboard" && location.pathname.startsWith("/dashboard")) {
      return true;
    }

    if (tabPath === "/profile" && location.pathname.startsWith("/profile")) {
      return true;
    }

    return location.pathname === tabPath;
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white overflow-x-hidden">
      {/* Guest Banner */}
      {isGuest && (
        <div className="flex items-center justify-between bg-yellow-500/10 text-yellow-600 text-xs px-4 py-1.5 border-b border-yellow-500/20">
          <span>Guest mode</span>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-yellow-600/40 bg-yellow-600/10 px-3 py-0.5 text-[11px] font-medium hover:bg-yellow-600/20 transition"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Top App Bar */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-1.5 h-[48px]">
        {/* Left */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img
            src={LogoWC}
            alt="WellnessCafe"
            className="h-7 w-7 rounded-full border border-amber-400/40 bg-black/40 object-contain"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs uppercase tracking-[0.18em] text-amber-300">
              WellnessCafe OS
            </span>
            <span className="text-[11px] text-white/60">
              Luxury recovery operating system
            </span>
          </div>
        </button>

        <div />

        {/* Right */}
        <div className="flex items-center gap-2">
          {featureFlags.showAnonymousBadge && isGuest && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/70">Anonymous</span>
            </div>
          )}
          {isAuthenticated && user?.email && (
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-white/70">{user.email.split("@")[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
          backgroundColor: "var(--wc-glass)",
        }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <Outlet />
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      {/* Bottom Nav */}
      <nav className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl justify-between py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActivePath(tab.path);

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition ${
                  active
                    ? "bg-amber-400/10 text-amber-200"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-amber-300" : "text-white/50"}`} />
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* God-Eye diagnostics - visible only when wc_debug=1 */}
      <GodEyeDrawer />
    </div>
  );
}
