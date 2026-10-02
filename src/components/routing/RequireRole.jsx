// src/components/routing/RequireRole.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminClaim } from "@/hooks/useAdminClaim";

/**
 * Route guard that redirects public users from hidden pages
 * Admins can still access via direct URL
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect to if unauthorized (default: "/")
 */
const RequireRole = ({ children, allowedRoles = [], redirectTo = "/unauthorized" }) => {
  const { role, roles = [], loading, isAuthenticated } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user's role is allowed
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(role) && !roles.some((candidate) => allowedRoles.includes(candidate))) {
      // User is authenticated but doesn't have required role
      // Redirect to home or dashboard
      return <Navigate to={redirectTo} replace />;
    }
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

/**
 * Convenience wrapper for admin-only routes
 * Hardened to check Firebase custom claims directly
 */
export const RequireAdmin = ({ children, redirectTo = "/unauthorized" }) => {
  const { user, loading } = useAuth();
  const { isAdmin, adminReady } = useAdminClaim();

  if (loading || !adminReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

/**
 * Gate legacy admin surfaces by the same server-hydrated capability snapshot
 * used by the main God-Eye workspace. A regional assignment grants entry to
 * the review surface; each data action still enforces its region server-side.
 */
export const RequireAdminScope = ({ children, scope, ownerOnly = false, redirectTo = "/admin/access" }) => {
  const { user, loading } = useAuth();
  const { isAdmin, adminReady, claims } = useAdminClaim();

  if (loading || !adminReady) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-400 border-r-transparent" />
          <p className="text-sm text-muted-foreground">Checking administrator access…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to={redirectTo} replace />;

  const isOwner = claims?.godAdmin === true;
  const hasGlobalScope = scope && claims?.adminScopes?.includes(scope);
  const hasRegionalScope = scope
    && Array.isArray(claims?.adminRegionalScopes?.[scope])
    && claims.adminRegionalScopes[scope].length > 0;
  const allowed = isOwner || (!ownerOnly && (hasGlobalScope || hasRegionalScope));

  return allowed ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

export default RequireRole;
