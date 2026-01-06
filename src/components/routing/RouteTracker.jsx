// src/components/routing/RouteTracker.jsx
// Tracks route changes for telemetry and runtime

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackRouteChange, setRuntimePatch } from "@/telemetry/telemetry";
import { getAuth } from "firebase/auth";

export function RouteTracker() {
  const location = useLocation();
  const auth = getAuth();

  useEffect(() => {
    trackRouteChange(location.pathname);
    
    // Update runtime with current route
    const user = auth.currentUser;
    if (user) {
      setRuntimePatch({
        route: location.pathname,
        device: /iPad|iPhone|iPod/.test(navigator.userAgent) ? "ios" : 
               /Android/.test(navigator.userAgent) ? "android" : "desktop",
        appVersion: import.meta.env.VITE_APP_VERSION || "dev",
      });
    }
  }, [location.pathname]);

  return null;
}

