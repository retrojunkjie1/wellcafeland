// src/components/routing/RequireRole.jsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard that redirects public users from hidden pages
 * Admins can still access via direct URL
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.redirectTo - Path to redirect to if unauthorized (default: "/")
 */
const RequireRole = ({ children, allowedRoles = [], redirectTo = "/unauthorized" }) => {
  const { role, loading, isAuthenticated } = useAuth();

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
    if (!role || !allowedRoles.includes(role)) {
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
 */
export const RequireAdmin = ({ children, redirectTo = "/unauthorized" }) => {
  return (
    <RequireRole allowedRoles={["admin", "superadmin"]} redirectTo={redirectTo}>
      {children}
    </RequireRole>
  );
};

export default RequireRole;
