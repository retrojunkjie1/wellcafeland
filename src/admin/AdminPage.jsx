// src/admin/AdminPage.jsx
import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { AdminGuard } from "./AdminGuard";
import { AdminLayout } from "./AdminLayout";
import { logTelemetry } from "@/telemetry/telemetry";
import { useEffect } from "react";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminWarRoom } from "./pages/AdminWarRoom";
import { AdminTelemetry } from "./pages/AdminTelemetry";
import { AdminSystem } from "./pages/AdminSystem";
import { AdminDeploy } from "./pages/AdminDeploy";
import { AdminControlCenter } from "./pages/AdminControlCenter";
import { AdminRiskForecast } from "./pages/AdminRiskForecast";
import { AdminOverrides } from "./pages/AdminOverrides";
import { AdminIncidents } from "./pages/AdminIncidents";
import { AdminAudit } from "./pages/AdminAudit";
import { AdminProviderNetwork } from "./pages/AdminProviderNetwork";
import CommunityGiversReviewPage from "@/apps/admin/CommunityGiversReviewPage";
import PractitionerApplicationsPage from "@/apps/admin/PractitionerApplicationsPage";
import AdminRolesPage from "@/apps/admin/AdminRolesPage";
import { useAdminClaim } from "@/hooks/useAdminClaim";

const SECTION_SCOPE = {
  overview: "platform.operations.view", warroom: "platform.operations.view", telemetry: "support.activity.read",
  users: "workspace.access.manage", control: "platform.operations.control", overrides: "platform.operations.control",
  incidents: "trust_safety.review", forecast: "platform.operations.view", risk: "platform.operations.view",
  audit: "platform.operations.view", "provider-network": "practitioner.directory.manage", system: "platform.operations.view",
  deploy: "platform.operations.control", "community-givers": "giving.review", practitioners: "practitioner.review",
};

export function AdminPage() {
  const params = useParams();
  const section = params?.section || "overview";
  const { claims } = useAdminClaim();

  // Track admin page access
  useEffect(() => {
    logTelemetry("admin_access", {
      level: "info",
      action: "page_view",
      section: section || "overview",
    });
  }, [section]);

  const renderSection = () => {
    const requiredScope = SECTION_SCOPE[section] || (section === "roles" ? "admin.roles.manage" : "platform.operations.view");
    const granted = claims?.godAdmin === true || claims?.adminScopes?.includes(requiredScope)
      || Object.prototype.hasOwnProperty.call(claims?.adminRegionalScopes || {}, requiredScope);
    if (!granted) return <section role="status" className="rounded-xl border border-amber-100/15 bg-amber-100/[0.035] p-5"><h2 className="text-lg font-semibold text-white">This workspace is outside your assignment</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">Your administrator access is limited to specific responsibilities. Ask the Alpha Owner to review your assigned access if this is part of your role.</p></section>;
    switch (section) {
          case "warroom":
            return <AdminWarRoom />;
          case "telemetry":
            return <AdminTelemetry />;
          case "users":
            return <Navigate to="/admin/user-access" replace />;
          case "roles":
            return <AdminRolesPage />;
          case "control":
            return <AdminControlCenter />;
          case "overrides":
            return <AdminOverrides />;
          case "incidents":
            return <AdminIncidents />;
          case "forecast":
          case "risk":
            return <AdminRiskForecast />;
          case "audit":
            return <AdminAudit />;
          case "provider-network":
            return <AdminProviderNetwork />;
          case "system":
            return <AdminSystem />;
          case "deploy":
            return <AdminDeploy />;
          case "community-givers":
            return <CommunityGiversReviewPage />;
          case "practitioners":
            return <PractitionerApplicationsPage />;
          case "overview":
          default:
            return <AdminOverview />;
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        {renderSection()}
      </AdminLayout>
    </AdminGuard>
  );
}
