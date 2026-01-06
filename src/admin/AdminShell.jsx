// src/admin/AdminShell.jsx
import React, { useState } from "react";
import { SystemSettingsPanel } from "./panels/SystemSettingsPanel";
import { FeatureFlagsPanel } from "./panels/FeatureFlagsPanel";
import { ToolsRegistryPanel } from "./panels/ToolsRegistryPanel";
import { UsersPanel } from "./panels/UsersPanel";
import { DeployStatusPanel } from "./panels/DeployStatusPanel";
import { Settings, Flag, Wrench, Users, Rocket, Eye } from "lucide-react";

const TABS = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "system", label: "System", icon: Settings },
  { id: "flags", label: "Flags", icon: Flag },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "users", label: "Users", icon: Users },
  { id: "deploy", label: "Deploy", icon: Rocket },
];

export function AdminShell() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderPanel = () => {
    switch (activeTab) {
      case "system":
        return <SystemSettingsPanel />;
      case "flags":
        return <FeatureFlagsPanel />;
      case "tools":
        return <ToolsRegistryPanel />;
      case "users":
        return <UsersPanel />;
      case "deploy":
        return <DeployStatusPanel />;
      case "overview":
      default:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white mb-2">GodEye Admin Console</h2>
              <p className="text-xs text-white/60 mb-4">
                Backend visibility and control center.
              </p>
            </div>
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="text-xs text-white/70">
                <strong className="text-amber-200">Note:</strong> Admin rules must be enforced server-side in Firestore security rules.
                Ensure collections have proper read/write permissions for admin users only.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-1">System Settings</div>
                <div className="text-sm text-white">Manage system configuration</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-1">Feature Flags</div>
                <div className="text-sm text-white">Toggle feature availability</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-1">Tools Registry</div>
                <div className="text-sm text-white">Manage tool categories</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60 mb-1">Users</div>
                <div className="text-sm text-white">View and manage user roles</div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-0">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2 flex items-center gap-2">
          <Eye className="h-6 w-6 text-amber-400" />
          GodEye Admin Console
        </h1>
        <p className="text-sm text-white/60">
          Backend visibility and control
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "border border-amber-400/30 bg-amber-400/10 text-amber-200"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-6">
        {renderPanel()}
      </div>
    </div>
  );
}

