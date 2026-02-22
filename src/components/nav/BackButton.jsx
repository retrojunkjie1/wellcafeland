// src/components/nav/BackButton.jsx
// Phase 70: Universal Navigation System - Contextual Back Button

import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useNavigation } from "../../navigation/NavigationContext";
import { getRouteMeta, resolveParentPath } from "../../navigation/routeMeta";

export function BackButton({ className = "" }) {
  const location = useLocation();
  const nav = useNavigation();

  const { label, meta } = useMemo(() => {
    const m = getRouteMeta(location.pathname);
    const parent = resolveParentPath(m.pattern || "", location.pathname, m.parent || "/home");

    let text = "Back";

    if (parent === "/home") text = "Back to Home";
    else if (parent === "/tools") text = "Back to Tools";
    else if (parent === "/explore") text = "Back to Explore";
    else if (parent === "/circles") text = "Back to Circles";
    else if (parent === "/provider") text = "Back to Provider";
    else if (parent === "/admin") text = "Back to Admin";
    else if (parent === "/profile") text = "Back to Profile";
    else if (parent === "/dashboard") text = "Back to Dashboard";
    else if (parent === "/assistance") text = "Back to Assistance";
    else if (parent === "/social/feed") text = "Back to Social Feed";
    else if (parent === "/resources") text = "Back to Resources";

    return { label: text, meta: m };
  }, [location.pathname]);

  if (meta?.hideBack) return null;

  return (
    <button
      type="button"
      onClick={() => nav.goBackSmart({ currentPathname: location.pathname, currentPattern: meta?.pattern })}
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5",
        "text-xs text-white/80 hover:bg-white/10 active:scale-[0.99] transition",
        className,
      ].join(" ")}
    >
      <span className="text-sm">←</span>
      <span className="uppercase tracking-[0.22em]">{label}</span>
    </button>
  );
}

