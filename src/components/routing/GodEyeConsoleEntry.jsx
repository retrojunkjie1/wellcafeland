import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminClaim } from "@/hooks/useAdminClaim";
import { getAdminWorkspacePath } from "@/navigation/workspaces";

export default function GodEyeConsoleEntry({ children }) {
  const { adminReady, claims } = useAdminClaim();
  if (!adminReady) return <div className="grid min-h-[40vh] place-items-center text-sm text-white/60" role="status">Checking administrator access…</div>;
  if (claims?.godAdmin === true) return children;
  return <Navigate to={getAdminWorkspacePath(claims || {})} replace />;
}
