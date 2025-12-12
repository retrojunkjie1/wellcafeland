// src/components/explore/ToolCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DailyPracticeTool } from '../../tools/toolsTypes';
import { luxuryRadii, luxuryShadows, luxuryGradients } from '../../theme/luxuryTheme';

interface ToolCardProps {
  tool: DailyPracticeTool;
  variant?: 'grid' | 'list';
}

const categoryLabel = (cat: string) => cat || 'Practice';

export const ToolCard: React.FC<ToolCardProps> = ({ tool, variant = 'grid' }) => {
  const firstStep = tool.steps[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <Link
        to={`/tools/${tool.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80 rounded-[1.75rem]"
      >
        <motion.div
          whileHover={{ y: -4, boxShadow: luxuryShadows.card }}
          transition={{ type: 'spring', stiffness: 210, damping: 22 }}
          className="relative h-full w-full overflow-hidden border border-white/12"
          style={{
            borderRadius: luxuryRadii.card,
            backgroundImage: luxuryGradients.card,
          }}
        >
          {/* Accent dot */}
          <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-emerald-300/80 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col gap-3 px-4 pb-4 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                  {categoryLabel(tool.category)}
                </p>
                <h3 className="text-sm md:text-base font-semibold text-white">
                  {tool.title}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {/* Intensity badge placeholder: assume all healer tools are LOW for now */}
                <span className="rounded-full border border-emerald-300/60 bg-emerald-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                  Low
                </span>
              </div>
            </div>

            {tool.summary && (
              <p className="text-xs md:text-sm leading-relaxed text-white/70 line-clamp-3">
                {tool.summary}
              </p>
            )}

            {firstStep && (
              <div className="mt-1 rounded-2xl bg-black/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                  First step
                </p>
                <p className="mt-1 text-xs text-white/80">
                  {firstStep.label}: {firstStep.description}
                </p>
              </div>
            )}

            <div className="mt-auto flex items-center justify-between pt-1 text-[11px] text-white/55">
              <span>{tool.tags?.[0] ?? 'support'}</span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300/80" />
                <span>Open</span>
              </span>
            </div>
          </div>

          {/* Soft bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
