// src/apps/dashboard/DashboardPage.jsx

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Leaf, BookOpen, Loader2, Feather } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAIStore } from "../ai/useAIStore";
import { useAuth } from "@/context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { guestStorage } from "@/utils/guestStorage";
import { runPredictiveRecoveryEngineForClient } from "@/ai/predictive/predictiveRecoveryEngine";
import { getRiskLevelColor } from "@/ai/predictive/predictiveConfig";
import { useOSStore } from "@/stores/useOSStore";
import MilestonesWidget from "@/components/dashboard/MilestonesWidget";
import FavoritesWidget from "@/components/dashboard/FavoritesWidget";
import NudgeStrip from "@/components/dashboard/NudgeStrip";
import SupportersStrip from "@/components/dashboard/SupportersStrip";
import WellnessSettings from "@/components/dashboard/WellnessSettings";
import ProviderRecommendationsWidget from "@/components/dashboard/ProviderRecommendationsWidget";
import FooterMinimal from "@/components/FooterMinimal";
import PageHeader from "@/components/navigation/PageHeader";
// New intelligence signal components
import SignalHeader from "@/components/dashboard/SignalHeader";
import EmotionStrip from "@/components/dashboard/EmotionStrip";
import RiskStrip from "@/components/dashboard/RiskStrip";
import TriggerStrip from "@/components/dashboard/TriggerStrip";
import HumanModeStrip from "@/components/dashboard/HumanModeStrip";
import FaceSignalStrip from "@/components/dashboard/FaceSignalStrip";
import TrajectoryGraph from "@/components/dashboard/TrajectoryGraph";
import QuickActions from "@/components/dashboard/QuickActions";

const SUPPORT_COPY = {
  low: {
    label: "Steady",
    description: "Your routines look steady this week. Keep nurturing what feels good.",
  },
  moderate: {
    label: "Gentle Waves",
    description: "A few waves showed up this week. Stay close to grounding rituals.",
  },
  high: {
    label: "Extra Care",
    description: "This week asked a lot of you. Lean on support and take it slow.",
  },
  insufficient_data: {
    label: "Still Gathering",
    description: "We need a bit more activity to reflect on your week. Check in again soon.",
  },
};

function softenSignal(text = "") {
  return text
    .replace(/risk/gi, "pattern")
    .replace(/crisis/gi, "intense moment")
    .replace(/high-urge/gi, "strong urge")
    .replace(/warning/gi, "gentle reminder");
}

function getSupportCopy(level) {
  return SUPPORT_COPY[level] || SUPPORT_COPY.insufficient_data;
}

