// src/apps/tools/components/ToolCard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { trackAction } from "../../../services/telemetry";
import { useOSStore } from "@/stores/useOSStore";

const ToolCard = ({ tool }) => {
  const navigate = useNavigate();
  const { injectToolIntoChat, setMode, MODES } = useOSStore();

  const handleOpenInChat = (e) => {
    e.stopPropagation();
    trackAction("tool_open_in_chat", {
      toolId: tool.id,
      toolName: tool.name,
    });
    
    // Navigate to chat and inject tool
    navigate("/chat");
    setMode(MODES.CHAT);
    setTimeout(() => {
      injectToolIntoChat(tool.id, {});
    }, 100);
  };

  const handleOpenInWorkspace = () => {
    trackAction("tool_card_click", {
      toolId: tool.id,
      toolName: tool.name,
    });
    navigate(`/tools/${tool.id}`);
  };

  const categoryLabels = {
    "body-breath": "Body & Breath",
    "mind-thoughts": "Mind & Thoughts",
    "stress-crisis": "Stress & Crisis",
    "sleep-winddown": "Sleep & Wind-down",
  };

  return (
    <div className="glass-panel flex h-full flex-col gap-4 p-5 transition hover:border-white/20 hover:bg-white/8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl text-white">{tool.icon}</div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">
              {categoryLabels[tool.category] || tool.category}
            </p>
            <h3 className="text-lg font-medium text-white mb-1">{tool.name}</h3>
            {tool.duration && (
              <p className="text-xs text-white/50">~{tool.duration}</p>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-white/70 leading-relaxed">{tool.description}</p>
      
      <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-white/5">
        <button
          type="button"
          onClick={handleOpenInChat}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Open in chat
        </button>
        <button
          type="button"
          onClick={handleOpenInWorkspace}
          className="rounded-lg bg-white/10 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
        >
          Open workspace
        </button>
      </div>
    </div>
  );
};

export default ToolCard;

