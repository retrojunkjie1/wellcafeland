// src/components/dashboard/QuickActions.jsx
// Quick action buttons for tools and directory

import React from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "@/stores/useOSStore";
import { Wind, Anchor, BookOpen, Search } from "lucide-react";

export default function QuickActions() {
  const navigate = useNavigate();
  const { openWorkspace } = useOSStore();

  const handleBreathing = () => {
    openWorkspace("tool", "Breathing Tool", { toolId: "breathing" });
  };

  const handleGrounding = () => {
    openWorkspace("tool", "Grounding Tool", { toolId: "grounding" });
  };

  const handleJournaling = () => {
    navigate("/guide");
  };

  const handleDirectory = () => {
    openWorkspace("directory", "Directory", {});
  };

  const actions = [
    {
      label: "Breathing Tool",
      icon: Wind,
      onClick: handleBreathing,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Grounding Tool",
      icon: Anchor,
      onClick: handleGrounding,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      label: "Journaling",
      icon: BookOpen,
      onClick: handleJournaling,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Explore Directory",
      icon: Search,
      onClick: handleDirectory,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Quick Actions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border ${action.border} ${action.bg} transition hover:bg-white/10 ${action.color}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium text-white/70">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

