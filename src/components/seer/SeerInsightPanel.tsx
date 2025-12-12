/**
 * WellnessCafe OS - Phase 58 Ultra
 * Seer Insight Engine - Insight Panel Component
 * 
 * Luxury panel displaying analytical and narrative insights.
 * Trauma-informed, non-blaming, shame-safe design.
 */

import React from 'react';
import { Eye, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import type { SeerHybridInsight } from '../../seer/seerTypes';

export interface SeerInsightPanelProps {
  insight: SeerHybridInsight | null;
  /**
   * Whether to show analytical details.
   * Default: true
   */
  showAnalytics?: boolean;
  /**
   * Whether to show narrative insight.
   * Default: true
   */
  showNarrative?: boolean;
  /**
   * Callback when refresh is requested.
   */
  onRefresh?: () => void;
}

/**
 * Seer Insight Panel Component
 * 
 * Displays both analytical (clinical) and narrative (oracle) insights
 * in a luxury, trauma-informed design.
 */
export const SeerInsightPanel: React.FC<SeerInsightPanelProps> = ({
  insight,
  showAnalytics = true,
  showNarrative = true,
  onRefresh,
}) => {
  if (!insight || (!insight.analytics && !insight.narrative)) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <p className="text-sm text-white/60">
          Insights will appear here as patterns emerge from your emotional check-ins.
        </p>
      </div>
    );
  }

  const { analytics, narrative } = insight;

  return (
    <div className="space-y-6">
      {/* Narrative Insight (Oracle Layer) */}
      {showNarrative && narrative && (
        <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-black/60 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-400/20 border border-amber-400/30">
                <Eye className="h-5 w-5 text-amber-300" />
              </div>
              <h2 className="text-lg font-semibold text-white">Insight Reflection</h2>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors"
                aria-label="Refresh insights"
              >
                <RefreshCw className="h-4 w-4 text-white/70" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-medium text-white/90">{narrative.title}</h3>
            <p className="text-sm text-white/75 leading-relaxed">{narrative.body}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50 italic">
              Patterns are information, not verdicts. You are doing your best.
            </p>
          </div>
        </section>
      )}

      {/* Analytical Summary (Clinical Layer) */}
      {showAnalytics && analytics && (
        <section className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/10 border border-white/20">
              <TrendingUp className="h-5 w-5 text-white/80" />
            </div>
            <h2 className="text-lg font-semibold text-white">Pattern Summary</h2>
          </div>

          <div className="space-y-4">
            {/* Timeframe */}
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Clock className="h-4 w-4" />
              <span>{analytics.timeframeLabel}</span>
              <span className="text-white/40">·</span>
              <span>{analytics.totalSamples} check-ins</span>
            </div>

            {/* Dominant Signal */}
            {analytics.dominantSignal && (
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                  Most Common State
                </p>
                <p className="text-sm font-medium text-white capitalize">
                  {analytics.dominantSignal.replace('_', ' ')}
                </p>
              </div>
            )}

            {/* Stress Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-xs text-white/50 mb-1">Avg Stress</p>
                <p className="text-sm font-semibold text-white">
                  {analytics.averageStress.toFixed(1)}/10
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-xs text-white/50 mb-1">Max Stress</p>
                <p className="text-sm font-semibold text-white">
                  {analytics.maxStress}/10
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-xs text-white/50 mb-1">Avg Trigger</p>
                <p className="text-sm font-semibold text-white">
                  {analytics.averageTrigger.toFixed(1)}/10
                </p>
              </div>
            </div>

            {/* Distribution */}
            {analytics.distribution.length > 0 && (
              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                  Signal Distribution
                </p>
                <div className="space-y-2">
                  {analytics.distribution.slice(0, 3).map((dist) => (
                    <div key={dist.tag} className="flex items-center justify-between">
                      <span className="text-sm text-white/80 capitalize">
                        {dist.tag.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-amber-400/60 rounded-full transition-all"
                            style={{ width: `${dist.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60 w-8 text-right">
                          {dist.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pattern Indicators */}
            <div className="flex flex-wrap gap-2">
              {analytics.risingStressTrend && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Rising Stress Trend
                </span>
              )}
              {analytics.eveningBias && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/20">
                  Evening Pattern
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

