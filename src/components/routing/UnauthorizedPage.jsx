// src/components/routing/UnauthorizedPage.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, MessageSquare, Wrench, Trophy, Home, ArrowRight } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      title: "Chat with your guide",
      description: "Get personalized support and guidance",
      icon: MessageSquare,
      path: "/chat",
      color: "text-wcGold",
      bgColor: "bg-wcGold/10",
    },
    {
      title: "Explore tools",
      description: "Breathing, grounding, and wellness practices",
      icon: Wrench,
      path: "/tools",
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
    },
    {
      title: "Track recovery",
      description: "Monitor your progress and milestones",
      icon: Trophy,
      path: "/recovery",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Browse directory",
      description: "Find resources, housing, and support",
      icon: Compass,
      path: "/resources",
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-wcGold/10 flex items-center justify-center">
              <Compass className="h-10 w-10 text-wcGold" />
            </div>
          </div>
          <h1 className="text-3xl font-light tracking-wide mb-4">
            Let's find the right path
          </h1>
          <p className="text-sm text-white/60 max-w-xl mx-auto">
            This area isn't available right now, but there are many ways we can support you today.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={`group text-left rounded-lg border border-white/10 ${link.bgColor} p-6 transition-all hover:border-white/20 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className={`rounded-lg ${link.bgColor} p-3`}>
                    <Icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-medium text-white mb-1">
                  {link.title}
                </h3>
                <p className="text-xs text-white/60">
                  {link.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Return Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </div>

        {/* Helpful Message */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/40 max-w-md mx-auto">
            If you believe you should have access to this area, please contact support or sign in with the appropriate account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

