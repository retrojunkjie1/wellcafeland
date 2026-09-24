// src/apps/circles/CirclesPage.jsx
// Recovery circles listing page

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { withFrom } from "@/navigation/linkState";
import { Users, Heart, Sparkles, Calendar } from "lucide-react";
import { listCircles, joinCircle, getUserCircles } from "@/services/circlesService";

const CirclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [circles, setCircles] = useState([]);
  const [userCircles, setUserCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [actionError, setActionError] = useState("");

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
        {actionError && <p role="alert" className="mb-4 rounded-xl border border-rose-300/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100/85">{actionError}</p>}
        {circles.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
            <h2 className="text-lg font-medium text-white">No circles are available right now</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">You can explore other ways to connect or find local support while community circles are unavailable.</p>
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
