// Phase 54C3: Quiet emulator pill — only when wc_debug=1, hidden when sheet open

import React from "react";
import { Server } from "lucide-react";
import { useSheet } from "@/context/SheetContext";

const isDebugEmulator = () =>
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_EMULATORS === "true" &&
  (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("wc_debug") === "1");

export function EmulatorStatusPill() {
  const { sheetOpen } = useSheet();
  if (!isDebugEmulator() || sheetOpen) return null;

  return (
    <div
      className="fixed z-20 flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl px-2.5 py-1 text-[10px] text-white/60"
      style={{
        right: "12px",
        bottom: "calc(var(--wc-dock-h,76px) + env(safe-area-inset-bottom) + 8px)",
      }}
      role="status"
      aria-live="polite"
    >
      <Server className="h-3 w-3 text-amber-400/70" />
      <span>Emulator</span>
    </div>
  );
}
