// src/components/dashboard/MilestonesWidget.jsx
// Milestones and streak widget for dashboard

import React, { useState, useEffect } from "react";
import { Trophy, Flame, Loader2 } from "lucide-react";
import { getMilestoneSummary } from "@/services/milestoneService";

const MilestonesWidget = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const data = await getMilestoneSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentStreak = summary?.streak?.current || 0;
  const longestStreak = summary?.streak?.longest || 0;
  const coins = summary?.coins || [];

  // Find next milestone
  const nextMilestone = [7, 14, 30, 60, 90].find(m => m > currentStreak);
  const progressToNext = nextMilestone ? (currentStreak / nextMilestone) * 100 : 0;

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-wcGold" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-wcGold" />
        <h3 className="text-sm font-medium text-white">Your Progress</h3>
      </div>

      {/* Streak Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-white/70">Current Streak</span>
          </div>
          <span className="text-lg font-semibold text-white">
            {currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? "s" : ""}` : "Start today"}
          </span>
        </div>
        
        {longestStreak > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Longest streak</span>
            <span className="text-sm text-white/80">{longestStreak} days</span>
          </div>
        )}

        {/* Progress to next milestone */}
        {nextMilestone && currentStreak > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Next: {nextMilestone} days</span>
              <span className="text-white/80">{Math.round(progressToNext)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-wcGold rounded-full transition-all"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Unlocked Coins */}
      {coins.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-white/70">Recent Milestones</p>
          <div className="flex flex-wrap gap-2">
            {coins.slice(0, 5).map((coin) => (
              <div
                key={coin.id}
                className="flex items-center gap-1.5 rounded-full bg-wcGold/10 border border-wcGold/20 px-2 py-1"
                title={coin.label}
                aria-label={`Milestone: ${coin.label}`}
              >
                <Trophy className="h-3 w-3 text-wcGold" />
                <span className="text-[10px] font-medium text-wcGold">{coin.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-xs text-white/60 leading-relaxed">
            Your progress starts the moment you show up. Today can be Day 1.
          </p>
        </div>
      )}
    </div>
  );
};

export default MilestonesWidget;

