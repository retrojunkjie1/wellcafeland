// src/components/explore/ToolCard.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { DailyPracticeTool } from '../../tools/toolsTypes';
import { luxuryRadii, luxuryShadows, luxuryGradients } from '../../theme/luxuryTheme';
import { withFrom } from '../../navigation/linkState';
import { Clock3 } from 'lucide-react';

interface ToolCardProps {
  tool: DailyPracticeTool;
  variant?: 'grid' | 'list';
}

const categoryLabel = (cat: string) => cat || 'Practice';

const getDurationLabel = (tool: DailyPracticeTool) => {
  if (typeof tool.durationSec === 'number' && tool.durationSec > 0) {
    return `${Math.max(1, Math.round(tool.durationSec / 60))} min`;
  }
  return tool.duration || 'Self-paced';
};

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
          className="glass-panel group flex w-full items-start gap-3 px-3 py-3 transition hover:border-white/20 hover:bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/80 sm:items-center"
        >
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="min-w-0 max-w-full text-sm font-medium leading-snug text-white [overflow-wrap:anywhere]">
                {tool.title}
              </h3>
              {tool.intensity && <span className="rounded-full border border-emerald-300/35 bg-emerald-300/[0.07] px-1.5 py-0.5 text-[9px] font-medium capitalize tracking-wide text-emerald-100/75 flex-shrink-0">{tool.intensity} effort</span>}
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-white/55">
              {tool.summary}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] text-white/50"><Clock3 className="h-3 w-3" />{getDurationLabel(tool)}</span>
            <span className="hidden max-w-24 truncate text-[10px] text-white/40 md:inline">{categoryLabel(tool.category)}</span>
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
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h3 className="text-sm font-medium text-white truncate">
                    {tool.title}
                  </h3>
                  {tool.intensity && <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-1.5 py-0.5 text-[9px] font-medium capitalize tracking-wider text-emerald-100/85 flex-shrink-0">{tool.intensity} effort</span>}
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
              <span className="truncate">{getDurationLabel(tool)} · {tool.tags?.[0] ?? 'support'}</span>
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
