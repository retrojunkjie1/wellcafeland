import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSessionMemory } from "@/hooks/useSessionMemory";
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

// Navigation
import { NavigationProvider } from "@/navigation/NavigationContext";
import { OSPageChrome } from "@/components/nav/OSPageChrome";
import AppDock from "@/components/nav/AppDock";
import { navPush } from "@/navigation/navHistory";
import { KillSwitchGate } from "@/components/routing/KillSwitchGate";
import GodEyeDrawer from "@/components/os/GodEyeDrawer";
import { EmulatorStatusPill } from "@/components/system/EmulatorStatusPill";
import AppTopBar from "@/components/system/AppTopBar";
import { SheetProvider, useSheet } from "@/context/SheetContext";

export default function OSLayout() {
  const location = useLocation();
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

  return (
    <SheetProvider>
      <OSLayoutContent
        isGuest={isGuest}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </SheetProvider>
  );
}

function OSLayoutContent({ isGuest, isAuthenticated, user }) {
  const { sheetOpen } = useSheet();
  const rootClass = "flex h-screen flex-col bg-slate-950 text-white overflow-x-hidden wc-app-shell [--wc-topbar-h:72px] [--wc-dock-h:76px]" + (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true" ? " wc-emulator-active" : "") + (sheetOpen ? " wc-sheet-open" : "");
  return (
    <div className={rootClass}>
      {/* Global header — single AppTopBar, no overlap */}
      <AppTopBar isGuest={isGuest} isAuthenticated={isAuthenticated} user={user} />

      {/* Main */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden wc-shell-pad-bottom"
        style={{ backgroundColor: "var(--wc-glass)" }}
      >
        <NavigationProvider>
          <OSPageChrome />
          <KillSwitchGate>
            <Outlet />
          </KillSwitchGate>
        </NavigationProvider>
      </main>

      {/* Emulator status pill — Phase 54C3: quiet, dismissible, above nav */}
      <EmulatorStatusPill />

      {/* Bottom Nav — AppDock: fixed, safe-area aware */}
      <AppDock />

      {/* God-Eye diagnostics - visible only when wc_debug=1 */}
      <GodEyeDrawer />
    </div>
  );
}

