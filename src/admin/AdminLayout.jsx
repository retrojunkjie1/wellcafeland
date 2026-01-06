// src/admin/AdminLayout.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Activity, Users, Settings, Rocket, Map, Shield, TrendingUp, Zap, AlertTriangle, FileText, BarChart3, Building2 } from "lucide-react";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "warroom", label: "War Room", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "control", label: "Control", icon: Shield },
  { id: "overrides", label: "Overrides", icon: Zap },
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "audit", label: "Audit", icon: FileText },
  { id: "telemetry", label: "Telemetry", icon: Activity },
  { id: "provider-network", label: "Provider Network", icon: Building2 },
  { id: "deploy", label: "Deploy", icon: Rocket },
];

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const params = useParams();
  const section = params.section || "overview";

  const handleSectionChange = (sectionId) => {
    if (sectionId === "overview") {
      navigate("/admin");
    } else {
      navigate(`/admin/${sectionId}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-2">
          <Eye className="h-6 w-6 text-amber-400" />
          God-Eye Dashboard
        </h1>
        <p className="text-sm text-white/60">
          Backend visibility and control
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = section === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleSectionChange(sec.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {sec.label}
            </button>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-6">
        {children}
      </div>
    </div>
  );
}

