import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useOSStore, MODES } from "@/stores/useOSStore";
import Sidebar from "@/components/os/Sidebar";
import MobileDrawer from "@/components/navigation/MobileDrawer";
import AssistantConsole from "../apps/ai/AssistantConsole";
import FooterMinimal from "@/components/FooterMinimal";
import logoImage from "@/assets/LogoWC.png";

const OSLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { sidebarCollapsed, setMode } = useOSStore();

  // Auto-update mode based on route
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/chat" || location.pathname.startsWith("/chat/")) {
      setMode(MODES.CHAT);
    } else if (location.pathname.startsWith("/workspace/")) {
      setMode(MODES.WORKSPACE);
    } else if (location.pathname.startsWith("/explore")) {
      setMode(MODES.EXPLORE);
    } else if (location.pathname.startsWith("/directory")) {
      setMode(MODES.WORKSPACE); // Directory pages use workspace mode
    }
  }, [location.pathname, setMode]);

  // Check if we're on an OS route (chat, workspace, explore, directory)
  const isOSRoute =
    location.pathname === "/" ||
    location.pathname === "/chat" ||
    location.pathname.startsWith("/workspace/") ||
    location.pathname.startsWith("/explore") ||
    location.pathname.startsWith("/directory");

  // Determine if sidebar should be visible
  // Always show sidebar - full when expanded, minimal when collapsed
  const showFullSidebar = !sidebarCollapsed;
  const showMinimalSidebar = sidebarCollapsed;

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Mobile Drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar isMobile onClose={() => setDrawerOpen(false)} />
      </MobileDrawer>

      {/* Desktop Sidebar - Full or Minimal */}
      <div className="hidden md:block sidebar-transition">
        {showFullSidebar && <Sidebar />}
        {showMinimalSidebar && (
          <div className="w-16 flex flex-col items-center py-4 border-r border-white/5 bg-slate-950/95">
            <button
              type="button"
              onClick={() => useOSStore.getState().toggleSidebar()}
              className="p-2 rounded hover:bg-white/5 text-white/60 hover:text-white transition"
              title="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* OS Routes: full-screen, with mobile menu button */}
        {isOSRoute ? (
          <div className="relative animate-fade-in">
            {/* Home Button - Fixed top-left with WC Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="fixed top-2 left-2 sm:top-4 sm:left-4 z-[60] inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur-sm shadow-lg"
              aria-label="Home"
            >
              <img
                src={logoImage}
                alt="WellnessCafe"
                className="h-4 w-4 sm:h-5 sm:w-5 object-contain drop-shadow-sm"
              />
              <span className="hidden sm:inline text-xs">WellnessCafe</span>
            </button>
            {/* Mobile Menu Button - Fixed top-right */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="fixed top-2 right-2 sm:top-4 sm:right-4 z-[60] md:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition backdrop-blur-sm shadow-lg"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <Outlet />
          </div>
        ) : (
          <>
            {/* Legacy routes: show header and console */}
            <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 md:py-5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 md:hidden"
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
                <div className="flex items-center gap-2">
                  <img
                    src={logoImage}
                    alt="WellnessCafe"
                    className="h-6 w-6 object-contain drop-shadow-sm"
                  />
                  <span className="text-xs font-semibold tracking-[0.35em] text-white/50">
                    WELLNESSCAFE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:text-white hover:border-white/40"
                >
                  Chat
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-3xl px-6 py-8 lg:px-10">
                <Outlet />
                <FooterMinimal />
              </div>
            </main>

            <div className="border-t border-white/5">
              <AssistantConsole />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OSLayout;

