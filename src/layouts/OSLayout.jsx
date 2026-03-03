import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User, Shield } from "lucide-react";
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
import { GodEyeProvider, useGodEye } from "@/admin/godeye/GodEyeContext";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { RouteGuard } from "@/os/RouteGuard";
import { useSmartBack } from "@/lib/useSmartBack";
import AppDock from "@/components/system/AppDock";
import { SheetProvider, useSheet } from "@/context/SheetContext";
import { EmulatorStatusPill } from "@/components/system/EmulatorStatusPill";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];
const ADMIN_TAB = { id: "admin", label: "Admin", path: "/admin", icon: Shield };

export default function OSLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { goBack, canGoBack } = useSmartBack();
  const isHome = location.pathname === "/" || location.pathname === "/chat";
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

    if (tabPath === "/admin" && location.pathname.startsWith("/admin")) {
      return true;
    }

    return location.pathname === tabPath;
  };

  return (
    <GodEyeProvider>
    <SheetProvider>
    <OSLayoutInner
      location={location}
      navigate={navigate}
      isHome={isHome}
      canGoBack={canGoBack}
      goBack={goBack}
      isGuest={isGuest}
      isAuthenticated={isAuthenticated}
      user={user}
      isActivePath={isActivePath}
    />
    </SheetProvider>
    </GodEyeProvider>
  );
}

function OSLayoutInner({
  location,
  navigate,
  isHome,
  canGoBack,
  goBack,
  isGuest,
  isAuthenticated,
  user,
  isActivePath,
}) {
  const { isAdmin } = useAdminClaim();
  const { toggle: toggleGodEye } = useGodEye();
  const { sheetOpen } = useSheet();

  return (
    <div className={`flex h-screen flex-col bg-slate-950 text-white overflow-x-hidden [--wc-topbar-h:72px] [--wc-dock-h:76px] ${sheetOpen ? "wc-sheet-open" : ""}`}>
      {/* Guest Banner */}
      {isGuest && (
        <div className="flex items-center justify-between bg-yellow-500/10 text-yellow-600 text-xs px-4 py-1.5 border-b border-yellow-500/20">
          <span className="hidden sm:inline">Guest mode</span>
          <button
            onClick={() => navigate("/login")}
            className="rounded-full border border-yellow-600/40 bg-yellow-600/10 p-2 sm:px-3 sm:py-0.5 text-[11px] font-medium hover:bg-yellow-600/20 transition shrink-0"
            aria-label="Sign in"
          >
            <span className="hidden sm:inline">Sign in</span>
            <svg className="h-4 w-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      )}

      {/* Top App Bar — sticky, safe-area, 3-col grid so right never crowds center */}
      <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top)] grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-1.5 min-h-[var(--wc-topbar-h)]">
        {/* Left: Back (when not home) + Home */}
        <div className="flex items-center gap-2 min-w-0">
          {!isHome && canGoBack && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Go back"
              className="flex-shrink-0 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
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
        </div>

        <div className="min-w-0 text-center truncate text-xs text-white/60 px-2">WellnessCafe</div>

        {/* Right cluster — never overflow */}
        <div className="flex items-center justify-end gap-2 min-w-0 flex-wrap max-w-[min(560px,48vw)]">
          {isAdmin && (
            <button
              type="button"
              onClick={toggleGodEye}
              className="shrink-0 flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs text-amber-200 hover:bg-amber-400/20 transition min-h-[44px]"
              aria-label="Toggle God-Eye"
            >
              <span className="text-amber-400">◉</span>
              <span className="hidden sm:inline">God-Eye</span>
            </button>
          )}
          {featureFlags.showAnonymousBadge && isGuest && (
            <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs min-h-[44px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="hidden sm:inline text-white/70">Anonymous</span>
            </div>
          )}
          {isAuthenticated && user?.email && (
            <div className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs min-w-0 max-w-[10rem] sm:max-w-[14rem] truncate min-h-[44px]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-white/70 truncate">{user.email.split("@")[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden os-scrollbar"
        style={{
          paddingBottom: "calc(var(--wc-dock-h,76px) + env(safe-area-inset-bottom))",
          backgroundColor: "var(--wc-glass)",
        }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <RouteGuard routeKey={`route:${location.pathname}`}>
              <Outlet />
            </RouteGuard>
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      <AppDock
        location={location}
        navigate={navigate}
        isActivePath={isActivePath}
        isAdmin={isAdmin}
      />

      <EmulatorStatusPill />

      <GodEyeDrawer />
    </div>
  );
}
