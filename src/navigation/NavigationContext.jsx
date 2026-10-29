// src/navigation/NavigationContext.jsx
// Phase 70: Universal Navigation System - Navigation Context

import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavigationContext } from "./NavigationContextValue.js";
import { getRouteMeta, resolveParentPath } from "./routeMeta";
import { resolveToolReturnTarget, returnFromTool } from "./toolReturn";

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const api = useMemo(() => {
    return {
      // Contextual smart back:
      // 1) If history length suggests we can go back, go -1
      // 2) Else go to resolved parent for this route
      // 3) Else fallback to /home
      goBackSmart: ({ currentPathname, currentPattern } = {}) => {
        const path = currentPathname || location.pathname;
        if (location.state?.returnTo) {
          returnFromTool(navigate, resolveToolReturnTarget(location.state));
          return;
        }
        const meta = getRouteMeta(path);

        const parent = resolveParentPath(
          meta.pattern || currentPattern || "",
          path,
          meta.parent || "/home"
        );

        // Use browser back only when it exists and won't bounce into auth/preview deadends.
        // If unsure, use parent instead.
        try {

          const canHistoryBack = window.history.length > 2;
          if (canHistoryBack) {
            navigate(-1);
            return;
          }
        } catch {
          // ignore and fallback to parent
        }

        navigate(parent || "/home");
      },

      goHome: () => navigate("/home"),
      getMeta: (pathname) => getRouteMeta(pathname),
    };
  }, [location.pathname, location.state, navigate]);

  return <NavigationContext.Provider value={api}>{children}</NavigationContext.Provider>;
}
