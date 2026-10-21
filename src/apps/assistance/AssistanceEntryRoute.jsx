import React, { lazy } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAssistanceEntry } from "./assistanceRoute";

const AssistanceHubPage = lazy(() => import("./AssistanceHubPage"));
const RealHelpWorkspace = lazy(() => import("@/apps/workspace/RealHelpWorkspace"));
/** Route each help entry through one chooser or the location-aware results workspace. */
export default function AssistanceRoute() {
  const { search } = useLocation();
  const entry = getAssistanceEntry(search);
  if (entry === "meetings") return <Navigate to="/recovery/meetings" replace />;
  if (entry === "hub") return <AssistanceHubPage />;
  return <RealHelpWorkspace />;
}
