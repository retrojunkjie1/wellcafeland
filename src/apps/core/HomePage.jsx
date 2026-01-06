// src/apps/core/HomePage.jsx
// Minimal, ChatGPT-style landing page

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Wrench, Clock, Sparkles } from "lucide-react";
import { trackPageView } from "../../services/telemetry";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import Logo from "@/components/Logo";

const HomePage = () => {
  const navigate = useNavigate();
  const identity = useSessionIdentity();

  useEffect(() => {
    document.title = "WellnessCafe - Home";
    trackPageView("home");
  }, []);

  return (
    <div className="space-y-8 py-6">
      {/* Welcome Section */}
      <section className="space-y-4 text-center">
        <div className="flex justify-center mb-3">
          <Logo size="lg" showText={true} />
        </div>
        <h1 className="text-3xl font-light tracking-wide text-white">
          Welcome to WellnessCafe
        </h1>
        <p className="text-sm text-white/70">
          How can we support you today?
        </p>
      </section>

      {/* Primary Actions */}
      <section className="space-y-2.5">
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className="glass-panel w-full p-3 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-wcGold/20 p-2 flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-wcGold" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-white">Talk to your Wellness Guide</h2>
              <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                Get personalized support, grounding practices, and compassionate guidance
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="glass-panel w-full p-3 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2 flex-shrink-0">
              <Wrench className="h-5 w-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-white">Use grounding & breathing tools</h2>
              <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                Breathing exercises, 5-4-3-2-1 grounding, journaling, and more
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard?view=moments")}
          className="glass-panel w-full p-3 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2 flex-shrink-0">
              <Clock className="h-5 w-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-medium text-white">Check in with yourself</h2>
              <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                Track your moments, reflections, and progress
              </p>
            </div>
          </div>
        </button>
      </section>

      {/* Quick Links */}
      <section className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => navigate("/dashboard?view=insights")}
          className="menu-chip"
        >
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          Weekly Insights
        </button>
        <button
          type="button"
          onClick={() => navigate("/support")}
          className="menu-chip"
        >
          Support Resources
        </button>
      </section>
    </div>
  );
};

export default HomePage;
