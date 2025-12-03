// src/apps/circles/CircleDetailPage.jsx
// Circle detail page with threads and members

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Plus, MessageSquare, Calendar, UserCheck } from "lucide-react";
import { getCircle, getCircleThreads, isCircleMember, joinCircle, leaveCircle } from "@/services/circlesService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const CircleDetailPage = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { userId } = useSessionIdentity();
  const [circle, setCircle] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId, userId]);

  const loadCircle = async () => {
    try {
      const [circleData, threadsData, membership] = await Promise.all([
        getCircle(circleId),
        getCircleThreads(circleId),
        isCircleMember(circleId),
      ]);

      setCircle(circleData);
      setThreads(threadsData);
      setIsMember(membership);
    } catch (err) {
      console.error("Failed to load circle:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      const result = await joinCircle(circleId);
      if (result.ok) {
        await loadCircle();
      }
    } catch (err) {
      console.error("Failed to join circle:", err);
    }
  };

  const handleLeave = async () => {
    try {
      const result = await leaveCircle(circleId);
      if (result.ok) {
        navigate("/circles");
      }
    } catch (err) {
      console.error("Failed to leave circle:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Circle" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading circle...</div>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Circle" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Circle not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={circle.title || `${circle.theme.charAt(0).toUpperCase() + circle.theme.slice(1)} Circle`}
        subtitle={circle.description}
      />
      <div className="lux-shell py-10 space-y-6">
        {/* Circle Info */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-white/70" />
              <h2 className="text-lg font-medium text-white">Circle Info</h2>
            </div>
            {isMember ? (
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 transition text-sm"
              >
                Leave Circle
              </button>
            ) : (
              <button
                onClick={handleJoin}
                className="px-4 py-2 rounded-lg border border-wcGold/30 bg-wcGold/10 text-wcGold hover:bg-wcGold/20 transition text-sm"
              >
                Join Circle
              </button>
            )}
          </div>
          
          <div className="space-y-2 text-sm text-white/70">
            <div>
              <span className="font-medium">Theme:</span>{" "}
              <span className="capitalize">{circle.theme || "general"}</span>
            </div>
            {circle.cadence && (
              <div>
                <span className="font-medium">Cadence:</span>{" "}
                <span className="capitalize">{circle.cadence}</span>
              </div>
            )}
            {circle.members && (
              <div>
                <span className="font-medium">Members:</span> {circle.members.length}
              </div>
            )}
          </div>
        </div>

        {/* Threads */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-white/70" />
              <h2 className="text-lg font-medium text-white">Threads</h2>
            </div>
            {isMember && (
              <button
                onClick={() => navigate(`/circles/${circleId}/threads/new`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>New Thread</span>
              </button>
            )}
          </div>

          {threads.length === 0 ? (
            <div className="text-white/50 text-sm">No threads yet. {isMember && "Create one to get started!"}</div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => navigate(`/circles/${circleId}/threads/${thread.id}`)}
                  className="w-full text-left p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="font-medium text-white mb-1">{thread.title}</div>
                  {thread.weeklyTheme && (
                    <div className="text-xs text-white/50">Theme: {thread.weeklyTheme}</div>
                  )}
                  <div className="text-xs text-white/50 mt-1">
                    {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : "Recently"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircleDetailPage;

