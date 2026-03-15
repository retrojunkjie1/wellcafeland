import React from "react";
import { useSheet } from "@/context/SheetContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, LifeBuoy, Activity, User } from "lucide-react";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];

export default function AppDock() {
  const { sheetOpen } = useSheet();
  const location = useLocation();
  const navigate = useNavigate();

  const isActivePath = (tabPath) => {
    if (!tabPath) return false;
    if (tabPath === "/" && (location.pathname === "/" || location.pathname.startsWith("/chat"))) return true;
    if (tabPath === "/explore" && (location.pathname.startsWith("/explore") || location.pathname.startsWith("/tools") || location.pathname.startsWith("/recovery"))) return true;
    if (tabPath === "/assistance" && (location.pathname.startsWith("/assistance") || location.pathname.startsWith("/resources") || location.pathname.startsWith("/workspace"))) return true;
    if (tabPath === "/dashboard" && location.pathname.startsWith("/dashboard")) return true;
    if (tabPath === "/profile" && location.pathname.startsWith("/profile")) return true;
    return location.pathname === tabPath;
  };

  return (
    <nav className={`wc-fixed-bottom-nav z-30 border-t border-white/10 bg-white/5 backdrop-blur-xl px-2 transition-opacity ${sheetOpen ? "opacity-0 pointer-events-none" : ""}`}>
      <div className="mx-auto flex max-w-3xl justify-between items-center h-full min-h-0 py-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActivePath(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 h-11 min-w-11 rounded-xl text-[10px] transition ${
                active ? "bg-amber-400/10 text-amber-200" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-amber-300" : "text-white/50"}`} />
              <span className="leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
