// src/components/nav/OSPageChrome.jsx
// Phase 70: Universal Navigation System - Global Page Chrome

import React from "react";
import { useLocation } from "react-router-dom";
import { BackButton } from "./BackButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { getRouteMeta, ROOT_ROUTES } from "../../navigation/routeMeta";

export function OSPageChrome() {
  const location = useLocation();
  const meta = getRouteMeta(location.pathname);

  if (ROOT_ROUTES.includes(location.pathname)) return null;

  // Minimal chrome if desired
  const title = meta?.title || "WellnessCafe";

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <BackButton />
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Location</p>
            <h1 className="text-sm md:text-base font-semibold text-white">{title}</h1>
          </div>
        </div>
        <Breadcrumbs />
      </div>
    </div>
  );
}

