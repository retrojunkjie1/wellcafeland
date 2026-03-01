// src/components/routing/RouteTracker.jsx
// Tracks route changes for telemetry and runtime
// Phase 54B: Continuity spine — route/action tracking

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackRouteChange, setRuntimePatch } from "@/telemetry/telemetry";
import { getAuth } from "firebase/auth";
import { useContinuityStore } from "@/engines/continuity/continuityStore";

const ROUTE_LABELS = {
  "/tools": "Opened tools",
  "/assistance": "Opened real help",
  "/resources": "Opened resources",
  "/chat": "Returned to chat",
};

export function RouteTracker() {
  const location = useLocation();
  const auth = getAuth();
  const { setRoute, pushAction } = useContinuityStore();

  useEffect(() => {
    const path = location.pathname;
    trackRouteChange(path);
    setRoute(path);

    const label = ROUTE_LABELS[path];
    if (label) {
      pushAction({ type: "route", label, href: path, ts: Date.now() });
    }

    const user = auth.currentUser;
    if (user) {
      setRuntimePatch({
        route: path,
        device: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" :
               /Android/.test(navigator.userAgent) ? "android" : "desktop",
        appVersion: import.meta.env.VITE_APP_VERSION || "dev",
      });
    }
  }, [location.pathname, setRoute, pushAction]);

  return null;
}
