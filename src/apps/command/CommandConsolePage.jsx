// src/apps/command/CommandConsolePage.jsx
// Command Console - All available WellnessCafe OS commands

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminGate } from "@/hooks/useAdminGate";
import {
  MessageCircle,
  Search,
  LayoutDashboard,
  Heart,
  Wrench,
  Users,
  BookOpen,
  Settings,
  HelpCircle,
  Sparkles,
  Eye,
} from "lucide-react";

const CommandConsolePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { loading: adminLoading, isAdmin } = useAdminGate();

  // Handle admin commands
  useEffect(() => {
    const command = searchQuery.toLowerCase().trim();
    if (command === "godseye" || command === "overseer") {
      if (isAdmin) {
        navigate("/admin/overseer");
      }
    }
  }, [searchQuery, isAdmin, navigate]);

  // Build commands list (add admin commands if user is admin)
  const baseCommands = [
    {
      category: "Communication",
      commands: [
        {
          id: "chat",
          label: "Start Chat",
          description: "Talk to your Wellness Guide",
          icon: MessageCircle,
          action: () => navigate("/chat"),
        },
        {
          id: "guide",
          label: "Wellness Guide",
          description: "Get personalized support and guidance",
          icon: Heart,
          action: () => navigate("/guide"),
        },
      ],
    },
    {
      category: "Intelligence",
      commands: [
        {
          id: "signals",
          label: "View Signals",
          description: "See your emotional intelligence dashboard",
          icon: LayoutDashboard,
          action: () => navigate("/dashboard?view=signals"),
        },
        {
          id: "moments",
          label: "Check Moments",
          description: "Review your check-ins and reflections",
          icon: Sparkles,
          action: () => navigate("/dashboard?view=moments"),
        },
      ],
    },
    {
      category: "Tools & Resources",
      commands: [
        {
          id: "tools",
          label: "Wellness Tools",
          description: "Breathing, grounding, journaling, and more",
          icon: Wrench,
          action: () => navigate("/tools"),
        },
        {
          id: "explore",
          label: "Explore Directory",
          description: "Browse tools, guides, and resources",
          icon: Search,
          action: () => navigate("/explore"),
        },
        {
          id: "assistance",
          label: "Assistance Directory",
          description: "Find food, housing, grants, and emergency support",
          icon: HelpCircle,
          action: () => navigate("/assistance"),
        },
      ],
    },
    {
      category: "Community",
      commands: [
        {
          id: "providers",
          label: "Find Providers",
          description: "Connect with therapists, coaches, and support",
          icon: Users,
          action: () => navigate("/resources?type=providers"),
        },
        {
          id: "circles",
          label: "Recovery Circles",
          description: "Join reflection circles and community",
          icon: BookOpen,
          action: () => navigate("/circles"),
        },
      ],
    },
    {
      category: "Settings",
      commands: [
        {
          id: "profile",
          label: "Profile & Settings",
          description: "Manage your account and preferences",
          icon: Settings,
          action: () => navigate("/profile"),
        },
      ],
    },
  ];

  // Add admin commands if user is admin
  const OS_COMMANDS = !adminLoading && isAdmin
    ? [
        ...baseCommands,
        {
          category: "Admin",
          commands: [
            {
              id: "godseye",
              label: "God's Eye — Overseer",
              description: "Access the Overseer Console (Admin only)",
              icon: Eye,
              action: () => navigate("/admin/overseer"),
            },
          ],
        },
      ]
    : baseCommands;

  const filteredCommands = OS_COMMANDS.map((category) => ({
    ...category,
    commands: category.commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.commands.length > 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Command Console
        </h1>
        <p className="text-sm text-white/60">
          All available WellnessCafe OS commands and actions
        </p>
      </header>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
        </div>
      </div>

      {/* Commands by Category */}
      <div className="space-y-6">
        {filteredCommands.map((category) => (
          <section key={category.category} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
              {category.category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {category.commands.map((command) => {
                const Icon = command.icon;
                return (
                  <button
                    key={command.id}
                    type="button"
                    onClick={command.action}
                    className="group rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:bg-white/10 hover:border-white/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-white/10 p-2 group-hover:bg-white/20 transition">
                        <Icon className="h-5 w-5 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {command.label}
                        </h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {command.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* What the OS Can Do */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-base font-semibold text-white mb-4">What WellnessCafe OS Can Do</h3>
        <div className="space-y-3 text-sm text-white/70">
          <p>
            • <strong className="text-white">Emotional Intelligence:</strong> Track your emotional patterns, triggers, and trajectory
          </p>
          <p>
            • <strong className="text-white">Personalized Guidance:</strong> Get support tailored to your current state and needs
          </p>
          <p>
            • <strong className="text-white">Wellness Tools:</strong> Access breathing exercises, grounding practices, and journaling
          </p>
          <p>
            • <strong className="text-white">Resource Discovery:</strong> Find food assistance, housing, grants, and local support
          </p>
          <p>
            • <strong className="text-white">Community Connection:</strong> Join circles, connect with providers, and build your support network
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommandConsolePage;
