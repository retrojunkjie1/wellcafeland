/** Capture the exact in-app location so a practice can return the person there. */
export function createToolReturnState(location) {
  return {
    returnTo: {
      pathname: location?.pathname || "/tools",
      search: location?.search || "",
      hash: location?.hash || "",
      state: location?.state ?? null,
      scrollY: typeof window !== "undefined" ? window.scrollY : 0,
    },
  };
}

export function resolveToolReturnTarget(locationState, fallback = "/tools") {
  const target = locationState?.returnTo;
  if (typeof target === "string") {
    return target.startsWith("/") && !target.startsWith("//") ? target : fallback;
  }
  if (!target || typeof target !== "object") return { pathname: fallback, search: "", hash: "", state: null };
  const pathname = typeof target.pathname === "string" ? target.pathname : "";
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return { pathname: fallback, search: "", hash: "", state: null };
  }
  return {
    pathname,
    search: typeof target.search === "string" ? target.search : "",
    hash: typeof target.hash === "string" ? target.hash : "",
    state: target.state ?? null,
    scrollY: Number.isFinite(target.scrollY) ? Math.max(0, target.scrollY) : 0,
  };
}

export function navigateToTool(navigate, path, location, options = {}) {
  const route = path.startsWith("/") ? path : `/tools/${encodeURIComponent(path)}`;
  navigate(route, { ...options, state: { ...options.state, ...createToolReturnState(location) } });
}

export function returnFromTool(navigate, target) {
  if (typeof target === "string") {
    navigate(target.startsWith("/") && !target.startsWith("//") ? target : "/tools", { replace: true });
    return;
  }
  navigate({
    pathname: target?.pathname || "/tools",
    search: target?.search || "",
    hash: target?.hash || "",
  }, { replace: true, state: target?.state ?? null });
  if (typeof window !== "undefined" && Number.isFinite(target?.scrollY)) {
    window.requestAnimationFrame(() => window.scrollTo(0, Math.max(0, target.scrollY)));
  }
}
