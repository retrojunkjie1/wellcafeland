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
import DockWithVoice from "@/components/interaction/DockWithVoice";
import BottomRail, { railNavClass, railCardClass } from "@/components/layout/BottomRail";
import { AudioProvider } from "@/experience/audio/AudioProvider";
import { VoiceSessionProvider } from "@/experience/voice/VoiceSessionProvider";
import { useOSStore } from "@/stores/useOSStore";
import { setTheme } from "@/theme/themeStore";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

const isChatRoute = (path) => path === "/" || path.startsWith("/chat");
const isToolDetailRoute = (path) =>
  path.startsWith("/tools/") &&
  path !== "/tools/classic" &&
  path.split("/").filter(Boolean).length > 1;

export default function ExperienceShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const identity = useSessionIdentity();
  const themeMode = useOSStore((state) => state.settings.themeMode);
  const interfaceDensity = useOSStore((state) => state.settings.interfaceDensity);

  useUserSettings();
  useSessionMemory();

  useEffect(() => {
    if (themeMode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: light)");
      const applySystemTheme = () => setTheme(media.matches ? "light" : "dark");
      applySystemTheme();
      media.addEventListener?.("change", applySystemTheme);
      return () => media.removeEventListener?.("change", applySystemTheme);
    }
    setTheme(themeMode === "dawn" ? "light" : "dark");
  }, [themeMode]);

  useEffect(() => {
    navPush(location.pathname);
  }, [location.pathname]);

  const isAuthenticated = Boolean(user);
  const authReady = !authLoading && !identity.isLoading;
  const isGuest = authReady && !isAuthenticated && identity.mode === "guest";
  const chatRoute = isChatRoute(location.pathname);
  const toolDetailRoute = isToolDetailRoute(location.pathname);
  const showUnifiedDock = !chatRoute && !toolDetailRoute;
  const showBottomNav = !toolDetailRoute;
  const showBottomRail = showUnifiedDock || showBottomNav;
  const enableExperienceProviders = !chatRoute && !toolDetailRoute;

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
    : showBottomRail
      ? "calc(var(--wc-bottom-nav-h, 72px) + 64px + 12px + env(safe-area-inset-bottom))"
      : "calc(120px + env(safe-area-inset-bottom))";

  const shellContent = (
    <div
      className="flex flex-col overflow-hidden bg-slate-950 text-white wc-app-shell"
      style={{ height: "100dvh" }}
    >
      {/* Global header — single AppTopBar, no overlap */}
      <AppTopBar isGuest={isGuest} isAuthenticated={isAuthenticated} user={user} />

      {/* MainSurface */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{ backgroundColor: "var(--wc-glass)", padding: interfaceDensity === "compact" ? "16px" : "24px", paddingBottom: mainPadBottom }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <Outlet />
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      {/* Phase 55A.2: BottomRail — slot-aware: Dock (optional) + Nav; chat = Nav only */}
      {showBottomRail && (
        <BottomRail>
          {!chatRoute && showUnifiedDock && (
            <BottomRail.Dock>
              <DockWithVoice />
            </BottomRail.Dock>
          )}
          <BottomRail.Nav>
            {chatRoute ? (
              <div className={`${railCardClass} flex flex-col overflow-hidden`}>
                <div id="wc-composer-dock" data-wc-composer-dock="1" className="w-full wc-composer-in-rail flex-shrink-0" />
                <nav
                  className="flex justify-between items-center h-14 min-h-[var(--wc-bottom-nav-h,72px)] px-2 py-1.5 border-t border-white/10"
                  style={{ minHeight: "var(--wc-bottom-nav-h, 72px)" }}
                  aria-label="Main navigation"
                >
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
                </nav>
              </div>
            ) : (
              <nav
                className={`${railNavClass} flex justify-between items-center h-14 min-h-[var(--wc-bottom-nav-h,72px)] px-2 py-1.5`}
                style={{ minHeight: "var(--wc-bottom-nav-h, 72px)" }}
                aria-label="Main navigation"
              >
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
              </nav>
            )}
          </BottomRail.Nav>
        </BottomRail>
      )}

      <EmulatorStatusPill />
      <GodEyeDrawer />
    </div>
  );

  if (enableExperienceProviders) {
    return (
      <AudioProvider>
        <VoiceSessionProvider>
          {shellContent}
        </VoiceSessionProvider>
      </AudioProvider>
    );
  }
  return shellContent;
}
