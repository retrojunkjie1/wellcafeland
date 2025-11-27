// src/apps/tools/modules/AffirmationsTool.jsx

import React, { useState } from "react";
import { callAgent } from "../../../agents/aiAgents";
import { logToolUsage } from "../../../services/toolTelemetry";
import { trackAction } from "../../../services/telemetry";

const CONCERN_TYPES = [
  { id: "anxiety", label: "Anxiety" },
  { id: "cravings", label: "Cravings" },
  { id: "shame", label: "Shame" },
  { id: "sleep", label: "Sleep" },
  { id: "grief", label: "Grief" },
  { id: "self-worth", label: "Self-Worth" },
];

const AffirmationsTool = ({ tool }) => {
  const [selectedConcern, setSelectedConcern] = useState("anxiety");
  const [affirmations, setAffirmations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    trackAction("tool_affirmations_generate", {
      toolId: tool.id,
      concernType: selectedConcern,
    });

    try {
      const response = await callAgent("healer_spiritual", {
        mode: "affirmations",
        concernType: selectedConcern,
      });

      if (response && response.reply) {
        // Parse response - could be a list or text
        const text = response.reply;
        // Try to extract list items (numbered, bulleted, or line-separated)
        const lines = text
          .split(/\n+/)
          .map((line) => line.replace(/^[\d\-\u2022*]\s*/, "").trim())
          .filter((line) => line.length > 10); // Filter out very short lines

        if (lines.length > 0) {
          setAffirmations(lines.slice(0, 10)); // Max 10 affirmations
        } else {
          // Fallback: split by sentences
          const sentences = text
            .split(/[.!?]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 10);
          setAffirmations(sentences.slice(0, 10));
        }

        // Log usage
        const now = new Date().getTime();
        await logToolUsage(tool.id, {
          startedAt: now,
          completedAt: now,
          durationMs: 0,
          concernType: selectedConcern,
          context: {
            count: affirmations.length,
          },
        });
      } else {
        setError("Could not generate affirmations. Please try again.");
      }
    } catch (err) {
      console.error("Failed to generate affirmations:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Concern Selection */}
      <div className="lux-card p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          What do you need support with?
        </h3>
        <div className="flex flex-wrap gap-2">
          {CONCERN_TYPES.map((concern) => (
            <button
              key={concern.id}
              type="button"
              onClick={() => setSelectedConcern(concern.id)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedConcern === concern.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {concern.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground disabled:opacity-60 transition-colors"
        >
          {isGenerating ? "Generating..." : "Generate Affirmations"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Affirmations List */}
      {affirmations.length > 0 && (
        <div className="lux-card p-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Affirmations
          </h3>
          <ul className="space-y-3">
            {affirmations.map((affirmation, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                <span className="text-amber-400 font-semibold text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-foreground flex-1">{affirmation}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AffirmationsTool;

