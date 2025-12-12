/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Weekly Card Component
 * 
 * Simple card component for weekly insights (future use).
 * Trauma-informed, non-blaming design.
 */

import React from 'react';
import { Calendar } from 'lucide-react';
import type { SeerHybridInsight } from '../../seer/seerTypes';

export interface SeerWeeklyCardProps {
  insight: SeerHybridInsight | null;
  /**
   * Week label (e.g., "This Week", "Last Week").
   */
  weekLabel?: string;
  /**
   * Callback when card is clicked.
   */
  onClick?: () => void;
}

/**
 * Seer Weekly Card Component
 * 
 * Simple card for displaying weekly insights.
 * Designed for future expansion with weekly aggregation.
 */
export const SeerWeeklyCard: React.FC<SeerWeeklyCardProps> = ({
  insight,
  weekLabel = 'This Week',
  onClick,
}) => {
  const hasInsight = insight && (insight.analytics || insight.narrative);

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-white/[0.08] hover:border-white/20' : ''}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/30">
          <Calendar className="h-4 w-4 text-amber-300" />
        </div>
        <h3 className="text-sm font-semibold text-white">{weekLabel}</h3>
      </div>

      {hasInsight && insight.narrative ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/90 line-clamp-1">
            {insight.narrative.title}
          </p>
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
            {insight.narrative.body}
          </p>
        </div>
      ) : (
        <p className="text-xs text-white/50">
          Weekly insights will appear here as patterns emerge.
        </p>
      )}

      {hasInsight && insight.analytics && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>{insight.analytics.totalSamples} check-ins</span>
            {insight.analytics.dominantSignal && (
              <>
                <span className="text-white/30">·</span>
                <span className="capitalize">
                  {insight.analytics.dominantSignal.replace('_', ' ')}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

