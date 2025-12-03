// src/apps/circles/CircleWorkspace.jsx
// Individual circle workspace with prompts

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, Sparkles } from "lucide-react";
import { getCircle, getTodaysPrompt, isCircleMember } from "@/services/circlesService";
import PageHeader from "@/components/navigation/PageHeader";

const CircleWorkspace = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCircle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circleId]);

  const loadCircle = async () => {
    try {
      const [circleData, membership, todaysPrompt] = await Promise.all([
        getCircle(circleId),
        isCircleMember(circleId),
        getTodaysPrompt(circleId),
      ]);

      setCircle(circleData);
      setIsMember(membership);
      setPrompt(todaysPrompt);
    } catch (err) {
      console.error("Failed to load circle:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Recovery Circle" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading circle...</div>
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Recovery Circle" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Circle not found</div>
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Recovery Circle" />
        <div className="lux-shell py-10">
          <div className="lux-card p-6 border border-white/10 bg-white/5 text-center">
            <p className="text-white/70 mb-4">You need to join this circle first.</p>
            <button
              onClick={() => navigate("/circles")}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
            >
              Back to Circles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={`${circle.theme.charAt(0).toUpperCase() + circle.theme.slice(1)} Circle`}
        subtitle={circle.description}
      />
      <div className="lux-shell py-10 space-y-6">
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-white/70" />
            <h2 className="text-lg font-medium text-white">Today's Reflection</h2>
          </div>
          
          {prompt ? (
            <div className="p-4 rounded-lg border border-wcGold/20 bg-wcGold/5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-wcGold flex-shrink-0 mt-0.5" />
                <p className="text-white text-base leading-relaxed">{prompt}</p>
              </div>
            </div>
          ) : (
            <div className="text-white/50">No prompt available for today.</div>
          )}
        </div>

        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-white/70" />
            <h2 className="text-lg font-medium text-white">Circle Info</h2>
          </div>
          
          <div className="space-y-2 text-sm text-white/70">
            <div>
              <span className="font-medium">Theme:</span>{" "}
              <span className="capitalize">{circle.theme}</span>
            </div>
            <div>
              <span className="font-medium">Cadence:</span>{" "}
              <span className="capitalize">{circle.cadence}</span>
            </div>
            <div>
              <span className="font-medium">Total Prompts:</span> {circle.prompts.length}
            </div>
          </div>
        </div>

        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <p className="text-sm text-white/60">
            This is a reflection circle. Take time with today's prompt. 
            Live chat and group features coming soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircleWorkspace;

