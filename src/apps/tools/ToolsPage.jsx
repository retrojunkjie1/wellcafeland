// src/apps/tools/ToolsPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import { trackPageView } from "../../services/telemetry";
import { CATEGORIES, getToolsByCategory } from "./toolsRegistry";
import ToolCard from "./components/ToolCard";
import PageHeader from "@/components/navigation/PageHeader";

const ToolsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    document.title = "Wellness Tools - WellnessCafe";
    trackPageView("tools");
  }, []);

  const filteredTools = useMemo(
    () => getToolsByCategory(selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Wellness Tools" 
        subtitle="Breathwork, grounding, journaling, micro-rituals, and nervous-system resets"
      />
      <header className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Daily practice
        </p>
        <h1 className="text-3xl font-light tracking-wide text-white">
          Wellness Tools
        </h1>
        <p className="text-sm text-white/70">
          Breathwork, grounding, journaling, micro-rituals, and nervous-system
          resets designed for recovery in motion.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
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

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="glass-panel p-10 text-center text-sm text-white/70">
          Nothing here yet. Check another category or come back tomorrow.
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
