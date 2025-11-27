// src/apps/explore/ExplorePage.jsx
// Explore panel with folder structure

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOSStore, MODES } from "@/stores/useOSStore";
import {
  Wind,
  Mountain,
  PenTool,
  Waves,
  Activity,
  Users,
  LifeBuoy,
  Phone,
  DollarSign,
  BookOpen,
  GraduationCap,
} from "lucide-react";

const EXPLORE_ITEMS = {
  tools: [
    {
      id: "breathing-478",
      label: "4-7-8 Breathing",
      icon: Wind,
      type: "tool",
      toolType: "breathing",
      config: { pattern: "4-7-8" },
    },
    {
      id: "breathing-box",
      label: "Box Breathing",
      icon: Wind,
      type: "tool",
      toolType: "breathing",
      config: { pattern: "box" },
    },
    {
      id: "grounding-54321",
      label: "5-4-3-2-1 Grounding",
      icon: Mountain,
      type: "tool",
      toolType: "grounding",
    },
    {
      id: "journaling",
      label: "Journaling",
      icon: PenTool,
      type: "tool",
      toolType: "journaling",
    },
    {
      id: "urge-surfing",
      label: "Urge Surfing",
      icon: Waves,
      type: "tool",
      toolType: "urge-surfing",
    },
    {
      id: "body-scan",
      label: "Body Scan",
      icon: Activity,
      type: "tool",
      toolType: "body-scan",
    },
  ],
  providers: [
    {
      id: "find-therapist",
      label: "Find a Therapist",
      icon: Users,
      type: "provider",
      providerType: "therapist",
    },
    {
      id: "find-coach",
      label: "Find a Coach",
      icon: Users,
      type: "provider",
      providerType: "coach",
    },
    {
      id: "spiritual-support",
      label: "Spiritual Support",
      icon: Users,
      type: "provider",
      providerType: "spiritual",
    },
  ],
  support: [
    {
      id: "crisis-hotlines",
      label: "Crisis Hotlines",
      icon: Phone,
      type: "support",
      category: "crisis",
    },
    {
      id: "samhsa",
      label: "SAMHSA Assistance",
      icon: LifeBuoy,
      type: "support",
      category: "samhsa",
    },
    {
      id: "rehab-programs",
      label: "Rehab Programs",
      icon: LifeBuoy,
      type: "support",
      category: "rehab",
    },
    {
      id: "financial-assistance",
      label: "Financial Assistance",
      icon: DollarSign,
      type: "support",
      category: "financial",
    },
  ],
  education: [
    {
      id: "recovery-basics",
      label: "Recovery Basics",
      icon: GraduationCap,
      type: "education",
      topic: "basics",
    },
    {
      id: "relapse-prevention",
      label: "Relapse Prevention",
      icon: BookOpen,
      type: "education",
      topic: "relapse",
    },
  ],
};

const ExplorePage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const { openWorkspace, setMode } = useOSStore();

  React.useEffect(() => {
    setMode(MODES.EXPLORE);
  }, [setMode]);

  const handleItemClick = (item) => {
    if (item.type === "tool") {
      const workspace = openWorkspace(
        "tool",
        item.label,
        { toolType: item.toolType, config: item.config }
      );
      navigate(`/workspace/${workspace.id}`);
    } else if (item.type === "provider") {
      const workspace = openWorkspace(
        "provider",
        item.label,
        { providerType: item.providerType }
      );
      navigate(`/workspace/${workspace.id}`);
    } else if (item.type === "support") {
      const workspace = openWorkspace(
        "support",
        item.label,
        { category: item.category }
      );
      navigate(`/workspace/${workspace.id}`);
    } else if (item.type === "education") {
      const workspace = openWorkspace(
        "education",
        item.label,
        { topic: item.topic }
      );
      navigate(`/workspace/${workspace.id}`);
    }
  };

  const items = section ? EXPLORE_ITEMS[section] : [];
  const sectionTitle = section
    ? section.charAt(0).toUpperCase() + section.slice(1)
    : "Explore";

  return (
    <div className="flex h-screen flex-col bg-slate-950 animate-fade-in">
      {/* Header - Simple ChatGPT style */}
      <div className="border-b border-white/10 bg-slate-950 px-6 py-4">
        <h1 className="text-xl font-medium text-white">
          {section ? sectionTitle : "Explore"}
        </h1>
        <p className="text-xs text-white/50 mt-1">
          {section
            ? "Select an item to open in workspace"
            : "Browse tools, providers, support, and education"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-12">
        {!section ? (
          <div className="space-y-5 max-w-4xl mx-auto">
            {Object.entries(EXPLORE_ITEMS).map(([key, items]) => {
              const sectionIcons = {
                tools: "🔧",
                providers: "👥",
                support: "🆘",
                education: "📚",
              };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/explore/${key}`)}
                  className="w-full flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 group"
                >
                  <div className="text-3xl">{sectionIcons[key] || "📁"}</div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-white capitalize mb-1">
                      {key}
                    </h3>
                    <p className="text-sm text-white/50 font-light">
                      {items.length} {items.length === 1 ? "item" : "items"} available
                    </p>
                  </div>
                  <div className="text-white/30 text-lg">
                    →
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className="flex flex-col items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 group"
                  style={{ animationDelay: `${items.indexOf(item) * 50}ms` }}
                >
                  <Icon className="h-5 w-5 text-white/60 flex-shrink-0" />
                  <span className="text-sm text-white/90">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;

