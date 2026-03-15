// Phase 55: Quiet emulator pill — dismissible, above bottom nav
// Replaces red banner; never red; subtle amber

import React, { useState, useEffect } from "react";
import { Server, X } from "lucide-react";

const STORAGE_KEY = "wc_emulator_pill_dismissed";

const isEmulatorMode = () =>
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true";

export function EmulatorPill() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!isEmulatorMode()) return;
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      setDismissed(val === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
      setDismissed(true);
    } catch {}
  };

  if (!isEmulatorMode() || dismissed) return null;

  return (
    <div
      className="fixed z-[60] flex items-center gap-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl px-3 py-1.5 text-xs text-amber-200/80"
      style={{
        right: "16px",
        bottom: "calc(var(--wc-bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 12px)",
      }}
      role="status"
      aria-live="polite"
    >
      <Server className="h-3.5 w-3.5 text-amber-400/80" />
      <span>Emulator</span>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 text-white/50 hover:text-white/80 transition"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
