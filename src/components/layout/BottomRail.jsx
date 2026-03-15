// src/components/layout/BottomRail.jsx
// Phase 55A.2: Slot-aware bottom rail — at most two elements: Dock (optional) and Nav.

import React from "react";

const MAX_WIDTH = "max-w-3xl";
const GAP = "gap-3";

function DockSlot({ children }) {
  return <>{children}</>;
}
DockSlot.displayName = "BottomRail.Dock";

function NavSlot({ children }) {
  return <>{children}</>;
}
NavSlot.displayName = "BottomRail.Nav";

export default function BottomRail({ children }) {
  const arr = React.Children.toArray(children);
  const dock = arr.find((c) => c.type === DockSlot);
  const nav = arr.find((c) => c.type === NavSlot);
  const other = arr.filter((c) => c.type !== DockSlot && c.type !== NavSlot);

  if (import.meta.env.DEV && other.length > 0) {
    console.warn("[BottomRail] Only Dock and Nav slots allowed. Ignoring", other.length, "other child(ren).");
  }
  if (import.meta.env.DEV && arr.length > 2) {
    console.warn("[BottomRail] At most two slots (Dock, Nav). Found", arr.length, "slot(s).");
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center px-3 pb-[env(safe-area-inset-bottom,0px)]"
      data-wc-bottom-rail="1"
    >
      <div className={`w-full ${MAX_WIDTH} mx-auto flex flex-col ${GAP}`}>
        {dock}
        {nav}
      </div>
    </div>
  );
}

BottomRail.Dock = DockSlot;
BottomRail.Nav = NavSlot;

// Shared alignment: use these on dock card and nav bar for matching width/radius
export const railCardClass = "w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl";
export const railNavClass = "w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl";