export default function DashboardPage() {
  const sessions = useAIStore((state) => state.sessions);
  const { user } = useAuth();
  const identity = useSessionIdentity();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(() => {
    return typeof window !== "undefined" ? Date.now() : 0;
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState(() => {
    return searchParams.get("view") === "insights" ? "insights" : "moments";
  });
  useEffect(() => {
    const view = searchParams.get("view") === "insights" ? "insights" : "moments";
    setActiveView(view);
  }, [searchParams]);

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === "moments") {
      setSearchParams({});
    } else {
      setSearchParams({ view });
    }
  };
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };
    
    // Initialize
    updateTime();
    
    // Update timestamp every minute for relative times
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset insights when user changes
    setInsightsData(null);
    setInsightsError(null);
  }, [user?.uid]);

  useEffect(() => {
    // Guest mode: load from sessionStorage
    if (identity.mode === "guest") {
      if (activeView === "insights") {
        const guestInsights = guestStorage.getInsights();
        setInsightsData(guestInsights);
        setInsightsLoading(false);
      }
      return;
    }

    // Account mode: load from Firestore
    if (activeView !== "insights" || !user?.uid) {
      return;
    }

    if (insightsData && insightsData.clientId === user.uid) {
      return;
    }

    let cancelled = false;

    const loadInsights = async () => {
      try {
        setInsightsLoading(true);
        setInsightsError(null);
        const result = await runPredictiveRecoveryEngineForClient(user.uid, { days: 7 });
        if (!cancelled) {
          setInsightsData(result);
        }
      } catch {
        if (!cancelled) {
          setInsightsError("Unable to load this week's insights right now.");
          setInsightsData(null);
        }
      } finally {
        if (!cancelled) {
          setInsightsLoading(false);
        }
      }
    };

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, [activeView, user?.uid, insightsData, identity.mode]);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const formatRelativeTime = useCallback(
    (timestamp) => {
      if (!timestamp) return "Just now";
      const diffMinutes = Math.floor((currentTime - timestamp) / 60000);
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      return new Date(timestamp).toLocaleDateString();
    },
    [currentTime]
  );

  const moments = useMemo(() => {
    // Guest mode: use guestStorage
    if (identity.mode === "guest") {
      const guestMoments = guestStorage.getMoments();
      return guestMoments
        .map((moment) => ({
          id: moment.id,
          title: moment.title || "Emotional check-in",
          preview: moment.content
            ? `${moment.content.slice(0, 140)}${moment.content.length > 140 ? "…" : ""}`
            : "Add a short note about how you feel to build your timeline.",
          updatedAt: moment.createdAt || Date.now(),
          timeLabel: formatRelativeTime(moment.createdAt || Date.now()),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // Account mode: use sessions
    if (!Array.isArray(sessions)) return [];
    return sessions
      .map((session) => {
        const firstUserMessage = session?.messages?.find((msg) => msg.role === "user");
        const updatedAt = session?.updatedAt || session?.createdAt || Date.now();
        return {
          id: session.id,
          title: session.title || "Emotional check-in",
          preview: firstUserMessage?.content
            ? `${firstUserMessage.content.slice(0, 140)}${firstUserMessage.content.length > 140 ? "…" : ""}`
            : "Add a short note about how you feel to build your timeline.",
          updatedAt,
          timeLabel: formatRelativeTime(updatedAt),
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, formatRelativeTime, identity.mode]);

  const hasMoments = moments.length > 0;
  const totalMoments = moments.length;
  const weeklyMoments = useMemo(() => {
    const weekAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
    return moments.filter((moment) => moment.updatedAt >= weekAgo).length;
  }, [moments, currentTime]);

  const streakDays = useMemo(() => {
    if (!hasMoments) return 0;
    const dateSet = new Set(
      moments.map((moment) => new Date(moment.updatedAt).toISOString().split("T")[0])
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const key = checkDate.toISOString().split("T")[0];
      if (dateSet.has(key)) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [moments, hasMoments]);

  const lastMomentLabel = hasMoments ? moments[0].timeLabel : "No moments yet";

  const handleRevisitMoment = (sessionId) => {
    if (!sessionId) return;
    const store = useAIStore.getState();
    store.loadSession(sessionId);
    store.openConsole();
  };

  const handleGuidedReflection = () => {
    const store = useAIStore.getState();
    store.startWithPrompt("I’d like to check in about how I’m feeling right now.");
  };

  const handleRefreshInsights = () => {
    setInsightsData(null);
    setInsightsError(null);
    if (activeView !== "insights") {
      handleViewChange("insights");
    }
  };

  // Get intelligence signals from OS store
  const messages = useOSStore((state) => state.messages || []);
  
  // Extract last message with emotion
  const lastMessageWithEmotion = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .find((msg) => msg.emotion) || null;
  }, [messages]);

  // Extract last face emotion
  const lastFaceEmotion = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .find((msg) => msg.emotion?.source?.includes("face"))?.emotion || null;
  }, [messages]);

  // Extract last risk
  const lastRisk = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .find((msg) => msg.risk)?.risk || null;
  }, [messages]);

  // Extract last humanMode
  const lastHumanMode = useMemo(() => {
    return messages
      .slice()
      .reverse()
      .find((msg) => msg.humanMode)?.humanMode || null;
  }, [messages]);

  const momentsView = (
    <div className="space-y-6">
      {/* Guest Mode Notice in Moments */}
      {identity.mode === "guest" && (
        <div className="rounded-xl border border-wcGold/30 bg-wcGold/5 p-4">
          <p className="text-xs text-white/70">
            <span className="font-medium text-wcGold">Guest mode:</span> Your moments are saved locally in this session.{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="underline hover:text-wcGold"
            >
              Create an account
            </button>
            {" "}to save them permanently.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Moments Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalMoments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Every check-in builds your story
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {streakDays > 0 ? `${streakDays} day${streakDays > 1 ? "s" : ""}` : "Start today"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Stay close with one gentle moment a day
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{weeklyMoments}</div>
            <p className="text-xs text-muted-foreground mt-1">Moments in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today’s Moments</CardTitle>
              <CardDescription>
                Emotional check-ins, reflections, and practices
              </CardDescription>
            </div>
            <span className="text-[11px] text-muted-foreground">Last entry: {lastMomentLabel}</span>
          </div>
        </CardHeader>
        <CardContent>
          {hasMoments ? (
            <div className="space-y-2">
              {moments.slice(0, 6).map((moment) => (
                <button
                  key={moment.id}
                  type="button"
                  onClick={() => handleRevisitMoment(moment.id)}
                  className="w-full text-left p-3 rounded-lg border border-border/50 hover:border-foreground/40 hover:bg-foreground/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {moment.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {moment.preview}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {moment.timeLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Sparkles className="h-6 w-6 text-amber-400 mx-auto" />
              <p className="text-sm font-medium text-foreground">No moments yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                When you log a breathing practice, journal entry, or grounding exercise, it will appear here so you can see your progress.
              </p>
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-full border border-foreground px-4 py-2 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                Open Wellness Tools
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Take a calming pause</CardTitle>
            <CardDescription>Use breathing, grounding, or visualization tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/tools"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-foreground px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              <Leaf className="h-4 w-4" />
              Browse Tools
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Journal a quick reflection</CardTitle>
            <CardDescription>Write or speak to your guide and capture the moment.</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={handleGuidedReflection}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-background hover:text-foreground border border-foreground transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Start Guided Reflection
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const supportCopy = getSupportCopy(insightsData?.riskLevel);
  const supportBadgeClass = getRiskLevelColor(insightsData?.riskLevel || "insufficient_data");
  const positiveHighlights = insightsData?.weeklySummary?.keyHighlights || [];
  const focusAreas = insightsData?.weeklySummary?.suggestedFocusAreas || [];
  const positiveSignals = (insightsData?.positiveSignals || []).slice(0, 3);
  const areasToWatch = (insightsData?.negativeSignals || []).slice(0, 3).map(softenSignal);

  const insightsView = (
    <div className="space-y-6">
      {/* Guest Mode Notice for Insights */}
      {identity.mode === "guest" && (
        <Card className="border-wcGold/30 bg-wcGold/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-wcGold flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Weekly insights require an account
                </h3>
                <p className="text-xs text-white/70 mb-4">
                  To see personalized weekly reflections and patterns, create a free account to save your journey.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="rounded-full bg-wcGold px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-amber-400"
                >
                  Create account to unlock insights
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 bg-card/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Weekly Reflection</CardTitle>
              <CardDescription>This week in your journey</CardDescription>
            </div>
            {identity.mode === "account" && insightsData && (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${supportBadgeClass}`}>
                {supportCopy.label}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {identity.mode === "guest" && (
            <div className="py-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-wcGold mx-auto opacity-50" />
              <p className="text-sm font-medium text-white">Create an account to see weekly insights</p>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Weekly reflections analyze your patterns and suggest gentle focus areas based on your check-ins.
              </p>
            </div>
          )}
          {identity.mode === "account" && insightsLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Gathering this week’s insights…</p>
            </div>
          )}

          {!insightsLoading && insightsError && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {insightsError}
              </p>
              <button
                type="button"
                onClick={handleRefreshInsights}
                className="inline-flex items-center justify-center rounded-full border border-foreground px-4 py-2 text-xs font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {!insightsLoading && !insightsError && (!insightsData || insightsData.riskLevel === "insufficient_data") && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We’re still gathering enough check-ins to reflect on your week. Keep logging your breathing, grounding, and journaling moments and we’ll summarize what we notice.
              </p>
              <button
                type="button"
                onClick={handleRefreshInsights}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-foreground transition-colors"
              >
                Refresh insights
              </button>
            </div>
          )}

          {!insightsLoading && !insightsError && insightsData && insightsData.riskLevel !== "insufficient_data" && (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {supportCopy.description}
              </p>
              {insightsData.weeklySummary?.summaryText && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    {insightsData.weeklySummary.summaryText}
                  </p>
                </div>
              )}
              {(positiveHighlights.length > 0 || focusAreas.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {positiveHighlights.length > 0 && (
                    <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Key Highlights
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {positiveHighlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Feather className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {focusAreas.length > 0 && (
                    <div className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Gentle Focus
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {focusAreas.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {(positiveSignals.length > 0 || areasToWatch.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {positiveSignals.length > 0 && (
                    <div className="rounded-lg border border-border/60 p-4 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
                        What supported you
                      </p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {positiveSignals.map((signal, idx) => (
                          <li key={idx}>• {signal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {areasToWatch.length > 0 && (
                    <div className="rounded-lg border border-border/60 p-4 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-400">
                        Where to bring kindness
                      </p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {areasToWatch.map((signal, idx) => (
                          <li key={idx}>• {signal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleRefreshInsights}
                  className="inline-flex items-center justify-center rounded-full border border-border px-3 py-1.5 text-[11px] font-medium hover:border-foreground transition-colors"
                >
                  Refresh insights
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="lux-shell space-y-8 py-6 md:py-8 lg:py-10">
      <PageHeader 
        title="Dashboard" 
        subtitle="Moments & Insights"
      />
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Moments & Insights
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {greeting}, stay close to how you feel today
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
          Browse your emotional timeline or reflect on the patterns we noticed this week. Everything here is private to you.
        </p>
      </div>

      <div className="inline-flex rounded-full border border-border/60 bg-muted/20 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => handleViewChange("moments")}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            activeView === "moments"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Moments
        </button>
        <button
          type="button"
          onClick={() => handleViewChange("insights")}
          className={`px-4 py-1.5 rounded-full transition-colors ${
            activeView === "insights"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Insights
        </button>
      </div>

      {/* Intelligence Signals Dashboard - New luxury layout */}
      {activeView === "moments" && (
        <div className="space-y-4">
          <SignalHeader />
          
          <div className="grid gap-4 md:grid-cols-2">
            <EmotionStrip lastEmotion={lastMessageWithEmotion?.emotion} />
            <RiskStrip risk={lastRisk} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TriggerStrip messages={messages} />
            <HumanModeStrip humanMode={lastHumanMode} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FaceSignalStrip faceEmotion={lastFaceEmotion} />
            <TrajectoryGraph messages={messages} />
          </div>

          <QuickActions />
        </div>
      )}

      {/* Personalization Widgets - Only show on moments view */}
      {activeView === "moments" && (
        <div className="space-y-4">
          <NudgeStrip />
          <div className="grid gap-4 md:grid-cols-2">
            <MilestonesWidget />
            <FavoritesWidget />
          </div>
          <ProviderRecommendationsWidget />
          <WellnessSettings />
        </div>
      )}

      {activeView === "moments" ? momentsView : insightsView}

      {/* Supporters Strip - Show at bottom */}
      <SupportersStrip />
      <FooterMinimal />
    </div>
  );
}

