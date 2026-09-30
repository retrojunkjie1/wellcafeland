import React from "react";

export const WORKSPACE_PATHS = Object.freeze({
  client: "/home",
  practitioner: "/provider/dashboard",
  giver: "/giver",
  admin: "/admin/console",
});

const KNOWN_WORKSPACES = new Set(["client", "practitioner", "giver", "admin"]);
const ADMIN_SCOPE_DESTINATIONS = Object.freeze([
  ["platform.operations.view", "/admin/warroom"],
  ["workspace.access.manage", "/admin/user-access"],
  ["support.activity.read", "/admin/telemetry"],
  ["trust_safety.review", "/admin/incidents"],
  ["support_directory.manage", "/admin/help-directory"],
  ["meeting_sources.manage", "/admin/recovery-meeting-sources"],
  ["giving.review", "/admin/community-givers"],
  ["practitioner.review", "/admin/practitioners"],
  ["practitioner.directory.manage", "/admin/provider-network"],
  ["platform.operations.control", "/admin/control"],
]);

const PRACTITIONER_ROUTE = /^\/provider(?:\/|$)/;
const CLIENT_ROUTE = /^\/(?:home|chat|check-in|my-sessions|explore|assistance|recovery|milestones|tools|guide|living|plan|dashboard|profile|providers)(?:\/|$)/;

export function getWorkspaceForPath(pathname = "") {
  if (/^\/admin(?:\/|$)/.test(pathname)) return "admin";
  if (/^\/giver(?:\/|$)/.test(pathname)) return "giver";
  if (PRACTITIONER_ROUTE.test(pathname)) return "practitioner";
  if (CLIENT_ROUTE.test(pathname)) return "client";
  return null;
}

export function getAdminWorkspacePath(identity = {}) {
  if (identity.isGodAdmin || identity.godAdmin || identity.claims?.godAdmin) return "/admin/console";
  const scopes = new Set([
    ...(Array.isArray(identity.adminScopes) ? identity.adminScopes : []),
    ...(Array.isArray(identity.scopes) ? identity.scopes : []),
    ...Object.keys(identity.adminRegionalScopes || {}),
    ...Object.keys(identity.regionalScopes || {}),
  ]);
  return ADMIN_SCOPE_DESTINATIONS.find(([scope]) => scopes.has(scope))?.[1] || "/admin/access";
}

export function getWorkspacePath(identity = {}, workspace = "") {
  if (!KNOWN_WORKSPACES.has(workspace)) return null;
  return workspace === "admin" ? getAdminWorkspacePath(identity) : WORKSPACE_PATHS[workspace];
}

export function getAvailableWorkspaces(identity = {}) {
  const roles = new Set(Array.isArray(identity.roles) ? identity.roles : []);
  if (identity.role) roles.add(identity.role);
  const practitioner = identity.isProvider || roles.has("provider") || roles.has("provider_admin");
  const admin = identity.isAdmin || roles.has("admin") || roles.has("superadmin") || roles.has("org_admin") || roles.has("provider_admin");
  const giver = identity.isGiver || roles.has("giver") || roles.has("community_giver");
  const client = identity.workspaceIntent === "practitioner" && !practitioner
    ? false
    : roles.has("client") || (!practitioner && !admin);
  return [client && "client", practitioner && "practitioner", giver && "giver", admin && "admin"].filter(Boolean);
}

export function getDefaultWorkspace(identity = {}, available = getAvailableWorkspaces(identity)) {
  if (identity.workspaceIntent === "practitioner" && available.includes("practitioner")) return "practitioner";
  if (available.length === 1) return available[0];
  if (available.includes("admin")) return "admin";
  if (available.includes("client")) return "client";
  if (available.includes("giver")) return "giver";
  return null;
}

export function resolveWorkspaceHome(identity = {}, preference = null) {
  const available = getAvailableWorkspaces(identity);
  if (KNOWN_WORKSPACES.has(preference) && available.includes(preference)) return getWorkspacePath(identity, preference);
  const defaultWorkspace = getDefaultWorkspace(identity, available);
  if (defaultWorkspace) return getWorkspacePath(identity, defaultWorkspace);
  if (identity.workspaceIntent === "practitioner") return "/provider";
  if (identity.isAdmin || ["admin", "superadmin", "org_admin"].includes(identity.role)) return getAdminWorkspacePath(identity);
  return WORKSPACE_PATHS.client;
}

const storageKey = (userId) => userId ? `wc_active_workspace:${userId}` : null;

export function readWorkspacePreference(userId) {
  if (!userId || typeof window === "undefined") return null;
  const value = window.localStorage.getItem(storageKey(userId));
  return KNOWN_WORKSPACES.has(value) ? value : null;
}

export function saveWorkspacePreference(userId, workspace) {
  if (!userId || !KNOWN_WORKSPACES.has(workspace) || typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(userId), workspace);
  window.dispatchEvent(new CustomEvent("wc_workspace_change", { detail: { userId, workspace } }));
}

export function useWorkspaceSelection(identity = {}, pathname = "") {
  const available = getAvailableWorkspaces(identity);
  const fallback = getDefaultWorkspace(identity, available);
  const routeWorkspace = getWorkspaceForPath(pathname);
  const routeSelection = available.includes(routeWorkspace) ? routeWorkspace : null;
  const [activeWorkspace, setActiveWorkspace] = React.useState(() =>
    routeSelection || readWorkspacePreference(identity.mode === "account" ? identity.userId : null) || fallback,
  );
  const userId = identity.mode === "account" ? identity.userId : null;

  React.useEffect(() => {
    if (routeSelection) {
      setActiveWorkspace(routeSelection);
      if (userId && readWorkspacePreference(userId) !== routeSelection) {
        saveWorkspacePreference(userId, routeSelection);
      }
      return;
    }
    const stored = readWorkspacePreference(userId);
    setActiveWorkspace(stored && available.includes(stored) ? stored : fallback);
  }, [userId, fallback, routeSelection, available.join("|")]);

  React.useEffect(() => {
    const sync = (event) => {
      if (event.detail?.userId === userId && available.includes(event.detail.workspace)) {
        setActiveWorkspace(event.detail.workspace);
      }
    };
    window.addEventListener("wc_workspace_change", sync);
    const syncStorage = (event) => {
      if (event.key === storageKey(userId)) {
        const stored = readWorkspacePreference(userId);
        setActiveWorkspace(stored && available.includes(stored) ? stored : fallback);
      }
    };
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener("wc_workspace_change", sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, [userId, fallback, available.join("|")]);

  const selectWorkspace = (workspace) => {
    if (!available.includes(workspace)) return false;
    if (userId) saveWorkspacePreference(userId, workspace);
    setActiveWorkspace(workspace);
    return true;
  };

  return { activeWorkspace, availableWorkspaces: available, selectWorkspace };
}
