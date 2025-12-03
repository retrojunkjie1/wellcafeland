// src/components/dashboard/QuickActions.jsx
// Phase 33: Quick action tiles

import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Compass, BookOpen, Heart } from "lucide-react";

const actions = [
  {
    id: "chat",
    label: "Start Chat",
    icon: MessageCircle,
    path: "/chat",
    color: "from-amber-400/20 to-amber-300/10",
    borderColor: "border-amber-400/30",
  },
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    path: "/explore",
    color: "from-teal-400/20 to-teal-300/10",
    borderColor: "border-teal-400/30",
  },
  {
    id: "tools",
    label: "Tools",
    icon: BookOpen,
    path: "/tools",
    color: "from-purple-400/20 to-purple-300/10",
    borderColor: "border-purple-400/30",
  },
  {
    id: "recovery",
    label: "Recovery",
    icon: Heart,
    path: "/recovery",
    color: "from-emerald-400/20 to-emerald-300/10",
    borderColor: "border-emerald-400/30",
  },
];

export default function QuickActions({ onOpenDetail }) {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    // Navigate to the action path
    navigate(action.path);
    // Optionally open detail sheet to explain tools
    if (onOpenDetail) {
      onOpenDetail("quick");
    }
  };

  return (
    <div className="rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md p-3 sm:p-4">
      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">Quick Actions</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action)}
              className={`
                flex flex-col items-center justify-center gap-1 p-2 rounded-xl
                bg-gradient-to-br ${action.color}
                border ${action.borderColor}
                hover:opacity-80 transition-opacity
              `}
            >
              <Icon className="h-6 w-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
              <span className="text-[10px] text-white/80 font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
