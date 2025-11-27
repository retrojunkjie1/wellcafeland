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
    <div className="space-y-12 py-12">
      {/* Welcome Section */}
      <section className="space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <Logo size="lg" showText={true} />
        </div>
        <h1 className="text-4xl font-light tracking-wide text-white">
          Welcome to WellnessCafe
        </h1>
        <p className="text-lg text-white/70">
          How can we support you today?
        </p>
      </section>

      {/* Primary Actions */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className="glass-panel w-full p-6 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-wcGold/20 p-3">
              <MessageCircle className="h-6 w-6 text-wcGold" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">Talk to your Wellness Guide</h2>
              <p className="text-sm text-white/60 mt-1">
                Get personalized support, grounding practices, and compassionate guidance
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="glass-panel w-full p-6 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/10 p-3">
              <Wrench className="h-6 w-6 text-white/80" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">Use grounding & breathing tools</h2>
              <p className="text-sm text-white/60 mt-1">
                Breathing exercises, 5-4-3-2-1 grounding, journaling, and more
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard?view=moments")}
          className="glass-panel w-full p-6 text-left transition hover:bg-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/10 p-3">
              <Clock className="h-6 w-6 text-white/80" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-white">Check in with yourself</h2>
              <p className="text-sm text-white/60 mt-1">
                Track your moments, reflections, and progress
              </p>
            </div>
          </div>
        </button>
      </section>

      {/* Guest Mode Notice */}
      {identity.mode === "guest" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-sm text-white/70 mb-3">
            You don't need an account to use WellnessCafe.
          </p>
          <p className="text-sm text-white/60 mb-4">
            To save your journey across devices, you can create one anytime.
          </p>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="rounded-full border border-wcGold/50 bg-wcGold/10 px-6 py-2 text-sm font-medium text-wcGold transition hover:bg-wcGold/20"
          >
            Create a free account
          </button>
        </div>
      )}

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
