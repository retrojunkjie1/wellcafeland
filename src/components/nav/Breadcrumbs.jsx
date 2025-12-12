// src/components/nav/Breadcrumbs.jsx
// Phase 70: Universal Navigation System - Hybrid Breadcrumbs

import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { getRouteMeta, resolveParentPath } from "../../navigation/routeMeta";

export function Breadcrumbs({ className = "" }) {
  const location = useLocation();

  const crumbs = useMemo(() => {
    const path = location.pathname;
    const current = getRouteMeta(path);
    if (!current?.breadcrumb) return [];

    // Build up: Home -> parent -> current
    const parentPath = resolveParentPath(current.pattern || "", path, current.parent || "/home") || "/home";
    const parentMeta = getRouteMeta(parentPath);

    const list = [];
    list.push({ label: "Home", to: "/home" });

    if (parentPath && parentPath !== "/home") {
      list.push({ label: parentMeta?.title || "Back", to: parentPath });
    }

    list.push({ label: current.title || "Here", to: path });

    // dedupe by "to"
    const seen = new Set();
    return list.filter((c) => {
      if (seen.has(c.to)) return false;
      seen.add(c.to);
      return true;
    });
  }, [location.pathname]);

  if (!crumbs.length) return null;

  return (
    <nav className={["flex items-center gap-2 text-[11px] text-white/55", className].join(" ")}>
      {crumbs.map((c, idx) => (
        <React.Fragment key={c.to}>
          {idx > 0 && <span className="text-white/25">›</span>}
          {idx === crumbs.length - 1 ? (
            <span className="text-white/70">{c.label}</span>
          ) : (
            <Link className="hover:text-amber-200 transition" to={c.to}>
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

