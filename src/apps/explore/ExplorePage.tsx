// src/apps/explore/ExplorePage.tsx

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AmbientOrbs } from '../../components/layout/AmbientOrbs';
import { CategoryChips, CategoryKey } from '../../components/explore/CategoryChips';
import { ToolCard } from '../../components/explore/ToolCard';
import { allTools } from '../../tools/toolResolver';

const CATEGORIES: CategoryKey[] = [
  'All Tools',
  'Breathing',
  'Grounding',
  'Reflection',
  'Urge Management',
  'Somatic',
  'Emergency',
  'Emotional',
  'Sleep',
];

export const ExplorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All Tools');

  // Safety check for allTools
  const allToolsSafe = useMemo(() => {
    try {
      if (!allTools || !Array.isArray(allTools)) {
        console.warn('allTools is not an array, using empty array');
        return [];
      }
      return allTools;
    } catch (error) {
      console.error('Error accessing allTools:', error);
      return [];
    }
  }, []);

  const toolsForCategory = useMemo(() => {
    if (!allToolsSafe || allToolsSafe.length === 0) return [];
    if (selectedCategory === 'All Tools') return allToolsSafe;
    return allToolsSafe.filter((t) => t && t.category === selectedCategory);
  }, [selectedCategory, allToolsSafe]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#05070D] to-black text-white">
      <AmbientOrbs density="low" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-8">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80">
            Luxury Wellness Tools
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Daily Practice
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-white/70">
            Breathwork, grounding, micro-rituals, and nervous-system resets
            designed for recovery in motion. Take what you need, leave what you don&apos;t.
          </p>
        </header>

        <section className="space-y-3">
          <CategoryChips
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        <section aria-label="Daily practice tools" className="space-y-3">
          {toolsForCategory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60 backdrop-blur-md"
            >
              No tools are registered in this category yet. This simply means
              this area of the OS is still being stocked, not that anything is
              wrong with you.
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid gap-4 md:grid-cols-2">
                {toolsForCategory.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </section>
      </div>
    </div>
  );
};

