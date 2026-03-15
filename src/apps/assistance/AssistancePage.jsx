// src/apps/assistance/AssistancePage.jsx
// Assistance Directory - Food, Grants, Housing, Emergency Support, Local Resources

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  DollarSign,
  Home,
  Phone,
  MapPin,
  Search,
  Heart,
  Shield,
  FileText,
  Users,
} from "lucide-react";

const ASSISTANCE_CATEGORIES = [
  {
    id: "food",
    label: "Food Assistance",
    icon: UtensilsCrossed,
    description: "Food banks, meal programs, SNAP benefits, and nutrition support",
    path: "/resources?type=assistance",
    domain: "assistance",
    category: "food",
  },
  {
    id: "grants",
    label: "Grants & Funding",
    icon: DollarSign,
    description: "Financial assistance, grants, and funding for recovery and wellness",
    path: "/resources?type=grants",
    domain: "grants",
  },
  {
    id: "housing",
    label: "Housing Help",
    icon: Home,
    description: "Sober living, transitional housing, emergency shelter, and housing assistance",
    path: "/resources?type=housing",
    domain: "housing",
  },
  {
    id: "emergency",
    label: "Emergency Support",
    icon: Phone,
    description: "24/7 crisis hotlines, emergency services, and immediate support",
    path: "/resources?type=hotlines",
    domain: "hotlines",
  },
  {
    id: "local",
    label: "Local Resources",
    icon: MapPin,
    description: "Find resources near you - support groups, clinics, community centers",
    path: "/resources?type=programs",
    domain: "programs",
  },
];

const AssistancePage = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    if (category.path) {
      navigate(category.path);
    } else {
      navigate(`/resources?type=${category.domain}`);
    }
  };

  const handleHelpMeFind = () => {
    // Navigate to chat with a pre-filled prompt
    navigate("/chat", { state: { initialPrompt: "Help me find resources for..." } });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
          Assistance Directory
        </h1>
        <p className="text-sm text-white/60">
          Find food, housing, grants, emergency support, and local resources
        </p>
      </header>

      {/* Help Me Find Command Interface */}
      <div className="mb-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-amber-500/10 p-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-400/20 p-3">
            <Search className="h-6 w-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">Help Me Find…</h2>
            <p className="text-sm text-white/70 mb-4">
              Tell me what you need and I'll help you find the right resources
            </p>
            <button
              type="button"
              onClick={handleHelpMeFind}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400/20 border border-amber-400/40 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/30 transition-all"
            >
              <Search className="h-4 w-4" />
              Start Finding Resources
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ASSISTANCE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:bg-white/10 hover:border-white/20"
            >
              <div className="mb-4 rounded-full bg-white/10 p-3 w-fit group-hover:bg-white/20 transition">
                <Icon className="h-6 w-6 text-white/80" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {category.label}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/resources?type=providers")}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition"
          >
            <Users className="h-5 w-5 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">Find Providers</p>
              <p className="text-xs text-white/50">Therapists, coaches, and support</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate("/support")}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition"
          >
            <Heart className="h-5 w-5 text-white/60" />
            <div>
              <p className="text-sm font-medium text-white">Support Hub</p>
              <p className="text-xs text-white/50">Crisis support and resources</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistancePage;

