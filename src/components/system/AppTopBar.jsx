// Phase 55: Single global header — brand, guest indicator, auth status
// Used by OSLayout and ExperienceShell; no overlap, flex layout

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, UserRound, Eye, Menu, X, Sun, Moon, Home, MessageCircle, Compass, LifeBuoy, HeartHandshake, Activity, Settings, CalendarDays, HandHeart, Users, ArrowLeftRight } from "lucide-react";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { useOSStore } from "@/stores/useOSStore";
import { getWorkspaceForPath, getWorkspacePath, useWorkspaceSelection } from "@/navigation/workspaces";
import { trackSupportAction } from "@/telemetry/telemetry";
import logoImage from "@/assets/LogoWC.png";

const CLIENT_LINKS = [
  { label: "My home", to: "/home", icon: Home },
  { label: "Talk with your guide", to: "/chat", icon: MessageCircle },
  { label: "Daily Practice", to: "/tools", icon: Compass },
  { label: "Real-world support", to: "/assistance", icon: LifeBuoy },
  { label: "Practitioner directory", to: "/providers", icon: HeartHandshake },
];
const CLIENT_MORE_LINKS = [
  { label: "My sessions", to: "/my-sessions", icon: CalendarDays },
  { label: "My progress", to: "/dashboard", icon: Activity },
  { label: "Profile & preferences", to: "/profile", icon: Settings },
];
const PRACTITIONER_LINKS = [
  { label: "Workspace overview", to: "/provider/dashboard", icon: Home },
  { label: "My clients", to: "/provider/clients", icon: Users },
  { label: "Schedule", to: "/provider/schedule", icon: CalendarDays },
  { label: "Messages", to: "/provider/messages", icon: MessageCircle },
];

