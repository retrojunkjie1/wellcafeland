// src/apps/circles/CirclesPage.jsx
// Recovery circles listing page

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { withFrom } from "@/navigation/linkState";
import { Users, Heart, Sparkles, Calendar, Compass } from "lucide-react";
import { listCircles, joinCircle, getUserCircles } from "@/services/circlesService";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";
import PrivateFriendGroupsPanel from "./PrivateFriendGroupsPanel";

const CirclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [circles, setCircles] = useState([]);
  const [userCircles, setUserCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [actionError, setActionError] = useState("");
  const [connectionPreference, setConnectionPreference] = useState("not_sure");
  const [shepherdLoading, setShepherdLoading] = useState(false);
  const [shepherdSuggestion, setShepherdSuggestion] = useState(null);
  const [shepherdError, setShepherdError] = useState("");

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const [allCircles, myCircles] = await Promise.all([
        listCircles(),
        getUserCircles(),
      ]);
      setCircles(Array.isArray(allCircles) ? allCircles : []);
      setUserCircles(Array.isArray(myCircles) ? myCircles.map((c) => c.id) : []);
    } catch (err) {
      console.error("Failed to load circles:", err);
      setCircles([]);
      setUserCircles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId) => {
    setJoining(circleId);
    setActionError("");
    try {
      const result = await joinCircle(circleId);
      if (result.ok) {
        await loadCircles(); // Reload to update membership
        navigate(`/circles/${circleId}`, withFrom(location));
      } else {
        setActionError(result.error || "We couldn’t join that circle. Please try again.");
      }
    } catch (err) {
      console.error("Failed to join circle:", err);
      setActionError("We couldn’t join that circle. Please try again.");
    } finally {
      setJoining(null);
    }
  };

  const requestShepherdSuggestion = async () => {
    if (shepherdLoading) return;
    setShepherdLoading(true);
    setShepherdError("");
    setShepherdSuggestion(null);
    try {
      const { result } = await runWellnessExperience("community.connection-option", { preference: connectionPreference });
      if (![result.summary, result.invitation, result.nextStep].every((value) => typeof value === "string" && value.trim())) {
        throw new Error("Shepherd did not return a complete suggestion.");
      }
      setShepherdSuggestion({
        summary: result.summary.trim().slice(0, 180),
        invitation: result.invitation.trim().slice(0, 300),
        nextStep: result.nextStep.trim().slice(0, 240),
      });
    } catch (error) {
      setShepherdError(error?.message || "A connection idea is not available right now. You can still browse or leave this for later.");
    } finally {
      setShepherdLoading(false);
    }
  };

  const getThemeIcon = (theme) => {
    switch (theme) {
      case "men":
      case "women":
        return <Users className="h-5 w-5" />;
      case "spiritual":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading circles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="lux-shell py-10">
        <PrivateFriendGroupsPanel />
        {actionError && <p role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100/85">{actionError}</p>}
        <section className="mb-6 rounded-2xl border border-violet-100/15 bg-violet-100/[0.035] p-5" aria-label="Optional community connection guidance">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-sm font-medium text-white"><Compass className="h-4 w-4 text-violet-100" /> Not sure whether to join?</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">Choose what feels comfortable. Shepherd uses only that choice to offer one low-pressure next step. It will not join or contact anyone for you.</p>
            </div>
            <button type="button" onClick={requestShepherdSuggestion} disabled={shepherdLoading} className="min-h-11 rounded-full border border-violet-100/25 bg-violet-100/[0.08] px-4 text-sm text-violet-50 hover:bg-violet-100/[0.14] disabled:cursor-wait disabled:opacity-60">
              {shepherdLoading ? "Finding an idea…" : shepherdSuggestion ? "Another idea" : "Help me choose"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Connection preference">
            {[
              ["not_sure", "I'm not sure yet"],
              ["browse_first", "Browse without joining"],
              ["peer_circle", "Consider a peer circle"],
              ["trusted_person", "One trusted person"],
            ].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={connectionPreference === value} onClick={() => { setConnectionPreference(value); setShepherdSuggestion(null); setShepherdError(""); }} className={`min-h-10 rounded-full border px-3 text-xs transition ${connectionPreference === value ? "border-violet-100/35 bg-violet-100/[0.14] text-white" : "border-white/10 bg-white/[0.025] text-white/65 hover:bg-white/[0.06]"}`}>
                {label}
              </button>
            ))}
          </div>
          {shepherdSuggestion && <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4" aria-live="polite"><p className="text-sm text-white/60">{shepherdSuggestion.summary}</p><p className="mt-2 text-base leading-relaxed text-white">{shepherdSuggestion.invitation}</p><p className="mt-2 text-sm leading-relaxed text-white/70">One option: {shepherdSuggestion.nextStep}</p></div>}
          {shepherdError && <p role="alert" className="mt-3 text-sm text-amber-100">{shepherdError}</p>}
        </section>
        {circles.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
            <h2 className="text-lg font-medium text-white">No public circles are available right now</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">You can create an invite-only group above, explore the wider community, or find local support.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => navigate("/social/feed")} className="min-h-11 rounded-full border border-white/15 px-4 text-sm text-white/85 hover:bg-white/5">Explore community</button>
              <button type="button" onClick={() => navigate("/assistance")} className="min-h-11 rounded-full border border-amber-200/20 px-4 text-sm text-amber-100/85 hover:bg-amber-100/5">Find local support</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle) => {
              const isMember = userCircles.includes(circle.id);
              return (
                <div
                  key={circle.id}
                  className="lux-card p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {getThemeIcon(circle.theme)}
                    <h3 className="text-lg font-medium text-white capitalize">
                      {circle.theme} Circle
                    </h3>
                  </div>
                  
                  <p className="text-sm text-white/70 mb-4 line-clamp-3">
                    {circle.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                    <Calendar className="h-3 w-3" />
                    <span className="capitalize">{circle.cadence}</span>
                  </div>

                  {isMember ? (
                    <button
                      onClick={() => navigate(`/circles/${circle.id}`, withFrom(location))}
                      className="w-full px-4 py-2 rounded-lg border border-wcGold/30 bg-wcGold/10 text-wcGold hover:bg-wcGold/20 transition text-sm"
                    >
                      Open Circle
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinCircle(circle.id)}
                      disabled={joining === circle.id}
                      className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm disabled:opacity-50"
                    >
                      {joining === circle.id ? "Joining..." : "Join Circle"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CirclesPage;
