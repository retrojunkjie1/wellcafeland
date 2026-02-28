// src/apps/admin/AdminHubPage.jsx
// Phase 53C: Admin hub — God Eye, Overseer, Templates, Theme, Seed tiles

import React from "react";
import { useNavigate } from "react-router-dom";
import { Eye, LayoutDashboard, Zap, FileText, Palette, Database } from "lucide-react";
import PageHeader from "@/components/system/PageHeader";
import BackButton from "@/components/system/BackButton";
import { useGodEye } from "@/admin/godeye/GodEyeContext";

const TILE_CLASS = "flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-6 text-center hover:bg-white/10 hover:border-amber-400/20 transition min-h-[120px]";

export default function AdminHubPage() {
  const navigate = useNavigate();
  const { toggle: toggleGodEye } = useGodEye();

  const tiles = [
    { id: "god-eye", label: "God Eye", desc: "System observability", icon: Eye, onClick: toggleGodEye },
    { id: "overseer", label: "Overseer Console", desc: "Agent orchestration", icon: LayoutDashboard, to: "/admin/overseer" },
    { id: "overseer-ultra", label: "Overseer Ultra", desc: "Advanced console", icon: Zap, to: "/admin/overseer-ultra" },
    { id: "templates", label: "Templates", desc: "Session templates", icon: FileText, to: "/admin/templates" },
    { id: "theme", label: "Theme", desc: "Theme control", icon: Palette, to: "/admin/theme" },
    { id: "seed", label: "Seed Data", desc: "Seed & fixtures", icon: Database, to: "/admin/seed" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PageHeader
        title="Admin Hub"
        subtitle="God-Eye · Overseer · Templates · Theme"
        leftSlot={<BackButton to="/profile" />}
      />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => (t.onClick ? t.onClick() : t.to && navigate(t.to))}
              className={TILE_CLASS}
            >
              <Icon className="h-6 w-6 text-amber-400/80" />
              <span className="text-sm font-medium text-white">{t.label}</span>
              <span className="text-[11px] text-white/50">{t.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
