// src/admin/AdminLayout.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Activity, Users, Rocket, Shield, TrendingUp, Zap, AlertTriangle, FileText, BarChart3, Building2, HandHeart, BadgeCheck, KeyRound } from "lucide-react";
import { useAdminClaim } from "@/hooks/useAdminClaim";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Eye, scope: "platform.operations.view" },
  { id: "roles", label: "Admin Roles", icon: KeyRound, ownerOnly: true },
  { id: "warroom", label: "War Room", icon: BarChart3, scope: "platform.operations.view" },
  { id: "users", label: "Workspace Access", icon: Users, scope: "workspace.access.manage" },
  { id: "control", label: "Control", icon: Shield, scope: "platform.operations.control" },
  { id: "overrides", label: "Overrides", icon: Zap, scope: "platform.operations.control" },
  { id: "incidents", label: "Incidents", icon: AlertTriangle, scope: "trust_safety.review" },
  { id: "forecast", label: "Risk Radar", icon: TrendingUp, scope: "platform.operations.view" },
  { id: "audit", label: "Audit", icon: FileText, scope: "platform.operations.view" },
  { id: "telemetry", label: "Support Activity", icon: Activity, scope: "support.activity.read" },
  { id: "provider-network", label: "Provider Network", icon: Building2, scope: "practitioner.directory.manage" },
  { id: "community-givers", label: "Giving Review", icon: HandHeart, scope: "giving.review" },
  { id: "practitioners", label: "Practitioner Review", icon: BadgeCheck, scope: "practitioner.review" },
  { id: "deploy", label: "Deploy", icon: Rocket, scope: "platform.operations.control" },
];

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const params = useParams();
  const section = params.section || "overview";
  const { claims } = useAdminClaim();
  const hasScope = (scope) => claims?.godAdmin === true || claims?.adminScopes?.includes(scope)
    || Object.prototype.hasOwnProperty.call(claims?.adminRegionalScopes || {}, scope);
  const sections = SECTIONS.filter((item) => item.ownerOnly ? claims?.godAdmin === true : hasScope(item.scope));

  const handleSectionChange = (sectionId) => {
    if (sectionId === "overview") {
      navigate("/admin");
    } else {
      navigate(`/admin/${sectionId}`);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <header className="mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
        <h1 className="text-xl font-semibold text-white">
          {claims?.godAdmin === true ? "God-Eye Dashboard" : "Admin workspace"}
        </h1>
        <p className="text-xs text-white/50">
          Backend visibility and control
        </p>
        </div>
      </header>

      <nav aria-label="Admin sections" className="mb-4 flex gap-1.5 overflow-x-auto border-b border-white/10 pb-3">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = section === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleSectionChange(sec.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
                isActive
                  ? "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {sec.label}
            </button>
          );
        })}
      </nav>

      <div className="glass-panel rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}
