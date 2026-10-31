import { resolveToolReturnTarget } from "@/navigation/toolReturn";

// Return handoffs are intentionally limited to local Daily Practice routes.
// Never accept an arbitrary URL from route state. Keep the full location so
// filters, hashes and the user's scroll position survive a support detour.
export function getPracticeReturnTarget(locationState) {
  const value = locationState?.returnTo;
  const target = resolveToolReturnTarget(locationState, "");
  const pathname = target.pathname;
  if (typeof value === "string") {
    const match = value.match(/^([^?#]+)(\?[^#]*)?(#.*)?$/);
    const path = match?.[1] || "";
    if (!/^\/tools\/[A-Za-z0-9._~%-]+$/.test(path)) return null;
    return { pathname: path, search: match[2] || "", hash: match[3] || "", state: null, scrollY: 0 };
  }
  if (!/^\/tools\/[A-Za-z0-9._~%-]+$/.test(pathname)) return null;
  if ((target.search && !target.search.startsWith("?")) || (target.hash && !target.hash.startsWith("#"))) return null;
  return target;
}

// Kept for callers that only need a displayable path.
export function getPracticeReturnPath(locationState) {
  return getPracticeReturnTarget(locationState)?.pathname || "";
}
