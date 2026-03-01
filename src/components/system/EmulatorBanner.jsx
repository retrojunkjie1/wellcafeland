// Phase 53C: Emulator mode banner — fixed above bottom nav, reserved space
// Shows only when VITE_USE_EMULATORS=true

import React from "react";

const isEmulatorMode = () =>
  import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true";

export function EmulatorBanner() {
  if (!isEmulatorMode()) return null;

  return (
    <div
      className="wc-fixed-emulator z-[45] flex items-center justify-center bg-red-900/90 text-red-100 text-xs py-1.5 px-4 border-t border-red-700/50"
      style={{ bottom: "calc(var(--wc-bottom-nav-h) + env(safe-area-inset-bottom))" }}
      role="status"
      aria-live="polite"
    >
      Running in emulator mode
    </div>
  );
}
