// src/apps/dashboard/DashboardPage.jsx

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, HeartPulse, TrendingUp, Calendar, Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAIStore } from "../ai/useAIStore";

export default function DashboardPage() {
  const { sessions } = useAIStore();
  const [currentTime, setCurrentTime] = useState(() => {
    // Use a function to initialize - this is allowed
    return typeof window !== 'undefined' ? Date.now() : 0;
  });

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

  // Calculate greeting based on current time (stable calculation)
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const recentSessions = sessions.slice(0, 3);
  const totalSessions = sessions.length;
  
  // Calculate weekly sessions
  const weeklySessions = React.useMemo(() => {
    const weekAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
    return sessions.filter(s => s.updatedAt > weekAgo).length;
  }, [sessions, currentTime]);

  return (
    <div className="lux-shell space-y-8 wc-fade-slide py-6 md:py-8 lg:py-10">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {greeting}, welcome back
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Here's what's happening with your wellness journey today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Conversations
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalSessions > 0 ? "Keep the momentum going" : "Start your first conversation"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Streak
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Coming soon: track your consistency
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
              <Calendar className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {weeklySessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conversations this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      {recentSessions.length > 0 && (
        <Card className="border-border/50 bg-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </div>
              <Link
                to="/sessions/templates"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const date = new Date(session.updatedAt);
                const timeAgo = Math.floor((currentTime - session.updatedAt) / 60000);
                let timeLabel = "Just now";
                if (timeAgo > 0 && timeAgo < 60) timeLabel = `${timeAgo}m ago`;
                else if (timeAgo < 1440) timeLabel = `${Math.floor(timeAgo / 60)}h ago`;
                else timeLabel = date.toLocaleDateString();

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-foreground/5 transition-colors cursor-pointer"
                    onClick={() => {
                      useAIStore.getState().loadSession(session.id);
                      useAIStore.getState().openConsole();
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{timeLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 bg-card/60 hover:border-amber-400/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-base">Start New Conversation</CardTitle>
            <CardDescription>
              Begin a fresh wellness session with your guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => {
                useAIStore.getState().newSession();
                useAIStore.getState().openConsole();
              }}
              className="w-full px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 transition-colors"
            >
              Open Wellness Guide
            </button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 hover:border-amber-400/30 transition-colors">
          <CardHeader>
            <CardTitle className="text-base">Browse Sessions</CardTitle>
            <CardDescription>
              Explore AI-guided wellness practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/sessions/templates"
              className="block w-full px-4 py-2 rounded-lg border border-foreground text-center font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              View Sessions
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

