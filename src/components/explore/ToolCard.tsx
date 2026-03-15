// src/components/explore/ToolCard.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DailyPracticeTool } from '../../tools/toolsTypes';
import { luxuryRadii, luxuryShadows, luxuryGradients } from '../../theme/luxuryTheme';
import { withFrom } from '../../navigation/linkState';

interface ToolCardProps {
  tool: DailyPracticeTool;
  variant?: 'grid' | 'list';
}

const categoryLabel = (cat: string) => cat || 'Practice';

export const ToolCard: React.FC<ToolCardProps> = ({ tool, variant = 'list' }) => {
  const location = useLocation();

  // List variant: compact row (default)
  if (variant === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Link
          to={`/tools/${tool.id}`}
          {...withFrom(location)}
          className="block glass-panel w-full flex items-center gap-3 px-3 py-2.5 transition hover:border-white/20 hover:bg-white/8 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80"
        >
          <div className="text-base text-white/50 flex-shrink-0 group-hover:text-white/70 transition">
            {/* Icon placeholder - tools don't have icons yet */}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-0.5">
              <h3 className="text-sm font-medium text-white truncate">
                {tool.title}
              </h3>
              <span className="rounded-full border border-emerald-300/50 bg-emerald-300/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-100/80 flex-shrink-0">
                Low
              </span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed line-clamp-1">
              {tool.summary}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] text-white/40">{categoryLabel(tool.category)}</span>
            {tool.tags?.[0] && (
              <span className="text-[10px] text-white/35">• {tool.tags[0]}</span>
            )}
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid variant: for featured tools only
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
        {...withFrom(location)}
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
          <div className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />

          {/* Content */}
          <div className="relative z-10 flex h-full min-h-[88px] flex-col gap-2 px-3 pb-3 pt-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-medium text-white truncate">
                    {tool.title}
                  </h3>
                  <span className="rounded-full border border-emerald-300/60 bg-emerald-300/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-emerald-100 flex-shrink-0">
                    Low
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  {categoryLabel(tool.category)}
                </p>
              </div>
            </div>

            {tool.summary && (
              <p className="text-xs leading-relaxed text-white/60 line-clamp-2">
                {tool.summary}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between pt-1 text-[10px] text-white/45">
              <span className="truncate">{tool.tags?.[0] ?? 'support'}</span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <span className="inline-block h-1 w-1 rounded-full bg-amber-300/80" />
                <span>Open</span>
              </span>
            </div>
          </div>

          {/* Soft bottom gradient */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
