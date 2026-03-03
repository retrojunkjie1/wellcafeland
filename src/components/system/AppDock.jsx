// src/components/system/AppDock.jsx
// Unified dock: BottomNav + Chat composer (ChatGPT-like)

import React, { useState } from "react";
import { Home, Compass, LifeBuoy, Activity, User, Shield } from "lucide-react";
import ChatComposerBar from "./ChatComposerBar";
import { useOSStore } from "@/stores/useOSStore";
import VoiceCheckInSheet from "@/components/tools/VoiceCheckInSheet";
import { useSheet } from "@/context/SheetContext";

const TABS = [
  { id: "home", label: "Home", path: "/", icon: Home },
  { id: "explore", label: "Explore", path: "/explore", icon: Compass },
  { id: "assistance", label: "Assistance", path: "/assistance", icon: LifeBuoy },
  { id: "signals", label: "Signals", path: "/dashboard", icon: Activity },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];
const ADMIN_TAB = { id: "admin", label: "Admin", path: "/admin", icon: Shield };

export default function AppDock({ location, navigate, isActivePath, isAdmin }) {
  const path = location?.pathname || "";
  const showComposer = path === "/" || path === "/chat";
  const dockBind = useOSStore((s) => s.dockComposerBind);
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const { sheetOpen } = useSheet();

  const handleMic = () => {
    setVoiceSheetOpen(true);
  };

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/70 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] transition-opacity ${sheetOpen ? "opacity-0 pointer-events-none" : ""}`}
        style={{ minHeight: "var(--wc-dock-h,76px)" }}
      >
        {showComposer && (
          <div className="px-4 pt-2 pb-1">
            {path === "/chat" && dockBind ? (
              <ChatComposerBar
                value={dockBind.input}
                onChange={(v) => dockBind.setInput(v)}
                onSend={() => dockBind.handleSend(dockBind.input)}
                onMic={handleMic}
                onFaceScan={dockBind.onFaceScan}
                disabled={dockBind.disabled}
                placeholder="Ask anything"
                isSending={dockBind.isSending}
                compact
              />
            ) : path === "/" ? (
              <ChatComposerBar
                value=""
                onChange={() => {}}
                onSend={() => {}}
                onMic={handleMic}
                placeholder="Say it simply…"
                compact
                entryMode
                onEntrySubmit={(text) => navigate(`/chat?prefill=${encodeURIComponent(text)}`)}
              />
            ) : null}
          </div>
        )}
        <nav className="px-2 pb-2">
          <div className="mx-auto flex max-w-3xl justify-between">
            {[...TABS, ...(isAdmin ? [ADMIN_TAB] : [])].map((tab) => {
              const Icon = tab.icon;
              const active = isActivePath(tab.path);
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition min-h-[44px] min-w-[44px] justify-center ${
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
      </div>

      <VoiceCheckInSheet open={voiceSheetOpen} onClose={() => setVoiceSheetOpen(false)} />
    </>
  );
}
