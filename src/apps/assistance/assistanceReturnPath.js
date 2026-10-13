import { resolveToolReturnTarget } from "@/navigation/toolReturn";

// Return handoffs are intentionally limited to local Daily Practice routes.
// Never accept an arbitrary URL from route state. Keep the full location so
// filters, hashes and the user's scroll position survive a support detour.
export function getPracticeReturnTarget(locationState) {
  const value = locationState?.returnTo;
  const target = resolveToolReturnTarget(locationState, "");
  const pathname = target.pathname;
  if (typeof value === "string") {
    const [path, ...queryParts] = value.split("?");
    if (!/^\/tools\/[A-Za-z0-9._~%-]+$/.test(path)) return null;
    return { pathname: path, search: queryParts.length ? `?${queryParts.join("?")}` : "", hash: "", state: null, scrollY: 0 };
  }
  if (!/^\/tools\/[A-Za-z0-9._~%-]+$/.test(pathname)) return null;
  return target;
}

// Kept for callers that only need a displayable path.
export function getPracticeReturnPath(locationState) {
  return getPracticeReturnTarget(locationState)?.pathname || "";
}
