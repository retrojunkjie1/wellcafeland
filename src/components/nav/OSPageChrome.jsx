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

  // Hide chrome for immersive tool sessions (they have floating back buttons)
  const isImmersiveToolSession = location.pathname.match(/^\/tools\/[^/]+$/);
  if (isImmersiveToolSession) return null;

  if (!title) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-1.5 rounded-none">
        <div className="flex items-center justify-between gap-2 h-[32px]">
          {canGoBack ? (
            <button
              type="button"
              onClick={back}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/60 hover:bg-white/8 hover:text-white/80 active:scale-[0.98] transition"
            >
              <span className="text-xs leading-none">←</span>
              <span className="uppercase tracking-wide">Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-center flex-1 min-w-0">
            <h1 className="text-xs font-medium text-white/90 truncate">{title}</h1>
          </div>
        </div>

        {crumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[9px] text-white/45 px-1 pb-0.5">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.to}>
                {idx > 0 && <span className="text-white/20">›</span>}
                {idx === crumbs.length - 1 ? (
                  <span className="text-white/55">{crumb.label}</span>
                ) : (
                  <Link className="hover:text-amber-200/80 transition" to={crumb.to}>
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
