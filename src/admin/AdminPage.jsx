// src/admin/AdminPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { AdminGuard } from "./AdminGuard";
import { AdminLayout } from "./AdminLayout";
import { logTelemetry } from "@/telemetry/telemetry";
import { useEffect } from "react";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminWarRoom } from "./pages/AdminWarRoom";
import { AdminTelemetry } from "./pages/AdminTelemetry";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminSystem } from "./pages/AdminSystem";
import { AdminDeploy } from "./pages/AdminDeploy";
import { AdminControlCenter } from "./pages/AdminControlCenter";
import { AdminRiskForecast } from "./pages/AdminRiskForecast";
import { AdminOverrides } from "./pages/AdminOverrides";
import { AdminIncidents } from "./pages/AdminIncidents";
import { AdminAudit } from "./pages/AdminAudit";
import { AdminProviderNetwork } from "./pages/AdminProviderNetwork";

export function AdminPage() {
  const params = useParams();
  const section = params?.section || "overview";

  // Track admin page access
  useEffect(() => {
    logTelemetry("admin_access", {
      level: "info",
      action: "page_view",
      section: section || "overview",
    });
  }, [section]);

  try {

    const renderSection = () => {
      try {
        switch (section) {
          case "warroom":
            return <AdminWarRoom />;
          case "telemetry":
            return <AdminTelemetry />;
          case "users":
            return <AdminUsers />;
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
          case "system":
            return <AdminSystem />;
          case "deploy":
            return <AdminDeploy />;
          case "overview":
          default:
            return <AdminOverview />;
        }
      } catch (err) {
        console.error("Error rendering admin section:", err);
        return <div className="text-white">Error loading section</div>;
      }
    };

    return (
      <AdminGuard>
        <AdminLayout>
          {renderSection()}
        </AdminLayout>
      </AdminGuard>
    );
  } catch (err) {
    console.error("AdminPage error:", err);
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="glass-panel rounded-2xl border border-red-400/10 bg-red-400/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Error</h2>
          <p className="text-sm text-white/70">{err.message}</p>
        </div>
      </div>
    );
  }
}

