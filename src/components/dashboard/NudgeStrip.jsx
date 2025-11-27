// src/components/dashboard/NudgeStrip.jsx
// Gentle nudge strip for reflection prompts

import React, { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getNudgesForUser } from "@/services/nudgeService";
import { useOSStore } from "@/stores/useOSStore";

const NudgeStrip = () => {
  const navigate = useNavigate();
  const { openWorkspace, addMessage } = useOSStore();
  const [nudges, setNudges] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNudges();
  }, []);

  const loadNudges = async () => {
    setLoading(true);
    try {
      const data = await getNudgesForUser();
      // Filter out dismissed nudges
      const active = data.filter(n => !dismissed.has(n.id));
      setNudges(active);
    } catch (err) {
      console.error("Failed to load nudges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (nudgeId) => {
    setDismissed(prev => new Set([...prev, nudgeId]));
    setNudges(prev => prev.filter(n => n.id !== nudgeId));
    
    // Save dismissal to localStorage
    try {
      const key = "wc-dismissed-nudges";
      const stored = JSON.parse(localStorage.getItem(key) || "[]");
      if (!stored.includes(nudgeId)) {
        stored.push(nudgeId);
        localStorage.setItem(key, JSON.stringify(stored));
      }
    } catch {
      // Silently fail
    }
  };

  const handleAction = (nudge) => {
    const { actionType, actionPayload } = nudge;

    switch (actionType) {
      case "open_tool":
        if (actionPayload?.toolId) {
          openWorkspace("tool", nudge.actionLabel, { toolType: actionPayload.toolId });
          navigate(`/workspace/${actionPayload.toolId}`);
        }
        break;
      case "open_chat_with_prompt":
        if (actionPayload?.prompt) {
          navigate("/chat");
          // Add prompt to chat input (would need to integrate with ChatPanel)
          setTimeout(() => {
            addMessage("user", actionPayload.prompt);
          }, 100);
        }
        break;
      case "open_directory":
        navigate(actionPayload?.path || "/directory");
        break;
      case "open_dashboard":
        navigate("/dashboard");
        break;
      default:
        navigate("/chat");
    }

    // Dismiss after action
    handleDismiss(nudge.id);
  };

  if (loading || nudges.length === 0) {
    return null;
  }

  // Show only the first (highest priority) nudge
  const nudge = nudges[0];

  return (
    <div className="rounded-lg border border-wcGold/20 bg-wcGold/5 p-3 flex items-start gap-3 animate-fade-in">
      <Sparkles className="h-4 w-4 text-wcGold flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/90 leading-relaxed mb-2">{nudge.text}</p>
        <button
          type="button"
          onClick={() => handleAction(nudge)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-wcGold px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-amber-300 transition"
        >
          {nudge.actionLabel}
        </button>
      </div>
      <button
        type="button"
        onClick={() => handleDismiss(nudge.id)}
        className="flex-shrink-0 rounded p-1 text-white/40 hover:text-white hover:bg-white/10 transition"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default NudgeStrip;

