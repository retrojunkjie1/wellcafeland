// src/apps/tools/components/ToolCard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { trackAction } from "../../../services/telemetry";
import { useOSStore } from "@/stores/useOSStore";

const ToolCard = ({ tool, variant = "list" }) => {
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

  // Truncate description to 1-2 lines
  const truncatedDescription = tool.description?.length > 100 
    ? tool.description.substring(0, 100) + "..."
    : tool.description;

  // List variant: compact row
  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={handleOpenInWorkspace}
        className="glass-panel w-full flex items-center gap-3 px-3 py-2.5 transition hover:border-white/20 hover:bg-white/8 text-left group"
      >
        <div className="text-lg text-white/60 flex-shrink-0 group-hover:text-white/80 transition">{tool.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="text-sm font-medium text-white truncate">{tool.name}</h3>
            <span className="text-[9px] uppercase tracking-wider text-white/35 flex-shrink-0">
              {tool.intensity || "LOW"}
            </span>
          </div>
          <p className="text-xs text-white/55 leading-relaxed line-clamp-1">
            {truncatedDescription}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-white/40">{categoryLabels[tool.category] || tool.category}</span>
          {tool.duration && (
            <span className="text-[10px] text-white/40">• {tool.duration}</span>
          )}
        </div>
      </button>
    );
  }

  // Card variant: for featured/recommended tools only
  return (
    <div className="glass-panel flex min-h-[80px] flex-col gap-2 p-3 transition hover:border-white/20 hover:bg-white/8">
      <div className="flex items-start gap-2.5 flex-1">
        <div className="text-xl text-white/80 flex-shrink-0 mt-0.5">{tool.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="text-sm font-medium text-white truncate">{tool.name}</h3>
            <span className="text-[10px] uppercase tracking-wider text-white/40 flex-shrink-0">
              {tool.intensity || "LOW"}
            </span>
          </div>
          <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-1">
            {truncatedDescription}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {categoryLabels[tool.category] || tool.category}
            </p>
            {tool.duration && (
              <span className="text-[10px] text-white/40">• {tool.duration}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
        <button
          type="button"
          onClick={handleOpenInChat}
          className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition"
        >
          <MessageCircle className="h-3 w-3" />
          Chat
        </button>
        <button
          type="button"
          onClick={handleOpenInWorkspace}
          className="rounded bg-white/10 px-3 py-1 text-[11px] font-medium text-white hover:bg-white/20 transition"
        >
          Open
        </button>
      </div>
    </div>
  );
};

export default ToolCard;

