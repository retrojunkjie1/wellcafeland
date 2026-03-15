// src/navigation/routeMeta.js
// Phase 70: Universal Navigation System - Route Metadata

import { matchPath } from "react-router-dom";

// Known roots: no back button, minimal chrome
export const ROOT_ROUTES = [
  "/", "/chat", "/login", "/signup", "/unauthorized"
];

// Route meta entries (pattern-based)
export const ROUTE_META = [
  // Core
  { pattern: "/home", title: "Home", parent: null, chrome: "full" },
  { pattern: "/chat", title: "Chat", parent: "/home", chrome: "minimal", hideBack: true },

  // Explore & Tools
  { pattern: "/explore", title: "Explore", parent: "/home", breadcrumb: false },
  { pattern: "/tools", title: "Tools", parent: "/home", breadcrumb: false },
  { pattern: "/tools/classic", title: "Tools (Classic)", parent: "/tools", breadcrumb: true },
  { pattern: "/tools/:toolId", title: "Tool", parent: "/tools", breadcrumb: true },
  { pattern: "/tools/voice-journal", title: "Voice Journal", parent: "/tools", breadcrumb: true },
  { pattern: "/tools/voice-checkin", title: "Voice Check-In", parent: "/tools", breadcrumb: true },

  // Living / Guide / Sequences
  { pattern: "/guide", title: "Guide", parent: "/home", breadcrumb: false },
  { pattern: "/living", title: "Living Guide", parent: "/home", breadcrumb: false },
  { pattern: "/living/v3", title: "Living Guide V3", parent: "/living", breadcrumb: true },
  { pattern: "/sequence/:id", title: "Sequence", parent: "/home", breadcrumb: true },

  // Recovery / Dashboard
  { pattern: "/recovery", title: "Recovery", parent: "/home", breadcrumb: false },
  { pattern: "/dashboard", title: "Dashboard", parent: "/home", breadcrumb: false },
  { pattern: "/milestones", title: "Milestones", parent: "/dashboard", breadcrumb: true },

  // Assistance / Support / Command
  { pattern: "/assistance", title: "Assistance", parent: "/home", breadcrumb: false },
  { pattern: "/assistance/request", title: "Assistance Request", parent: "/assistance", breadcrumb: true }, // AssistancePage
  { pattern: "/support", title: "Support", parent: "/home", breadcrumb: false },
  { pattern: "/command", title: "Command", parent: "/home", breadcrumb: true },

  // Circles / Social
  { pattern: "/circles", title: "Circles", parent: "/home", breadcrumb: false },
  { pattern: "/circles/:circleId", title: "Circle", parent: "/circles", breadcrumb: true },
  { pattern: "/circles/:circleId/threads/new", title: "New Thread", parent: "/circles/:circleId", breadcrumb: true },
  { pattern: "/circles/:circleId/threads/:threadId", title: "Thread", parent: "/circles/:circleId", breadcrumb: true },

  { pattern: "/social/feed", title: "Social Feed", parent: "/home", breadcrumb: false },
  { pattern: "/social/dm", title: "Messages", parent: "/social/feed", breadcrumb: true },
  { pattern: "/social/dm/:threadId", title: "Message Thread", parent: "/social/dm", breadcrumb: true },

  { pattern: "/connections/friends", title: "Friends", parent: "/home", breadcrumb: true },
  { pattern: "/connections/trusted", title: "Trusted", parent: "/home", breadcrumb: true },
  { pattern: "/connections/blocked", title: "Blocked", parent: "/home", breadcrumb: true },

  // Workspace / Directory
  { pattern: "/workspace/real-help", title: "Real Help Workspace", parent: "/home", breadcrumb: true },
  { pattern: "/workspace/:id", title: "Workspace", parent: "/home", breadcrumb: true },
  { pattern: "/resources", title: "Resources", parent: "/home", breadcrumb: false },
  { pattern: "/resources/:id", title: "Resource Detail", parent: "/resources", breadcrumb: true },

  // Profile / Settings
  { pattern: "/profile", title: "Profile", parent: "/home", breadcrumb: false },
  { pattern: "/settings/preferences", title: "Preferences", parent: "/profile", breadcrumb: true },
  { pattern: "/settings/wellness", title: "Wellness", parent: "/profile", breadcrumb: true },
  { pattern: "/settings/notifications", title: "Notifications", parent: "/profile", breadcrumb: true },
  { pattern: "/settings/privacy", title: "Privacy", parent: "/profile", breadcrumb: true },

  // Provider (auth)
  { pattern: "/provider", title: "Provider Dashboard", parent: "/home", breadcrumb: false },
  { pattern: "/provider/dashboard", title: "Provider Dashboard", parent: "/provider", breadcrumb: true },
  { pattern: "/provider/clients", title: "Clients", parent: "/provider", breadcrumb: true },
  { pattern: "/provider/clients/list", title: "Client List", parent: "/provider/clients", breadcrumb: true }, // ClientListPage
  { pattern: "/provider/clients/:clientId", title: "Client", parent: "/provider/clients", breadcrumb: true },
  { pattern: "/provider/clients/:clientId/timeline", title: "Timeline", parent: "/provider/clients/:clientId", breadcrumb: true },
  { pattern: "/provider/clients/:clientId/notes/new", title: "New Note", parent: "/provider/clients/:clientId", breadcrumb: true },
  { pattern: "/provider/clients/:clientId/notes/:noteId", title: "Note", parent: "/provider/clients/:clientId", breadcrumb: true },
  { pattern: "/provider/clients/:clientId/care-plan/new", title: "New Care Plan", parent: "/provider/clients/:clientId", breadcrumb: true },
  { pattern: "/provider/clients/:clientId/care-plan/:planId", title: "Care Plan", parent: "/provider/clients/:clientId", breadcrumb: true },
  { pattern: "/provider/messages", title: "Messages", parent: "/provider", breadcrumb: true },
  { pattern: "/provider/schedule", title: "Schedule", parent: "/provider", breadcrumb: true },

  // Providers (alternative provider routes)
  { pattern: "/providers", title: "Providers", parent: "/home", breadcrumb: false },
  { pattern: "/providers/dashboard", title: "Provider Dashboard", parent: "/providers", breadcrumb: true },
  { pattern: "/providers/clients/:clientId", title: "Client", parent: "/providers", breadcrumb: true },

  // Admin (auth)
  { pattern: "/admin", title: "Admin Console", parent: "/home", breadcrumb: false },
  { pattern: "/admin/theme", title: "Theme", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/templates", title: "Templates", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/sessions", title: "Sessions Admin", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/overseer", title: "Overseer", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/overseer-ultra", title: "Overseer Ultra", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/content", title: "Content Studio", parent: "/admin", breadcrumb: true },
  { pattern: "/admin/seed", title: "Seed Data", parent: "/admin", breadcrumb: true },

  // AI Sessions (auth)
  { pattern: "/sessions/templates", title: "Session Templates", parent: "/admin", breadcrumb: true },
  { pattern: "/sessions/templates/:id", title: "Session Template", parent: "/sessions/templates", breadcrumb: true },
  { pattern: "/sessions/templates/new", title: "New Template", parent: "/sessions/templates", breadcrumb: true },
  { pattern: "/sessions/view/:id", title: "Session Viewer", parent: "/admin", breadcrumb: true },

  // Legal
  { pattern: "/privacy", title: "Privacy Policy", parent: "/home", breadcrumb: true },
  { pattern: "/terms", title: "Terms of Service", parent: "/home", breadcrumb: true },
  { pattern: "/cookies", title: "Cookie Notice", parent: "/home", breadcrumb: true },
];

// Finds the best matching route meta for a pathname
export function getRouteMeta(pathname) {
  // direct roots
  if (ROOT_ROUTES.includes(pathname)) {
    return { title: "", parent: null, hideBack: true, breadcrumb: false, chrome: "minimal" };
  }

  for (const meta of ROUTE_META) {
    const match = matchPath({ path: meta.pattern, end: true }, pathname);
    if (match) return meta;
  }
  
  // fallback meta
  return { title: "WellnessCafe", parent: "/home", breadcrumb: false };
}

// Resolve a parent pattern to an actual parent path for current params.
// Best-effort: if parent contains :params, try to reuse from current match.
export function resolveParentPath(currentPattern, currentPathname, parentPattern) {
  if (!parentPattern) return null;
  if (!parentPattern.includes(":")) return parentPattern;

  const currentMatch = matchPath({ path: currentPattern, end: true }, currentPathname);
  if (!currentMatch?.params) return "/home";

  let resolved = parentPattern;
  for (const [k, v] of Object.entries(currentMatch.params)) {
    resolved = resolved.replace(`:${k}`, v);
  }
  
  // if unresolved still has params, fallback
  return resolved.includes(":") ? "/home" : resolved;
}

