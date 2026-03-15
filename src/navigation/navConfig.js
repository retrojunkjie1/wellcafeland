// src/navigation/navConfig.js
// Phase A1: Canonical Navigation Truth - Single Source of Truth

import { matchPath } from "react-router-dom";

// Canonical root routes (no back button on these)
export const ROOT_ROUTES = [
  "/home",
  "/chat",
  "/tools",
  "/recovery",
  "/dashboard",
  "/profile",
];

export const ROOT_SET = new Set(ROOT_ROUTES);

// Route metadata: path-prefix => { title, parent, rootFallback }
export const ROUTE_META = [
  // Core roots
  { pattern: "/home", title: "Home", parent: null, rootFallback: "/home" },
  { pattern: "/chat", title: "Chat", parent: null, rootFallback: "/chat" },
  { pattern: "/", title: "Home", parent: null, rootFallback: "/home" },

  // Explore
  { pattern: "/explore", title: "Explore", parent: "/home", rootFallback: "/home" },

  // Guide & Living
  { pattern: "/guide", title: "Guide", parent: "/home", rootFallback: "/home" },
  { pattern: "/living", title: "Living Guide", parent: "/home", rootFallback: "/home" },
  { pattern: "/living/v3", title: "Living Guide", parent: "/home", rootFallback: "/home" },

  // Sequence
  { pattern: "/sequence", title: "Sequence", parent: "/tools", rootFallback: "/tools" },
  { pattern: "/sequence/:id", title: "Sequence", parent: "/tools", rootFallback: "/tools" },

  // Tools
  { pattern: "/tools/classic", title: "Tools (Classic)", parent: "/tools", rootFallback: "/tools" },
  { pattern: "/tools/:toolId", title: "Tool", parent: "/tools", rootFallback: "/tools" },
  { pattern: "/tools/voice-journal", title: "Voice Journal", parent: "/tools", rootFallback: "/tools" },
  { pattern: "/tools/voice-checkin", title: "Voice Check-In", parent: "/tools", rootFallback: "/tools" },

  // Assistance
  { pattern: "/assistance", title: "Assistance", parent: "/home", rootFallback: "/home" },
  { pattern: "/assistance/request", title: "Request Assistance", parent: "/assistance", rootFallback: "/assistance" },

  // Support & Command
  { pattern: "/support", title: "Support", parent: "/home", rootFallback: "/home" },
  { pattern: "/command", title: "Command", parent: "/home", rootFallback: "/home" },

  // Workspace
  { pattern: "/workspace", title: "Workspace", parent: "/home", rootFallback: "/home" },
  { pattern: "/workspace/:id", title: "Workspace", parent: "/home", rootFallback: "/home" },
  { pattern: "/workspace/real-help", title: "Real Help", parent: "/home", rootFallback: "/home" },

  // Resources (canonical directory)
  { pattern: "/resources", title: "Resources", parent: "/home", rootFallback: "/home" },
  { pattern: "/resources/:id", title: "Resource Detail", parent: "/resources", rootFallback: "/resources" },

  // Circles
  { pattern: "/circles", title: "Circles", parent: "/home", rootFallback: "/home" },
  { pattern: "/circles/:circleId", title: "Circle", parent: "/circles", rootFallback: "/circles" },
  { pattern: "/circles/:circleId/threads/new", title: "New Thread", parent: "/circles/:circleId", rootFallback: "/circles/:circleId" },
  { pattern: "/circles/:circleId/threads/:threadId", title: "Thread", parent: "/circles/:circleId", rootFallback: "/circles/:circleId" },

  // Social
  { pattern: "/social", title: "Social", parent: "/home", rootFallback: "/home" },
  { pattern: "/social/feed", title: "Social Feed", parent: "/home", rootFallback: "/home" },
  { pattern: "/social/dm", title: "Messages", parent: "/social/feed", rootFallback: "/social/feed" },
  { pattern: "/social/dm/:threadId", title: "Message Thread", parent: "/social/dm", rootFallback: "/social/dm" },

  // Connections
  { pattern: "/connections", title: "Connections", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/connections/friends", title: "Friends", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/connections/trusted", title: "Trusted", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/connections/blocked", title: "Blocked", parent: "/profile", rootFallback: "/profile" },

  // Settings
  { pattern: "/settings", title: "Settings", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/settings/preferences", title: "Preferences", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/settings/wellness", title: "Wellness", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/settings/notifications", title: "Notifications", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/settings/privacy", title: "Privacy", parent: "/profile", rootFallback: "/profile" },

  // Recovery & Milestones
  { pattern: "/milestones", title: "Milestones", parent: "/dashboard", rootFallback: "/dashboard" },
  { pattern: "/agents", title: "Agents", parent: "/home", rootFallback: "/home" },

  // Provider (canonical)
  { pattern: "/provider", title: "Provider", parent: "/home", rootFallback: "/home" },
  { pattern: "/provider/dashboard", title: "Provider Dashboard", parent: "/provider", rootFallback: "/provider" },
  { pattern: "/provider/clients", title: "Clients", parent: "/provider", rootFallback: "/provider" },
  { pattern: "/provider/clients/list", title: "Client List", parent: "/provider/clients", rootFallback: "/provider/clients" },
  { pattern: "/provider/clients/:clientId", title: "Client", parent: "/provider/clients", rootFallback: "/provider/clients" },
  { pattern: "/provider/clients/:clientId/timeline", title: "Timeline", parent: "/provider/clients/:clientId", rootFallback: "/provider/clients/:clientId" },
  { pattern: "/provider/clients/:clientId/notes/new", title: "New Note", parent: "/provider/clients/:clientId", rootFallback: "/provider/clients/:clientId" },
  { pattern: "/provider/clients/:clientId/notes/:noteId", title: "Note", parent: "/provider/clients/:clientId", rootFallback: "/provider/clients/:clientId" },
  { pattern: "/provider/clients/:clientId/care-plan/new", title: "New Care Plan", parent: "/provider/clients/:clientId", rootFallback: "/provider/clients/:clientId" },
  { pattern: "/provider/clients/:clientId/care-plan/:planId", title: "Care Plan", parent: "/provider/clients/:clientId", rootFallback: "/provider/clients/:clientId" },
  { pattern: "/provider/messages", title: "Messages", parent: "/provider", rootFallback: "/provider" },
  { pattern: "/provider/schedule", title: "Schedule", parent: "/provider", rootFallback: "/provider" },

  // Admin
  { pattern: "/admin", title: "Admin", parent: "/home", rootFallback: "/home" },
  { pattern: "/admin/theme", title: "Theme", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/templates", title: "Templates", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/sessions", title: "Sessions Admin", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/overseer", title: "Overseer", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/overseer-ultra", title: "Overseer Ultra", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/content", title: "Content Studio", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/admin/seed", title: "Seed Data", parent: "/admin", rootFallback: "/admin" },

  // Sessions
  { pattern: "/sessions", title: "Sessions", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/sessions/templates", title: "Session Templates", parent: "/admin", rootFallback: "/admin" },
  { pattern: "/sessions/templates/:id", title: "Session Template", parent: "/sessions/templates", rootFallback: "/sessions/templates" },
  { pattern: "/sessions/templates/new", title: "New Template", parent: "/sessions/templates", rootFallback: "/sessions/templates" },
  { pattern: "/sessions/view/:id", title: "Session Viewer", parent: "/admin", rootFallback: "/admin" },

  // Legal
  { pattern: "/privacy", title: "Privacy Policy", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/terms", title: "Terms of Service", parent: "/profile", rootFallback: "/profile" },
  { pattern: "/cookies", title: "Cookie Notice", parent: "/profile", rootFallback: "/profile" },

  // Auth (no back on these)
  { pattern: "/login", title: "Login", parent: null, rootFallback: "/home" },
  { pattern: "/signup", title: "Sign Up", parent: null, rootFallback: "/home" },
  { pattern: "/onboarding", title: "Onboarding", parent: null, rootFallback: "/home" },
];

// Find route meta by longest prefix match
export function getRouteMeta(pathname) {
  // Check exact root match first
  if (ROOT_SET.has(pathname) || pathname === "/") {
    return { title: "", parent: null, rootFallback: "/home", isRoot: true };
  }

  // Use matchPath for proper pattern matching
  let bestMatch = null;
  let bestSpecificity = 0;

  for (const meta of ROUTE_META) {
    const match = matchPath({ path: meta.pattern, end: false }, pathname);
    if (match) {
      // Calculate specificity: more specific = more path segments, fewer wildcards
      const segments = meta.pattern.split("/").filter(Boolean);
      const wildcards = meta.pattern.match(/:\w+/g)?.length || 0;
      const specificity = segments.length * 100 - wildcards;
      
      if (specificity > bestSpecificity) {
        bestSpecificity = specificity;
        bestMatch = meta;
      }
    }
  }

  return bestMatch || { title: "WellnessCafe", parent: "/home", rootFallback: "/home", isRoot: false };
}

// Check if pathname is a root route
export function isRootRoute(pathname) {
  if (pathname === "/") return true;
  return ROOT_SET.has(pathname);
}

