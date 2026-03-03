// src/apps/admin/AdminHubPage.jsx
// Phase 53C: Admin hub — God Eye, Overseer, Templates (minimal, no guards)

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, LayoutDashboard, Zap, FileText } from "lucide-react";
import PageHeader from "@/components/system/PageHeader";
import BackButton from "@/components/system/BackButton";
import NotReadyCard from "@/components/system/NotReadyCard";

const TILE_CLASS = "flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-5 text-center hover:bg-white/7 transition min-h-[100px]";

export default function AdminHubPage() {
  const [showGodEyeNotReady, setShowGodEyeNotReady] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PageHeader
        title="Admin Hub"
        subtitle="God-eye visibility and overseer orchestration"
        leftSlot={<BackButton to="/profile" />}
      />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setShowGodEyeNotReady(true)}
          className={TILE_CLASS}
        >
          <Eye className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">God Eye</span>
        </button>
        <Link to="/admin/overseer" className={TILE_CLASS}>
          <LayoutDashboard className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">Overseer Console</span>
        </Link>
        <Link to="/admin/overseer-ultra" className={TILE_CLASS}>
          <Zap className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">Overseer Ultra</span>
        </Link>
        <Link to="/admin/templates" className={TILE_CLASS}>
          <FileText className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">Templates</span>
        </Link>
      </div>
      {showGodEyeNotReady && (
        <div className="mt-6">
          <NotReadyCard
            title="God Eye"
            body="System observability is being brought online safely."
            actions={[{ label: "Chat", to: "/chat" }, { label: "Tools", to: "/tools" }]}
          />
          <button
            type="button"
            onClick={() => setShowGodEyeNotReady(false)}
            className="mt-3 text-xs text-slate-400 hover:text-white/80"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
