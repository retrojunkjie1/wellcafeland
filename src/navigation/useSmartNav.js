// src/navigation/useSmartNav.js
// Phase A1: Smart Navigation Hook with sessionStorage persistence

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { getRouteMeta, isRootRoute } from "./navConfig";
import { matchPath } from "react-router-dom";

const LAST_PATH_KEY = "wc_last_path";

function getLastKnownPath() {
  try {
    return sessionStorage.getItem(LAST_PATH_KEY) || null;
  } catch {
    return null;
  }
}

function setLastKnownPath(pathname) {
  try {
    if (pathname && !isRootRoute(pathname)) {
      sessionStorage.setItem(LAST_PATH_KEY, pathname);
    }
  } catch {
    // ignore
  }
}

// Resolve parent path from pattern (handles dynamic params)
function resolveParentPath(parentPattern, currentPathname, currentPattern) {
  if (!parentPattern) return null;
  if (!parentPattern.includes(":")) return parentPattern;

  // Try to extract params from current pathname using currentPattern
  if (currentPattern) {
    const match = matchPath({ path: currentPattern }, currentPathname);
    if (match?.params) {
      let resolved = parentPattern;
      for (const [key, value] of Object.entries(match.params)) {
        resolved = resolved.replace(`:${key}`, value);
      }
      if (!resolved.includes(":")) return resolved;
    }
  }

  return parentPattern;
}

export function useSmartNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Update last known path on route change
  useEffect(() => {
    setLastKnownPath(pathname);
  }, [pathname]);

  const meta = useMemo(() => getRouteMeta(pathname), [pathname]);
  const isRoot = useMemo(() => isRootRoute(pathname), [pathname]);

  // Build breadcrumbs
  const crumbs = useMemo(() => {
    if (isRoot || !meta.parent) return [];

    const parentMeta = getRouteMeta(meta.parent);
    const crumbsList = [];

    if (parentMeta.title) {
      crumbsList.push({ label: parentMeta.title, to: meta.parent });
    }

    if (meta.title) {
      crumbsList.push({ label: meta.title, to: pathname });
    }

    // Limit to 2 levels max
    return crumbsList.slice(-2);
  }, [meta, pathname, isRoot]);

  // Smart back function
  const back = () => {
    if (isRoot) return;

    // 1) Check location state for "from"
    const fromState = location.state?.from;
    if (fromState && fromState !== pathname) {
      navigate(fromState);
      return;
    }

    // 2) Try browser history
    try {
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
    } catch {
      // ignore
    }

    // 3) Try last known path from sessionStorage
    const lastPath = getLastKnownPath();
    if (lastPath && lastPath !== pathname && !isRootRoute(lastPath)) {
      navigate(lastPath);
      return;
    }

    // 4) Fallback to rootFallback or parent
    const fallback = meta.rootFallback || meta.parent || "/home";
    navigate(fallback);
  };

  return {
    canGoBack: !isRoot,
    back,
    crumbs,
    title: meta.title || "",
    meta,
  };
}

