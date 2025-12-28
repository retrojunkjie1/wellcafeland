import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSmartNav } from "../../navigation/useSmartNav";
import { isRootRoute } from "../../navigation/navConfig";

export function OSPageChrome() {
  const location = useLocation();
  const { canGoBack, back, crumbs, title } = useSmartNav();

  // Hide chrome for root routes only
  if (isRootRoute(location.pathname)) return null;

  // Hide chrome for editor routes (they have their own chrome)
  const hideChrome =
    location.pathname.includes("/notes/") || location.pathname.includes("/care-plan/");
  if (hideChrome) return null;

  // IMPORTANT C1 FIX:
  // Do NOT hide chrome for /tools/:toolId — users need a consistent back affordance.
  // Immersive sessions can still add a floating back button, but global chrome should not vanish.

  if (!title) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {canGoBack ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 active:scale-[0.99] transition"
            >
              <span className="text-sm">←</span>
              <span className="uppercase tracking-[0.22em]">Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-right flex-1 min-w-0">
            <h1 className="text-sm md:text-base font-semibold text-white truncate">{title}</h1>
          </div>
        </div>

        {crumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-[11px] text-white/55">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.to}>
                {idx > 0 && <span className="text-white/25">›</span>}
                {idx === crumbs.length - 1 ? (
                  <span className="text-white/70">{crumb.label}</span>
                ) : (
                  <Link className="hover:text-amber-200 transition" to={crumb.to}>
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
