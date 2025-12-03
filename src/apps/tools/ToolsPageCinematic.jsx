// src/apps/tools/ToolsPageCinematic.jsx
// Cinematic Wellness Tools Page - Phase 36B
// Hybrid luxury aesthetic with glassmorphism and ambient animations

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { trackPageView } from "@/services/telemetry";
import { ToolsRegistry, getAllCategories, getToolsByCategory } from "@/engines/tools/ToolsRegistry";
import CinematicContainer from "@/components/tools/CinematicContainer";
import { listContentSummaries } from "@/services/contentService";
import { CONTENT_SECTIONS } from "@/content/contentRegistry";

const ToolsPageCinematic = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const categories = useMemo(() => getAllCategories(), []);
  
  // Load content summaries once on mount
  const toolContent = useMemo(() => {
    return listContentSummaries(CONTENT_SECTIONS.TOOLS);
  }, []);

  useEffect(() => {
    document.title = "Wellness Tools - WellnessCafe";
    trackPageView("tools-cinematic");
  }, []);

  const filteredTools = useMemo(
    () => getToolsByCategory(selectedCategory),
    [selectedCategory]
  );

  const intensityColors = {
    low: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    high: "text-red-400 border-red-400/30 bg-red-400/10",
  };

  return (
    <CinematicContainer theme="calm">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">
            Luxury Wellness Tools
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-wide text-white">
            Daily Practice
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Breathwork, grounding, journaling, micro-rituals, and nervous-system
            resets designed for recovery in motion.
          </p>
        </header>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300
                ${
                  selectedCategory === category.id
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30"
                    : "bg-white/[0.08] text-white/70 hover:bg-white/[0.12] border border-white/10"
                }
              `}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => navigate(`/tools/${tool.id}`)}
                className="
                  group relative
                  bg-white/[0.08] backdrop-blur-xl
                  border border-white/[0.12]
                  rounded-2xl p-6
                  hover:bg-white/[0.12] hover:border-amber-400/30
                  transition-all duration-300
                  text-left
                  shadow-lg shadow-black/20
                  hover:shadow-amber-500/20
                "
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400/20 to-teal-400/20 border border-amber-400/20">
                    <Icon className="h-6 w-6 text-amber-400" />
                  </div>
                  {/* Intensity badge */}
                  <span className={`
                    px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium
                    border ${intensityColors[tool.intensity]}
                  `}>
                    {tool.intensity}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-white font-light text-lg mb-2 group-hover:text-amber-200 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-white/60 text-sm mb-4 leading-relaxed">
                  {tool.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>{tool.category}</span>
                  <span>•</span>
                  <span>{tool.duration}</span>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/0 via-transparent to-teal-400/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredTools.length === 0 && (
          <div className="
            bg-white/[0.05] backdrop-blur-sm
            border border-white/10
            rounded-2xl p-12 text-center
          ">
            <p className="text-white/60">
              No tools found in this category.
            </p>
          </div>
        )}

        {/* Guided Practices Section */}
        {toolContent.length > 0 && (
          <section className="
            bg-white/[0.05] backdrop-blur-xl
            border border-white/10
            rounded-2xl p-6 sm:p-8
          ">
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white mb-2">
                Guided Practices
              </h2>
              <p className="text-white/60 text-sm">
                Step-by-step content for deeper exploration
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {toolContent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/tools/${encodeURIComponent(item.id)}`)}
                  className="
                    text-left rounded-xl
                    bg-white/[0.05] border border-white/10
                    p-4
                    hover:bg-white/[0.08] hover:border-amber-400/20
                    transition-all duration-300
                  "
                >
                  <div className="text-sm font-medium text-white mb-2">
                    {item.title}
                  </div>
                  {item.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </CinematicContainer>
  );
};

export default ToolsPageCinematic;

