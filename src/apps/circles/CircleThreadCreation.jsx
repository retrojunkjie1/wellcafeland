// src/apps/circles/CircleThreadCreation.jsx
// Create new thread form

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createThread } from "@/services/circlesService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const CircleThreadCreation = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { userId } = useSessionIdentity();
  const [title, setTitle] = useState("");
  const [weeklyTheme, setWeeklyTheme] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || creating) return;

    setCreating(true);
    try {
      const result = await createThread(circleId, title, userId, weeklyTheme || null);
      if (result.ok) {
        navigate(`/circles/${circleId}/threads/${result.threadId}`);
      } else {
        alert(result.error || "Failed to create thread");
      }
    } catch (err) {
      console.error("Failed to create thread:", err);
      alert("Failed to create thread. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="Create Thread"
        backTo={`/circles/${circleId}`}
      />
      <div className="lux-shell py-10">
        <div className="lux-card p-6 border border-white/10 bg-white/5 max-w-2xl mx-auto">
          <h2 className="text-lg font-medium text-white mb-4">New Thread</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Thread Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's this thread about?"
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Weekly Theme (optional)
              </label>
              <input
                type="text"
                value={weeklyTheme}
                onChange={(e) => setWeeklyTheme(e.target.value)}
                placeholder="e.g., Gratitude, Forgiveness, Growth"
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-wcGold/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate(`/circles/${circleId}`)}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || creating}
                className="px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Thread"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleThreadCreation;

