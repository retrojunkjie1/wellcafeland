// src/components/routing/RouteTracker.jsx
// Tracks route changes for telemetry and runtime
// Phase 54B: Continuity spine — route/action tracking

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackRouteChange } from "@/telemetry/telemetry";
import { useContinuityStore } from "@/engines/continuity/continuityStore";

const ROUTE_LABELS = {
  "/tools": "Opened tools",
  "/assistance": "Opened real help",
  "/resources": "Opened resources",
  "/chat": "Returned to chat",
};

export function RouteTracker() {
  const location = useLocation();
  const { setRoute, pushAction } = useContinuityStore();

  useEffect(() => {
    const path = location.pathname;
    trackRouteChange(path);
    setRoute(path);

    const label = ROUTE_LABELS[path];
    if (label) {
      pushAction({ type: "route", label, href: path, ts: Date.now() });
    }

  }, [location.pathname, setRoute, pushAction]);

  return null;
}
