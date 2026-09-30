import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { resolveWorkspaceHome, useWorkspaceSelection } from "@/navigation/workspaces";

export default function WorkspaceLandingPage({ guestFallback }) {
  const { user, loading } = useAuth();
  const identity = useSessionIdentity();
  const { adminReady, isAdmin, claims: adminClaims } = useAdminClaim();
  const workspaceIdentity = adminReady && isAdmin ? {
    ...identity,
    isAdmin: true,
    isGodAdmin: adminClaims?.godAdmin === true,
    adminScopes: adminClaims?.adminScopes || [],
    adminRegionalScopes: adminClaims?.adminRegionalScopes || {},
  } : identity;
  const { activeWorkspace } = useWorkspaceSelection(workspaceIdentity);

  if (loading || (user && !user.isAnonymous && (identity.isLoading || !adminReady))) {
    return <div className="grid min-h-[55vh] place-items-center text-sm text-white/60" role="status">Opening your workspace…</div>;
  }
  if (!user || user.isAnonymous) return guestFallback;

  return <Navigate to={resolveWorkspaceHome(workspaceIdentity, activeWorkspace)} replace />;
}