export default function AppTopBar({ isAuthenticated, user = null, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);
  const accountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminReady, isAdmin, claims: adminClaims } = useAdminClaim();
  const identity = useSessionIdentity();
  const { isProvider, isAdmin: identityIsAdmin, isGiver, roles = [], providerType, isLoading: identityLoading } = identity;
  // Delegated admins are authorized from the server-side scope assignment,
  // not necessarily from an Auth claim or the member profile document.
  const hasAdminWorkspace = identityIsAdmin || (adminReady && isAdmin);
  const workspaceIdentity = hasAdminWorkspace ? {
    ...identity,
    isAdmin: true,
    isGodAdmin: adminClaims?.godAdmin === true,
    adminScopes: adminClaims?.adminScopes || [],
    adminRegionalScopes: adminClaims?.adminRegionalScopes || {},
  } : identity;
  const { activeWorkspace, availableWorkspaces, selectWorkspace } = useWorkspaceSelection(workspaceIdentity, location.pathname);
  const isAdminInspectingClientRoute = (identityIsAdmin || (adminReady && isAdmin)) && getWorkspaceForPath(location.pathname) === "client";
  const canOpenPractitionerWorkspace = !identityLoading && (isProvider || identityIsAdmin || (adminReady && isAdmin));
  const canSwitchWorkspace = availableWorkspaces.length > 1;
  const hasNamedAccount = Boolean(user && !user.isAnonymous);
  const accountLabel = hasNamedAccount ? (user.displayName || user.email || "Your account") : "Guest session";
  const workspaceNames = { client: "Client space", practitioner: "Practitioner space", giver: "Community giver space", admin: "God-Eye admin" };
  const accountRoles = [
    (identityIsAdmin || (adminReady && isAdmin)) && "Administrator",
    isProvider && "Practitioner",
    isGiver && "Community giver",
    (roles.includes("client") || availableWorkspaces.includes("client")) && "Client",
  ].filter(Boolean);
  const roleLabel = identityLoading
    ? "Checking access…"
    : !hasNamedAccount
      ? "Browsing without an account"
      : accountRoles.length
      ? accountRoles.join(" · ")
      : "Client account";
  const themeMode = useOSStore((state) => state.settings.themeMode);
  const setThemeMode = useOSStore((state) => state.setThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.dataset.theme || "dark" : "dark",
  );
  const lightMode = themeMode === "dawn" || (themeMode === "system" && resolvedTheme === "light");

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => setAccountOpen(false), [location.pathname]);
  useEffect(() => {
    const syncTheme = (event) => setResolvedTheme(event.detail?.theme || document.documentElement.dataset.theme || "dark");
    window.addEventListener("wc_theme_change", syncTheme);
    return () => window.removeEventListener("wc_theme_change", syncTheme);
  }, []);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setMenuOpen(false);
    const closeOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [menuOpen, accountOpen]);

  const toggleTheme = () => setThemeMode(lightMode ? "deep-night" : "dawn");
  const switchWorkspace = (workspace) => {
    if (!selectWorkspace(workspace)) return;
    trackSupportAction("account", "workspace_changed", "", workspace);
    setMenuOpen(false);
    setAccountOpen(false);
    navigate(getWorkspacePath(workspaceIdentity, workspace));
  };
  const endSession = async () => {
    if (onLogout) await onLogout();
    setAccountOpen(false);
    navigate("/login");
  };

  const NavigationLinks = ({ links }) => links.map(({ label, to, icon: Icon }) => (
    <Link key={to} to={to} className="wc-navigation-link" aria-current={location.pathname === to ? "page" : undefined}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  ));

  return (
    <header
      className="wc-topbar sticky top-0 z-[60] border-b border-white/10 bg-black/40 backdrop-blur-xl"
      role="banner"
    >
      <div className="wc-topbar__row">
        {/* Left rail — brand, truncates */}
        <div className="wc-topbar__left flex items-center gap-2 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0"
            aria-label="WellnessCafe OS Home"
          >
            <img
              src={logoImage}
              alt=""
              className="h-8 w-8 shrink-0 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-medium text-amber-200/90 truncate">
                WELLNESSCAFE OS
              </span>
              <span className="wc-topbar__subtitle text-[10px] text-white/50 truncate hidden sm:block">
                Luxury recovery operating system
              </span>
            </div>
          </Link>
        </div>

        {/* Right rail — one navigation control, a coordinated theme switch, and account. */}
        <div className="wc-topbar__right">
          <div className="wc-nav-menu" ref={menuRef}>
            <button
              type="button"
              className="wc-topbar-control"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="wc-primary-navigation"
              onClick={() => setMenuOpen((open) => !open)}
              title={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              <span className="wc-topbar-control-label">Menu</span>
            </button>
            {menuOpen && (
              <nav id="wc-primary-navigation" className="wc-primary-navigation" aria-label="Main navigation">
                {canSwitchWorkspace && <>
                  <p className="wc-navigation-eyebrow">Switch workspace</p>
                  {availableWorkspaces.map((workspace) => (
                    <button key={workspace} type="button" className="wc-navigation-link w-full text-left" aria-pressed={activeWorkspace === workspace} onClick={() => switchWorkspace(workspace)}>
                      {workspace === "client" ? <Home className="h-4 w-4" aria-hidden="true" /> : workspace === "admin" ? <Eye className="h-4 w-4" aria-hidden="true" /> : workspace === "giver" ? <HandHeart className="h-4 w-4" aria-hidden="true" /> : <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
                      <span>{workspaceNames[workspace]}{activeWorkspace === workspace ? " · Current" : ""}</span>
                    </button>
                  ))}
                </>}
                {activeWorkspace === "practitioner" && canOpenPractitionerWorkspace && <>
                  <p className="wc-navigation-eyebrow">Practitioner space</p>
                  {providerType && <p className="px-3 pb-2 text-xs capitalize text-white/50">{providerType.replaceAll("-", " ")}</p>}
                  <NavigationLinks links={PRACTITIONER_LINKS} />
                </>}
                {activeWorkspace === "giver" && isGiver && <>
                  <p className="wc-navigation-eyebrow">Community giver space</p>
                  <Link to={WORKSPACE_PATHS.giver} className="wc-navigation-link"><HandHeart className="h-4 w-4" aria-hidden="true" /><span>Community giving</span></Link>
                </>}
                {(activeWorkspace === "client" || isAdminInspectingClientRoute) && <>
                  <p className="wc-navigation-eyebrow">{activeWorkspace === "client" ? "Client space" : "Client experience"}</p>
                  <NavigationLinks links={CLIENT_LINKS} />
                  <details className="wc-navigation-more">
                    <summary className="wc-navigation-link cursor-pointer list-none">More in client space</summary>
                    <NavigationLinks links={CLIENT_MORE_LINKS} />
                  </details>
                  {!isProvider && <Link to="/provider" className="wc-navigation-link"><HandHeart className="h-4 w-4" aria-hidden="true" /><span>Apply to offer support</span></Link>}
                </>}
                {availableWorkspaces.length === 0 && identity.workspaceIntent === "practitioner" && <>
                  <p className="wc-navigation-eyebrow">Practitioner application</p>
                  <Link to="/provider" className="wc-navigation-link"><HandHeart className="h-4 w-4" aria-hidden="true" /><span>Continue application</span></Link>
                </>}
                {adminReady && isAdmin && (
                  <Link to={getWorkspacePath(workspaceIdentity, "admin")} className="wc-navigation-link wc-navigation-link--admin">
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>{workspaceIdentity.isGodAdmin ? "God-Eye admin console" : "Admin workspace"}</span>
                  </Link>
                )}
                {activeWorkspace === "admin" && (identityIsAdmin || (adminReady && isAdmin)) && !isProvider && <Link to="/provider" className="wc-navigation-link"><HandHeart className="h-4 w-4" aria-hidden="true" /><span>Apply to offer support</span></Link>}
              </nav>
            )}
          </div>
          <button
            type="button"
            className="wc-topbar-control wc-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${lightMode ? "dark" : "light"} appearance`}
            title={`Switch to ${lightMode ? "dark" : "light"} appearance`}
          >
            {lightMode ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
            <span className="wc-topbar-control-label">{lightMode ? "Dark" : "Light"}</span>
          </button>
          <div className="wc-account-menu" ref={accountRef}>
            <button
              type="button"
              className="wc-topbar-control wc-account-trigger"
              aria-label={`Account: ${hasNamedAccount ? accountLabel : "Guest session"}`}
              aria-expanded={accountOpen}
              aria-controls="wc-account-panel"
              onClick={() => setAccountOpen((open) => !open)}
            >
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="wc-account-trigger__label">{hasNamedAccount ? accountLabel : "Guest"}</span>
            </button>
            {accountOpen && (
              <section id="wc-account-panel" className="wc-account-panel" aria-label="Account status and actions">
                <p className="wc-navigation-eyebrow">Current account</p>
                <strong className="wc-account-panel__name">{accountLabel}</strong>
                <span className="wc-account-panel__role">{roleLabel}</span>
                {availableWorkspaces.length > 1 && (
                  <div className="wc-account-workspaces" aria-label="Switch workspace on this account">
                    <p className="wc-navigation-eyebrow">Switch workspace</p>
                    {availableWorkspaces.map((workspace) => (
                      <button key={workspace} type="button" className="wc-account-action" aria-pressed={activeWorkspace === workspace} onClick={() => switchWorkspace(workspace)}>
                        {workspaceNames[workspace]}{activeWorkspace === workspace ? " · Current" : ""}
                      </button>
                    ))}
                  </div>
                )}
                {!hasNamedAccount ? (
                  <>
                    <p className="wc-account-panel__hint">Public pages are open. Sign in for your saved workspace.</p>
                    <button type="button" className="wc-account-action" onClick={async () => { if (isAuthenticated && onLogout) await onLogout(); setAccountOpen(false); navigate("/login"); }}>
                      <LogIn className="h-4 w-4" aria-hidden="true" /><span>Sign in to an account</span>
                    </button>
                    {isAuthenticated && onLogout && <button type="button" className="wc-account-action" onClick={async () => { await onLogout(); setAccountOpen(false); navigate("/login"); }}>
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>End guest session</span>
                    </button>}
                  </>
                ) : (
                  <>
                    {identityIsAdmin || (adminReady && isAdmin) ? (
                      <Link to="/admin/console" className="wc-account-action" onClick={() => setAccountOpen(false)}>
                        <Eye className="h-4 w-4" aria-hidden="true" /><span>Open God-Eye admin</span>
                      </Link>
                    ) : null}
                    {onLogout && <button type="button" className="wc-account-action" onClick={endSession}>
                      <LogOut className="h-4 w-4" aria-hidden="true" /><span>Sign out</span>
                    </button>}
                  </>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
