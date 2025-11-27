// src/components/navigation/MinimalSidebar.jsx
// Minimal vertical nav for chat-first OS

import React from "react";
import { Home, Compass, Clock, Sparkles, User, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInteractionCanvasStore } from "@/stores/useInteractionCanvasStore";
import clsx from "clsx";

const NAV_ITEMS = [
  { id: "home", icon: Home, href: "/", label: "Home" },
  { id: "explore", icon: Compass, action: "toggleExplore", label: "Explore" },
  { id: "moments", icon: Clock, href: "/dashboard?view=moments", label: "Moments" },
  { id: "insights", icon: Sparkles, href: "/dashboard?view=insights", label: "Insights" },
  { id: "profile", icon: User, href: "/profile", label: "Profile" },
];

const MinimalSidebar = ({ isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleExplore, isExploreOpen } = useInteractionCanvasStore();

  const handleClick = (item) => {
    if (item.action === "toggleExplore") {
      toggleExplore();
      if (isMobile) {
        onClose?.();
      }
    } else if (item.href) {
      navigate(item.href);
      if (isMobile) {
        onClose?.();
      }
    }
  };

  const isActive = (item) => {
    if (item.action === "toggleExplore") {
      return isExploreOpen;
    }
    if (item.href) {
      if (typeof item.href === "string") {
        return location.pathname === item.href;
      }
      return location.pathname === item.href.pathname;
    }
    return false;
  };

  return (
    <div
      className={clsx(
        "flex flex-col border-r border-white/5 bg-slate-950/95",
        isMobile ? "w-full" : "w-16"
      )}
    >
      <div className="flex-1 py-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={clsx(
                "w-full flex items-center justify-center p-3 rounded-xl transition-all",
                active
                  ? "bg-white/10 text-wcGold border-l-2 border-wcGold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MinimalSidebar;

