// src/apps/tools/ToolsPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { trackPageView } from "../../services/telemetry";
import { CATEGORIES, getToolsByCategory } from "./toolsRegistry";
import ToolCard from "./components/ToolCard";
import PageHeader from "@/components/navigation/PageHeader";
import { listContentSummaries } from "@/services/contentService";
import { CONTENT_SECTIONS } from "@/content/contentRegistry";

const ToolsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Load content summaries once on mount
  const toolContent = useMemo(() => {
    return listContentSummaries(CONTENT_SECTIONS.TOOLS);
  }, []);

  useEffect(() => {
    document.title = "Wellness Tools - WellnessCafe";
    trackPageView("tools");
  }, []);

  const filteredTools = useMemo(
    () => getToolsByCategory(selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="space-y-4">
      <PageHeader 
        title="Wellness Tools" 
        subtitle="Breathwork, grounding, journaling, micro-rituals, and nervous-system resets"
      />
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Daily practice
        </p>
        <h1 className="text-2xl font-light tracking-wide text-white">
          Wellness Tools
        </h1>
        <p className="text-xs text-white/70">
          Breathwork, grounding, journaling, micro-rituals, and nervous-system
          resets designed for recovery in motion.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedCategory(category.id)}
            className={`menu-chip ${
              selectedCategory === category.id
                ? "border-white/40 text-white"
                : ""
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} variant="list" />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="glass-panel p-4 text-center text-xs text-white/60">
          No tools in this category. Select a different category above or return later as we add more tools.
        </div>
      )}

      {/* Guided Practices Section */}
      {toolContent.length > 0 && (
        <section className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-medium text-white">
              Guided Practices
            </h2>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {toolContent.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/tools/${encodeURIComponent(item.id)}`)}
                className="text-left rounded-xl bg-white/5 border border-white/10 p-2.5 hover:bg-white/10 transition"
              >
                <div className="text-xs font-medium text-white">
                  {item.title}
                </div>
                {item.tags?.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/60"
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
  );
};

export default ToolsPage;
