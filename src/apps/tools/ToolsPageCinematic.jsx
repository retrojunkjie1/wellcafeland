// src/apps/tools/ToolsPageCinematic.jsx
// Cinematic Wellness Tools Page - Phase 36B
// Phase 59: Tools Bridge Integration
// Phase 60 Ultra: Luxury Interface System V2
// Hybrid luxury aesthetic with glassmorphism and ambient animations

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { withFrom } from "@/navigation/linkState";
import { trackPageView } from "@/services/telemetry";
import { ToolsRegistry, getAllCategories, getToolsByCategory } from "@/engines/tools/ToolsRegistry";
import { dailyPracticeTools, getDailyPracticeToolsByCategory, getDailyPracticeCategories, getCategoryCount } from "@/tools/toolsBridge";
import CinematicContainer from "@/components/tools/CinematicContainer";
import { listContentSummaries } from "@/services/contentService";
import { CONTENT_SECTIONS } from "@/content/contentRegistry";
import { motion } from "framer-motion";
import { AmbientOrbs } from "@/components/layout/AmbientOrbs";
import { CategoryChips } from "@/components/explore/CategoryChips";
import { ToolCard } from "@/components/explore/ToolCard";
import { allTools } from "@/tools/toolResolver";
import { featureFlags } from "@/config/featureFlags";

const ToolsPageCinematic = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Tools");
  
  // Phase 59: Get categories from both ToolsRegistry and DailyPracticeTools
  const registryCategories = useMemo(() => getAllCategories(), []);
  const practiceCategories = useMemo(() => getDailyPracticeCategories(), []);
  
  // Merge categories, but only include categories that have tools
  const categories = useMemo(() => {
    // Get all tools to check which categories have content
    const allPracticeTools = dailyPracticeTools;
    const practiceCategorySet = new Set(allPracticeTools.map(t => t.category));
    
    // Filter registry categories to only include those with tools
    const registryWithTools = registryCategories.filter(cat => {
      const registryTools = getToolsByCategory(cat.id);
      // Check if this category has tools in registry OR in practice tools
      const hasRegistryTools = registryTools.length > 0;
      const hasPracticeTools = practiceCategorySet.has(cat.label);
      return hasRegistryTools || hasPracticeTools;
    });
    
    // Add practice categories that aren't already in registry and have tools
    const additionalCategories = practiceCategories
      .filter(cat => cat !== 'All Tools')
      .filter(cat => {
        // Only include if it has tools
        return practiceCategorySet.has(cat);
      })
      .map(cat => ({
        id: cat.toLowerCase().replace(/\s+/g, '-'),
        label: cat
      }))
      .filter(cat => !registryWithTools.some(rc => rc.id === cat.id));
    
    return [...registryWithTools, ...additionalCategories];
  }, [registryCategories, practiceCategories]);
  
  // Load content summaries once on mount
  const toolContent = useMemo(() => {
    return listContentSummaries(CONTENT_SECTIONS.TOOLS);
  }, []);

  useEffect(() => {
    document.title = "Wellness Tools - WellnessCafe";
    trackPageView("tools-cinematic");
  }, []);

  // Phase 59: Combine ToolsRegistry tools with DailyPracticeTools
  const filteredTools = useMemo(() => {
    const registryTools = getToolsByCategory(selectedCategory);
    
    // Map daily practice tools to registry format for display
    const formatPracticeTool = (tool) => ({
      id: tool.id,
      name: tool.title,
      description: tool.summary,
      category: tool.category,
      duration: `${Math.round(tool.steps.reduce((sum, s) => sum + (s.suggestedDurationSeconds || 30), 0) / 60)} min`,
      intensity: "low", // Default for healer tools
      icon: () => null, // No icon for now
    });
    
    // If "all", include all daily practice tools
    if (selectedCategory === "all") {
      const practiceToolsFormatted = dailyPracticeTools.map(formatPracticeTool);
      return [...registryTools, ...practiceToolsFormatted];
    }
    
    // For specific categories, match by mapped category name
    // Find the category label from registry categories
    const selectedCategoryLabel = categories.find(c => c.id === selectedCategory)?.label;
    
    // Get daily practice tools by mapped category name
    const practiceTools = selectedCategoryLabel 
      ? getDailyPracticeToolsByCategory(selectedCategoryLabel)
      : [];
    
    const practiceToolsFormatted = practiceTools.map(formatPracticeTool);
    
    return [...registryTools, ...practiceToolsFormatted];
  }, [selectedCategory, categories]);


  // Get available categories - valid CategoryKey values
  const validCategories = ['All Tools', 'Breathing', 'Grounding', 'Reflection', 'Urge Management', 'Somatic', 'Emergency', 'Emotional', 'Sleep'];
  
  const availableCategories = useMemo(() => {
    const categorySet = new Set(['All Tools']);
    allTools.forEach(tool => {
      if (tool.category && tool.category !== 'All Tools') {
        // Only add if it's a valid CategoryKey
        if (validCategories.includes(tool.category)) {
          categorySet.add(tool.category);
        }
      }
    });
    return Array.from(categorySet);
  }, []);

  // Filter tools by selected category
  const toolsForCategory = useMemo(() => {
    if (selectedCategory === 'All Tools') return allTools;
    return allTools.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <CinematicContainer theme="calm">
      {/* Phase 60 Ultra: Ambient Orbs Background */}
      <AmbientOrbs density="low" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-4 space-y-5">
        {/* Header */}
        <header className="text-center space-y-2 pt-2">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">
            Luxury Wellness Tools
          </p>
          <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white">
            Daily Practice
          </h1>
          <p className="text-xs text-white/60 max-w-2xl mx-auto leading-relaxed">
            Breathwork, grounding, journaling, micro-rituals, and nervous-system
            resets designed for recovery in motion.
          </p>
          {/* Phase 70: Link to classic ToolsPage */}
          <Link
            to="/tools/classic"
            className="text-xs uppercase tracking-[0.22em] text-white/60 hover:text-amber-200 transition"
          >
            Classic Tools View
          </Link>
        </header>

        {/* Phase 60 Ultra: Luxury Category Chips */}
        <CategoryChips
          categories={availableCategories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Phase 60 Ultra: Luxury Tool List */}
        {toolsForCategory && toolsForCategory.length > 0 ? (
          <div className="space-y-1.5">
            {toolsForCategory.map((tool) => (
              <ToolCard key={tool.id} tool={tool} variant="list" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-xs text-white/60 backdrop-blur-md"
          >
            No tools in this category yet. Select another category or check back later as we add more tools.
          </motion.div>
        )}

        {/* Guided Practices Section */}
        {toolContent.length > 0 && (
          <section className="
            bg-white/[0.05] backdrop-blur-xl
            border border-white/10
            rounded-xl p-4 sm:p-5
          ">
            <div className="mb-3">
              <h2 className="text-lg font-light text-white mb-1">
                Guided Practices
              </h2>
              <p className="text-white/60 text-xs">
                Step-by-step content for deeper exploration
              </p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {toolContent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/tools/${encodeURIComponent(item.id)}`, withFrom(location))}
                  className="
                    text-left rounded-xl
                    bg-white/[0.05] border border-white/10
                    p-3
                    hover:bg-white/[0.08] hover:border-amber-400/20
                    transition-all duration-300
                  "
                >
                  <div className="text-xs font-medium text-white mb-1">
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

