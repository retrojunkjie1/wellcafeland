// Phase 55: Single experience shell — no fragmented layout
// Full height, flex column, overflow hidden

import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
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
import BottomRail, { railCardClass } from "@/components/layout/BottomRail";
import { AudioProvider } from "@/experience/audio/AudioProvider";
import { VoiceSessionProvider } from "@/experience/voice/VoiceSessionProvider";
import { useOSStore } from "@/stores/useOSStore";
import { setTheme } from "@/theme/themeStore";

const isChatRoute = (path) => path === "/" || path.startsWith("/chat");
const isToolDetailRoute = (path) =>
  path.startsWith("/tools/") &&
  path !== "/tools/classic" &&
  path.split("/").filter(Boolean).length > 1;

export default function ExperienceShell() {
  const location = useLocation();
  const { user, loading: authLoading, logout } = useAuth();
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
  const verificationRoute = ["/verify-email", "/login", "/signup"].includes(location.pathname);
  const mustVerifyEmail = authReady && user && !user.isAnonymous && user.emailVerified === false;
  const isGuest = authReady && !isAuthenticated && identity.mode === "guest";
  const chatRoute = isChatRoute(location.pathname);
  const toolDetailRoute = isToolDetailRoute(location.pathname);
  // Keep one persistent action surface: the composer belongs to chat only.
  // Navigation and optional actions live in the compact top-bar menu.
  const showBottomRail = chatRoute;
  const enableExperienceProviders = !chatRoute && !toolDetailRoute;

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug("[ExperienceShell] Auth:", { hasUser: !!user, isGuest });
    }
  }, [user, isGuest]);

  if (mustVerifyEmail && !verificationRoute) {
    const destination = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    return <Navigate to="/verify-email" replace state={{ email: user.email, destination }} />;
  }

  const mainPadBottom = chatRoute
    ? "calc(var(--wc-composer-h, 84px) + 24px + env(safe-area-inset-bottom))"
    : "calc(24px + env(safe-area-inset-bottom))";

  const shellContent = (
    <div
      className="flex flex-col overflow-hidden wc-app-shell"
      style={{ height: "100dvh" }}
    >
      {/* Global header — single AppTopBar, no overlap */}
      <AppTopBar isGuest={isGuest} isAuthenticated={isAuthenticated} user={user} onLogout={logout} />

      {/* MainSurface */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
        data-density={interfaceDensity === "compact" ? "compact" : "cozy"}
        style={{ backgroundColor: "var(--wc-glass)", padding: interfaceDensity === "compact" ? "16px" : "24px", paddingBottom: mainPadBottom }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <Outlet />
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      {/* ChatGPT-style focus: keep the composer anchored; navigation stays in the header menu. */}
      {showBottomRail && (
        <BottomRail>
          <BottomRail.Nav>
            <div className={`${railCardClass} flex flex-col overflow-hidden wc-chat-composer-rail`}>
              <div id="wc-composer-dock" data-wc-composer-dock="1" className="w-full wc-composer-in-rail flex-shrink-0" />
            </div>
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
