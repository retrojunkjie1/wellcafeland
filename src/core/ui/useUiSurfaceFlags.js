import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function useUiSurfaceFlags() {
  const { pathname } = useLocation();

  return useMemo(() => {
    // Screens that already have a composer or primary controls
    const hasComposerSurface =
      pathname.startsWith("/chat") ||
      pathname.startsWith("/assistance") ||
      pathname.startsWith("/tools") ||
      pathname.startsWith("/recovery") ||
      pathname.startsWith("/daily") ||
      pathname.startsWith("/explore") ||
      pathname === "/";

    // If we ever have pages without composer, we can allow a dock there.
    const allowPresenceDock = !hasComposerSurface;

    return { hasComposerSurface, allowPresenceDock };
  }, [pathname]);
}
