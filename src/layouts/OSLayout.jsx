// src/layouts/OSLayout.jsx

import React from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { MessageCircle, Compass, LayoutDashboard, User2 } from "lucide-react";

import wcLogo from "@/assets/LogoWC.png";

/**
 * Luxury WellnessCafe OS Shell
 *
 * - Fullscreen radial-gradient background
 * - Glass sidebar on desktop
 * - Bottom nav on mobile
 * - Centered content frame with soft borders & blur
 */
const OSLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (pathPrefix) => {
    return location.pathname === pathPrefix || location.pathname.startsWith(pathPrefix);
  };

  const navItems = [
    { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
    { id: "explore", label: "Explore", icon: Compass, path: "/explore" },
    { id: "dashboard", label: "Signals", icon: LayoutDashboard, path: "/dashboard" },
    { id: "profile", label: "Profile", icon: User2, path: "/profile" },
  ];

  const handleNavClick = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* Luxury ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.15),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.15),_transparent_55%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(15,23,42,0.9),rgba(15,23,42,0.98))]" />
      </div>

      {/* Main layout container */}
      <div className="relative z-10 flex h-full w-full">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-white/10 bg-white/5/0 backdrop-blur-xl">
          {/* Brand / logo */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/10">
            <div className="h-9 w-9 rounded-2xl bg-black/60 border border-amber-400/40 flex items-center justify-center overflow-hidden">
              {/* Logo image – fallback to WC text if missing */}
              {wcLogo ? (
                <img
                  src={wcLogo}
                  alt="WellnessCafe"
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <span className="text-sm font-semibold tracking-[0.3em]">
                  WC
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-amber-300">
                WellnessCafe OS
              </span>
              <span className="text-[11px] text-white/60">
                Living Recovery Console
              </span>
            </div>
          </div>

          {/* Primary nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  className={[
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-amber-400/15 border border-amber-400/60 text-amber-50 shadow-[0_0_32px_rgba(251,191,36,0.35)]"
                      : "bg-white/5/0 border border-white/5 text-white/70 hover:bg-white/5 hover:border-white/15 hover:text-white"
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg border text-xs",
                      active
                        ? "border-amber-300/80 bg-gradient-to-br from-amber-300/30 to-amber-500/30 text-amber-50"
                        : "border-white/10 bg-slate-900/50 text-white/70 group-hover:border-white/20"
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer / status */}
          <div className="px-4 pb-5 pt-3 border-t border-white/10">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-[11px] leading-relaxed text-white/60">
              <div className="flex items-center justify-between mb-1">
                <span className="uppercase tracking-[0.22em] text-[10px] text-white/40">
                  Status
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-400/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p>Signals, tools, and spaces are ready whenever you are.</p>
            </div>
          </div>
        </aside>

        {/* Main content column */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Top header (mobile + desktop) */}
          <header className="flex items-center justify-between gap-3 px-3 sm:px-6 pt-3 sm:pt-4 pb-2 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
            {/* Left: mini brand for mobile */}
            <div className="flex items-center gap-2">
              <div className="md:hidden h-8 w-8 rounded-2xl bg-black/60 border border-amber-400/40 flex items-center justify-center overflow-hidden">
                {wcLogo ? (
                  <img
                    src={wcLogo}
                    alt="WC"
                    className="h-6 w-6 object-contain"
                  />
                ) : (
                  <span className="text-[10px] font-semibold tracking-[0.3em]">
                    WC
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-[0.28em] text-amber-200">
                  Living Guide
                </span>
                <span className="text-[11px] text-white/60">
                  Multimodal Recovery • Emotional Telemetry • Real Help
                </span>
              </div>
            </div>

            {/* Right: subtle pill */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[11px] text-white/70 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session active</span>
              </div>
            </div>
          </header>

          {/* Content frame */}
          <main className="relative flex-1 overflow-hidden">
            <div className="h-full w-full overflow-y-auto">
              {/* Centered content with max width */}
              <div className="mx-auto h-full w-full max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
                <div className="relative h-full rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_0_60px_rgba(15,23,42,0.9)]">
                  {/* Soft inner gradient */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_55%)] opacity-80" />

                  {/* Actual routed content */}
                  <div className="relative z-10 h-full flex flex-col">
                    <Outlet />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Mobile bottom nav */}
          <nav className="md:hidden sticky bottom-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-2.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.path)}
                    className="flex flex-col items-center gap-1 text-[11px]"
                  >
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-xl border text-xs transition",
                        active
                          ? "border-amber-300 bg-amber-400/20 text-amber-50 shadow-[0_0_22px_rgba(251,191,36,0.55)]"
                          : "border-white/10 bg-black/60 text-white/60"
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={[
                        "transition",
                        active ? "text-amber-100" : "text-white/50"
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default OSLayout;
