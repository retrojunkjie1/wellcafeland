// src/apps/milestones/MilestonesPage.jsx
// Display user recovery milestones (30, 60, 90, 180, 365 days)

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { trackPageView } from "../../services/telemetry";
import { Trophy, Award, Sparkles, Calendar } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";

const MILESTONE_CONFIG = [
  { days: 30, tier: "bronze", label: "30 Days", color: "text-amber-600" },
  { days: 60, tier: "silver", label: "60 Days", color: "text-slate-400" },
  { days: 90, tier: "gold", label: "90 Days", color: "text-wcGold" },
  { days: 180, tier: "platinum", label: "180 Days", color: "text-cyan-400" },
  { days: 365, tier: "diamond", label: "1 Year", color: "text-purple-400" },
];

const MilestonesPage = () => {
  const { userId } = useSessionIdentity();
  const [milestones, setMilestones] = useState([]);
  const [daysSober, setDaysSober] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Milestones - WellnessCafe";
    trackPageView("milestones");
    loadMilestones();
  }, [userId]);

  const loadMilestones = async () => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    try {
      // Get client document to find daysSober
      const clientRef = collection(db, "clients");
      const clientQuery = query(clientRef, where("userId", "==", userId));
      const clientSnapshot = await getDocs(clientQuery);

      if (!clientSnapshot.empty) {
        const clientData = clientSnapshot.docs[0].data();
        setDaysSober(clientData.daysSober || 0);

        // Get earned milestones
        const milestonesRef = collection(
          db,
          "clients",
          clientSnapshot.docs[0].id,
          "milestones"
        );
        const milestonesQuery = query(
          milestonesRef,
          orderBy("milestone", "asc")
        );
        const milestonesSnapshot = await getDocs(milestonesQuery);

        const earned = milestonesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMilestones(earned);
      }
    } catch (err) {
      console.error("Failed to load milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (milestoneDays) => {
    const earned = milestones.find((m) => m.milestone === milestoneDays);
    const isEarned = !!earned;
    const isUnlocked = daysSober >= milestoneDays;

    return {
      earned: isEarned,
      unlocked: isUnlocked,
      earnedAt: earned?.earnedAt,
      tier: MILESTONE_CONFIG.find((m) => m.days === milestoneDays)?.tier,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PageHeader title="Milestones" subtitle="Your recovery milestones" />
        <div className="lux-shell py-10 flex items-center justify-center">
          <p className="text-muted-foreground">Loading milestones...</p>
        </div>
      </div>
    );
  }

  const getNextMilestone = () => {
    return MILESTONE_CONFIG.find((m) => daysSober < m.days);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Milestones" subtitle="Your recovery milestones" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wcGold mx-auto mb-4" />
            <p className="text-sm text-white/60">Loading milestones...</p>
          </div>
        </div>
      </div>
    );
  }

  const nextMilestone = getNextMilestone();
  const progressToNext = nextMilestone
    ? Math.min((daysSober / nextMilestone.days) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader title="Milestones" subtitle="Your recovery milestones" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-wcGold" />
            <h1 className="text-3xl font-light tracking-wide">Recovery Milestones</h1>
          </div>
          <p className="text-sm text-white/60 max-w-xl mx-auto">
            Celebrate your journey. Every milestone is a testament to your strength and commitment.
          </p>
        </header>

        {/* Current Progress */}
        <div className="mb-12 rounded-lg border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-1">
                Current Progress
              </p>
              <p className="text-2xl font-semibold text-white">
                {daysSober} {daysSober === 1 ? "Day" : "Days"} Sober
              </p>
            </div>
            {nextMilestone && (
              <div className="text-right">
                <p className="text-xs text-white/50 mb-1">Next milestone</p>
                <p className="text-lg font-medium text-wcGold">
                  {nextMilestone.label}
                </p>
              </div>
            )}
          </div>

          {nextMilestone && (
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-wcGold transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-2 text-center">
                {nextMilestone.days - daysSober} days until {nextMilestone.label}
              </p>
            </div>
          )}
        </div>

        {/* Milestones Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MILESTONE_CONFIG.map((milestone) => {
            const status = getMilestoneStatus(milestone.days);
            const isEarned = status.earned;
            const isUnlocked = status.unlocked;

            return (
              <div
                key={milestone.days}
                className={`rounded-lg border p-6 transition-all ${
                  isEarned
                    ? "border-wcGold/50 bg-wcGold/10 shadow-gold-ring"
                    : isUnlocked
                    ? "border-white/20 bg-white/5"
                    : "border-white/10 bg-white/[0.02] opacity-50"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isEarned ? (
                        <Award className={`h-5 w-5 ${milestone.color}`} />
                      ) : (
                        <Calendar className="h-5 w-5 text-white/30" />
                      )}
                      <h3 className="text-lg font-medium text-white">
                        {milestone.label}
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 capitalize">
                      {milestone.tier} tier
                    </p>
                  </div>
                  {isEarned && (
                    <Sparkles className="h-5 w-5 text-wcGold" />
                  )}
                </div>

                {isEarned && status.earnedAt && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">
                      Earned{" "}
                      {status.earnedAt.toDate
                        ? new Date(status.earnedAt.toDate()).toLocaleDateString()
                        : "recently"}
                    </p>
                  </div>
                )}

                {!isUnlocked && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/40">
                      {milestone.days - daysSober} days to go
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Encouragement Message */}
        {daysSober === 0 && (
          <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-white/70">
              Your journey begins today. Every day you choose recovery is a milestone worth celebrating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonesPage;

