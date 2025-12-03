// src/apps/providers/ProvidersPage.jsx
// Provider Directory - Categories and provider listings

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Heart,
  Brain,
  Sparkles,
  BookOpen,
  Search,
} from "lucide-react";

const PROVIDER_CATEGORIES = [
  {
    id: "therapist",
    label: "Therapists",
    icon: Brain,
    description: "Licensed therapists and counselors",
    path: "/directory/providers",
    type: "therapist",
  },
  {
    id: "coach",
    label: "Recovery Coaches",
    icon: Heart,
    description: "Certified recovery coaches and peer support",
    path: "/directory/providers",
    type: "coach",
  },
  {
    id: "somatic",
    label: "Somatic Practitioners",
    icon: Sparkles,
    description: "Body-based healing and trauma-informed care",
    path: "/directory/providers",
    type: "somatic",
  },
  {
    id: "spiritual",
    label: "Spiritual Guides",
    icon: BookOpen,
    description: "Spiritual counselors and guides",
    path: "/directory/providers",
    type: "spiritual",
  },
];

export default function ProvidersPage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/directory/providers?type=${category.type}`);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-amber-400" />
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Provider Directory
          </h1>
        </div>
        <p className="text-sm text-white/60">
          Connect with wellness providers and professionals
        </p>
      </header>

      {/* Search */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/directory/providers")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/60 hover:bg-white/10 transition flex items-center gap-3"
        >
          <Search className="h-5 w-5 text-white/40" />
          <span>Search providers by name, specialty, or location...</span>
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">
          Browse by Category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:bg-white/10 hover:border-white/20"
              >
                <div className="mb-4 rounded-full bg-white/10 p-3 w-fit mx-auto group-hover:bg-white/20 transition">
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
      </div>

      {/* Browse All */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-base font-semibold text-white mb-2">
          Browse All Providers
        </h3>
        <p className="text-sm text-white/60 mb-4">
          View the complete directory of wellness providers
        </p>
        <button
          type="button"
          onClick={() => navigate("/directory/providers")}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
        >
          <Users className="h-4 w-4" />
          View All Providers
        </button>
      </div>
    </div>
  );
}

