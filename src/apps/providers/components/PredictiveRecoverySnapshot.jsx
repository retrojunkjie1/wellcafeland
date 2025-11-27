// src/apps/providers/components/PredictiveRecoverySnapshot.jsx

import React, { useState, useEffect } from "react";
import { runPredictiveRecoveryEngineForClient } from "../../../ai/predictive/predictiveRecoveryEngine";
import { getRiskLevelColor } from "../../../ai/predictive/predictiveConfig";
import { Activity, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react";

/**
 * Predictive Recovery Snapshot Component
 * Shows risk score, summary, and suggested focus areas for a client
 */
const PredictiveRecoverySnapshot = ({ clientId, onDemand = false }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(!onDemand);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (onDemand && !expanded) {
      return; // Don't load until expanded
    }

    let mounted = true;

    async function loadAnalysis() {
      try {
        setLoading(true);
        setError(null);
        const result = await runPredictiveRecoveryEngineForClient(clientId, { days: 7 });
        if (mounted) {
          setAnalysis(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      mounted = false;
    };
  }, [clientId, onDemand, expanded]);

  if (onDemand && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="lux-card p-3 text-left w-full hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            Predictive Recovery Snapshot
          </span>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Click to load this week's analysis
        </p>
      </button>
    );
  }

  if (loading) {
    return (
      <div className="lux-card p-4 text-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Analyzing recovery patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lux-card p-3 border-amber-400/30 bg-amber-400/5">
        <p className="text-xs text-muted-foreground">
          Unable to load analysis. Please try again later.
        </p>
      </div>
    );
  }

  if (!analysis || analysis.riskLevel === "insufficient_data") {
    return (
      <div className="lux-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground">
            Predictive Recovery Snapshot
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Not enough data to analyze this week yet. The system is building a recovery profile as more activity is recorded.
        </p>
      </div>
    );
  }

  const { riskScore, riskLevel, weeklySummary, positiveSignals, negativeSignals } = analysis;
  const colorClasses = getRiskLevelColor(riskLevel);

  return (
    <div className={`lux-card p-4 space-y-3 border-l-2 ${colorClasses.split(" ")[2]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground">
          Predictive Recovery Snapshot
        </h3>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Risk Badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${colorClasses}`}>
          {riskLevel === "low" ? "Stable" : riskLevel === "moderate" ? "Moderate" : "Increased Support"}
        </span>
        {riskScore !== null && (
          <span className="text-xs text-muted-foreground">
            Score: {Math.round(riskScore)}/100
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">
          {weeklySummary.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {weeklySummary.summaryText}
        </p>
      </div>

      {expanded && (
        <>
          {/* Key Highlights */}
          {weeklySummary.keyHighlights.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Key Highlights
              </p>
              <ul className="space-y-1">
                {weeklySummary.keyHighlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Focus Areas */}
          {weeklySummary.suggestedFocusAreas.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested Focus Areas
              </p>
              <ul className="space-y-1">
                {weeklySummary.suggestedFocusAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Signals */}
          {(positiveSignals.length > 0 || negativeSignals.length > 0) && (
            <div className="grid gap-2 text-xs">
              {positiveSignals.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400 mb-1">
                    Strengths
                  </p>
                  <ul className="space-y-0.5">
                    {positiveSignals.slice(0, 3).map((signal, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        • {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {negativeSignals.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400 mb-1">
                    Areas to Monitor
                  </p>
                  <ul className="space-y-0.5">
                    {negativeSignals.slice(0, 3).map((signal, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        • {signal.replace("crisis", "increased intensity").replace("high-urge", "strong urges")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PredictiveRecoverySnapshot;

