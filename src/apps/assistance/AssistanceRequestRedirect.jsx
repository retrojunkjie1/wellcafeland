import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/** Preserve old help-request links while sending them through the canonical help journey. */
export default function AssistanceRequestRedirect() {
  const { search, state } = useLocation();
  return <Navigate to={`/assistance${search || ""}`} replace state={state} />;
}
