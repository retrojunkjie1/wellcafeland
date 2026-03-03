// Phase 55: Single experience shell — no fragmented layout
// Full height, flex column, overflow hidden

import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSessionMemory } from "@/hooks/useSessionMemory";
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

import { NavigationProvider } from "@/navigation/NavigationContext";
import { OSPageChrome } from "@/components/nav/OSPageChrome";
import { navPush } from "@/navigation/navHistory";
import { KillSwitchGate } from "@/components/routing/KillSwitchGate";
import GodEyeDrawer from "@/components/os/GodEyeDrawer";
import { EmulatorStatusPill } from "@/components/system/EmulatorStatusPill";
import AppTopBar from "@/components/system/AppTopBar";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

const isChatRoute = (path) => path === "/" || path.startsWith("/chat");

export default function ExperienceShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const identity = useSessionIdentity();

  useUserSettings();
  useSessionMemory();

  useEffect(() => {
    navPush(location.pathname);
  }, [location.pathname]);

  const isAuthenticated = Boolean(user);
  const authReady = !authLoading && !identity.isLoading;
  const isGuest = authReady && !isAuthenticated && identity.mode === "guest";
  const chatRoute = isChatRoute(location.pathname);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[ExperienceShell] Auth:", { hasUser: !!user, isGuest });
    }
  }, [user, isGuest]);

  const isActivePath = (tabPath) => {
    if (!tabPath) return false;
    if (tabPath === "/" && (location.pathname === "/" || location.pathname.startsWith("/chat"))) return true;
    if (tabPath === "/explore" && (location.pathname.startsWith("/explore") || location.pathname.startsWith("/tools") || location.pathname.startsWith("/recovery"))) return true;
    if (tabPath === "/assistance" && (location.pathname.startsWith("/assistance") || location.pathname.startsWith("/resources") || location.pathname.startsWith("/workspace"))) return true;
    if (tabPath === "/dashboard" && location.pathname.startsWith("/dashboard")) return true;
    if (tabPath === "/profile" && location.pathname.startsWith("/profile")) return true;
    return location.pathname === tabPath;
  };

  const mainPadBottom = chatRoute
    ? "calc(var(--wc-composer-h, 84px) + var(--wc-bottom-nav-h, 72px) + env(safe-area-inset-bottom))"
    : "calc(var(--wc-bottom-nav-h, 72px) + env(safe-area-inset-bottom))";

  return (
    <div
      className="flex flex-col overflow-hidden bg-slate-950 text-white wc-app-shell"
      style={{ height: "100dvh" }}
    >
      {/* Global header — single AppTopBar, no overlap */}
      <AppTopBar isGuest={isGuest} isAuthenticated={isAuthenticated} user={user} />

      {/* MainSurface */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{ backgroundColor: "var(--wc-glass)", padding: "24px", paddingBottom: mainPadBottom }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <Outlet />
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      {/* ComposerDock slot — ChatPanel portals into #wc-composer-dock when on chat */}
      {chatRoute && <div id="wc-composer-dock" data-wc-composer-dock="1" className="wc-composer-dock" />}

      {/* BottomNav — fixed once */}
      <nav
        className="fixed left-0 right-0 bottom-0 border-t border-white/10 bg-white/5 backdrop-blur-xl px-2 z-50"
        style={{ height: "var(--wc-bottom-nav-h, 72px)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-3xl justify-between items-center h-full min-h-0 py-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = isActivePath(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 h-11 min-w-11 rounded-xl text-[10px] transition ${active ? "bg-amber-400/10 text-amber-200" : "text-white/40 hover:text-white/60"}`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-amber-300" : "text-white/50"}`} />
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <EmulatorStatusPill />
      <GodEyeDrawer />
    </div>
  );
}
