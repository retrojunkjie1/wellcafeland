// src/navigation/NavigationContext.jsx
// Phase 70: Universal Navigation System - Navigation Context

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRouteMeta, resolveParentPath, ROOT_ROUTES } from "./routeMeta";

const NavigationContext = createContext(null);

function isSkippable(pathname) {
  // don't record these as "meaningful" history
  return (
    pathname === "/unauthorized" ||
    pathname.startsWith("/preview/") ||
    pathname === "/login" ||
    pathname === "/signup"
  );
}

export function NavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const lastMeaningfulRef = useRef("/home");
  const [lastMeaningful, setLastMeaningful] = useState("/home");

  useEffect(() => {
    const path = location.pathname;

    if (ROOT_ROUTES.includes(path)) return;
    if (isSkippable(path)) return;

    lastMeaningfulRef.current = path;
    setLastMeaningful(path);
  }, [location.pathname]);

  const api = useMemo(() => {
    return {
      lastMeaningful,

      // Contextual smart back:
      // 1) If history length suggests we can go back, go -1
      // 2) Else go to resolved parent for this route
      // 3) Else fallback to /home
      goBackSmart: ({ currentPathname, currentPattern } = {}) => {
        const path = currentPathname || location.pathname;
        const meta = getRouteMeta(path);

        const parent = resolveParentPath(
          meta.pattern || currentPattern || "",
          path,
          meta.parent || "/home"
        );

        // Use browser back only when it exists and won't bounce into auth/preview deadends.
        // If unsure, use parent instead.
        try {
          // eslint-disable-next-line no-restricted-globals
          const canHistoryBack = window.history.length > 2;
          if (canHistoryBack) {
            navigate(-1);
            return;
          }
        } catch (e) {
          // ignore and fallback to parent
        }

        navigate(parent || "/home");
      },

      goHome: () => navigate("/home"),
      getMeta: (pathname) => getRouteMeta(pathname),
    };
  }, [lastMeaningful, location.pathname, navigate]);

  return <NavigationContext.Provider value={api}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

