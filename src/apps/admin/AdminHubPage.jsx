// src/apps/admin/AdminHubPage.jsx
// Phase 53C: Admin hub — God Eye, Overseer, Templates (minimal, no guards)

import { Link } from "react-router-dom";
import { Eye, LayoutDashboard, Zap, FileText, BadgeCheck } from "lucide-react";
import PageHeader from "@/components/system/PageHeader";
import BackButton from "@/components/system/BackButton";

const TILE_CLASS = "flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-5 text-center hover:bg-white/7 transition min-h-[100px]";

export default function AdminHubPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PageHeader
        title="Admin Hub"
        subtitle="God-eye visibility and overseer orchestration"
        leftSlot={<BackButton to="/profile" />}
      />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/admin/overseer" className={TILE_CLASS}>
          <Eye className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">God Eye</span>
        </Link>
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
        <Link to="/admin/practitioners" className={TILE_CLASS}>
          <BadgeCheck className="h-6 w-6 text-amber-400/80" />
          <span className="text-sm font-medium text-white">Practitioner review</span>
        </Link>
      </div>
    </div>
  );
}
