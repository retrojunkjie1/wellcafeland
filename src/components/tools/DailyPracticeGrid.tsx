/**
 * WellnessCafe OS - Phase 59
 * Daily Practice Grid Component
 * 
 * Displays Daily Practice Tools in a grid with category filtering.
 * Uses the Tools Bridge to show Healer Toolkit interventions.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { allTools } from '@/tools/toolResolver';
import { getDailyPracticeToolsByCategory, getDailyPracticeCategories } from '@/tools/toolsBridge';

export interface DailyPracticeGridProps {
  /**
   * Initial selected category.
   * Default: 'All Tools'
   */
  initialCategory?: string;
  /**
   * Callback when a tool is selected.
   */
  onSelectTool?: (toolId: string) => void;
  /**
   * Whether to show category filters.
   * Default: true
   */
  showFilters?: boolean;
}

/**
 * Daily Practice Grid Component
 * 
 * Displays healer interventions and ritual sequences as daily practice tools.
 */
export const DailyPracticeGrid: React.FC<DailyPracticeGridProps> = ({
  initialCategory = 'All Tools',
  onSelectTool,
  showFilters = true,
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Get categories
  const categories = useMemo(() => getDailyPracticeCategories(), []);

  // Filter tools by category
  const filteredTools = useMemo(() => {
    return getDailyPracticeToolsByCategory(selectedCategory);
  }, [selectedCategory]);

  const handleToolClick = (toolId: string) => {
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      // Default: navigate to tool detail page
      navigate(`/tools/${toolId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category filters */}
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300
                ${
                  selectedCategory === category
                    ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30"
                    : "bg-white/[0.08] text-white/70 hover:bg-white/[0.12] border border-white/10"
                }
              `}
            >
              {category.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Tools grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
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
            <h3 className="text-white font-light text-lg mb-2 group-hover:text-amber-200 transition-colors">
              {tool.title}
            </h3>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              {tool.summary}
            </p>

            {/* Tags */}
            {tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50"
                  >
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}

            {/* Steps preview */}
            {tool.steps.length > 0 && (
              <div className="text-xs text-white/40">
                {tool.steps.length} step{tool.steps.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Hover glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/0 via-transparent to-teal-400/0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
          </button>
        ))}
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
    </div>
  );
};

