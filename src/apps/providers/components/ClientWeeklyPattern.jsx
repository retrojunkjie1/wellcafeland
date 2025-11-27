// src/apps/providers/components/ClientWeeklyPattern.jsx

import React, { useState, useEffect } from "react";
import { runPredictiveRecoveryEngineForClient } from "../../../ai/predictive/predictiveRecoveryEngine";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * Client Weekly Pattern Component
 * Shows a gentle, supportive summary for client-facing views
 */
const ClientWeeklyPattern = ({ clientId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const result = await runPredictiveRecoveryEngineForClient(clientId, { days: 7 });
        if (mounted && result.weeklySummary) {
          setSummary(result.weeklySummary);
        }
      } catch (err) {
        console.warn("Failed to load weekly pattern (non-critical):", err.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (clientId) {
      loadSummary();
    }

    return () => {
      mounted = false;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="lux-card p-4 text-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Loading pattern insights...</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Generate client-safe summary text (no risk language)
  const clientSafeText = generateClientSafeText(summary);

  return (
    <div className="lux-card p-4 space-y-2 border-l-2 border-amber-400/30">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <h3 className="text-xs font-semibold text-foreground">
          This Week's Emotional Pattern
        </h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {clientSafeText}
      </p>
      {summary.keyHighlights.length > 0 && (
        <div className="pt-2 border-t border-border/30">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Strengths This Week
          </p>
          <ul className="space-y-0.5">
            {summary.keyHighlights.slice(0, 2).map((highlight, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                • {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Generate client-safe summary text (no risk/clinical language)
 */
function generateClientSafeText(summary) {
  let text = summary.summaryText;

  // Replace clinical/risk language with supportive language
  text = text
    .replace(/risk/gi, "pattern")
    .replace(/crisis/gi, "increased intensity")
    .replace(/high-urge/gi, "strong urges")
    .replace(/distress/gi, "challenging moments")
    .replace(/critical/gi, "significant")
    .replace(/warning/gi, "notable")
    .replace(/moderate risk/gi, "mixed patterns")
    .replace(/high risk/gi, "increased intensity")
    .replace(/low risk/gi, "stable patterns");

  // Ensure supportive tone
  if (!text.includes("strength") && !text.includes("consistent") && !text.includes("engaged")) {
    // Add a supportive note if missing
    text += " Your engagement with wellness tools is valuable for your recovery journey.";
  }

  return text;
}

export default ClientWeeklyPattern;

