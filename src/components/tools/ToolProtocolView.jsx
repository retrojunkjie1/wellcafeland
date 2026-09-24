/**
 * ToolProtocolView - Step-by-step protocol runner for Daily Practice tools
 * Renders clinical intent, indications, contraindications, steps, aftercare, escalation.
 * Trauma-informed, safety-gated.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logToolSessionBegin, logToolSessionComplete } from "@/services/toolSessionLogger";

const CRISIS_MESSAGE = "This is a self-guided practice, not emergency care. If you are in immediate danger, contact local emergency services.";

export function ToolProtocolView({ tool, onClose }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [distressBefore, setDistressBefore] = useState(null);
  const [distressAfter, setDistressAfter] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [crisisExpanded, setCrisisExpanded] = useState(false);

  const steps = tool?.steps || [];
  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const handleBegin = async () => {
    setSessionStarted(true);
    try {
      await logToolSessionBegin(tool.slug || tool.id);
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[ToolProtocolView] log begin", e?.message);
    }
  };

  const handleComplete = async () => {
    void logToolSessionComplete({
      slug: tool.slug || tool.id,
      distressBefore: distressBefore ?? undefined,
      distressAfter: distressAfter ?? undefined,
      completed: true,
    }).catch(() => {});
    onClose?.();
    navigate("/tools");
  };

  const handleStop = () => {
    logToolSessionComplete({
      slug: tool.slug || tool.id,
      distressBefore: distressBefore ?? undefined,
      distressAfter: distressAfter ?? undefined,
      completed: false,
    }).catch(() => {});
    onClose?.();
    navigate("/tools");
  };

  const handleSkipStep = () => {
    if (isLastStep) {
      setShowCompleteForm(true);
      return;
    }
    setStepIndex((index) => Math.min(steps.length - 1, index + 1));
  };

  if (!tool) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Clinical safety banner */}
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3">
          <p className="text-xs text-amber-200/90 leading-relaxed">{CRISIS_MESSAGE}</p>
          <button
            type="button"
            aria-expanded={crisisExpanded}
            aria-controls="tool-crisis-resources"
            onClick={() => setCrisisExpanded(!crisisExpanded)}
            className="mt-2 text-xs font-medium text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
          >
            {crisisExpanded ? "Hide" : "Need live support?"}
          </button>
          {crisisExpanded && (
          <div id="tool-crisis-resources" className="mt-2 space-y-1 text-xs text-white/80">
            <p>In the U.S. and its territories, call or text 988 for emotional crisis support.</p>
            <div className="flex flex-wrap gap-3">
              <a className="underline underline-offset-2" href="tel:988">Call 988</a>
              <a className="underline underline-offset-2" href="sms:988">Text 988</a>
              <a className="underline underline-offset-2" href="https://988lifeline.org/get-help/" target="_blank" rel="noreferrer">988 Lifeline website</a>
            </div>
            <p>For immediate danger, contact local emergency services.</p>
          </div>
          )}
      </div>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-light tracking-tight text-white">{tool.title}</h1>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(tool.category) ? tool.category : [tool.category]).map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70"
            >
              {cat}
            </span>
          ))}
          {tool.intensity && (
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
              {tool.intensity}
            </span>
          )}
          {tool.durationSec && (
            <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
              ~{Math.round(tool.durationSec / 60)} min
            </span>
          )}
        </div>
      </header>

      {/* Clinical intent */}
      {tool.clinicalIntent && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-xs uppercase tracking-wider text-white/50 mb-2">Intent</h2>
          <p className="text-sm text-white/85 leading-relaxed">{tool.clinicalIntent}</p>
        </div>
      )}

      {/* Indications / Contraindications */}
      <div className="grid gap-3 sm:grid-cols-2">
        {tool.indications?.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <h3 className="text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1.5">When helpful</h3>
            <p className="text-xs text-white/70">{tool.indications.join(", ")}</p>
          </div>
        )}
        {tool.contraindications?.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <h3 className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1.5">Use with care</h3>
            <p className="text-xs text-white/70">{tool.contraindications.join(" ")}</p>
          </div>
        )}
      </div>

      {/* Step runner */}
      {!sessionStarted ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-white/70 mb-4">
            This practice has {steps.length} optional steps. Take your time. You can skip a step or stop whenever you want.
          </p>
          <button
            type="button"
            onClick={handleBegin}
            className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-6 py-3 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition"
          >
            Begin practice
          </button>
        </div>
      ) : !showCompleteForm ? (
        <div className="space-y-4">
          <div role="status" aria-live="polite" aria-atomic="true" className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
            <p className="text-[10px] uppercase tracking-wider text-amber-400/70 mb-1">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="text-lg font-medium text-white mb-2">{currentStep?.label}</h3>
            <p className="text-sm text-white/80 leading-relaxed">{currentStep?.description}</p>
            {currentStep?.durationSec && (
              <p className="mt-2 text-xs text-white/50">~{currentStep.durationSec} seconds</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={isFirstStep}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            >
              Previous
            </button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSkipStep}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Skip this step
              </button>
              {isLastStep ? (
                <button
                  type="button"
                  onClick={() => setShowCompleteForm(true)}
                  className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30"
                >
                  Finish practice
                </button>
              ) : (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30"
              >
                Next
              </button>
              )}
            </div>
          </div>
          <button type="button" onClick={handleStop} className="text-xs text-white/50 underline underline-offset-2 hover:text-white/80">Stop practice and leave</button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">Would you like to check in?</h3>
          <p className="text-xs leading-relaxed text-white/55">These ratings are optional. If you enter them, they are saved with this practice record. You can finish without sharing a rating.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="distress-before" className="block text-xs text-white/60 mb-1">Before this practice (0–10)</label>
              <input
                id="distress-before"
                type="number"
                min={0}
                max={10}
                inputMode="numeric"
                aria-describedby="distress-rating-help"
                value={distressBefore ?? ""}
                onChange={(e) => setDistressBefore(e.target.value === "" ? null : Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label htmlFor="distress-after" className="block text-xs text-white/60 mb-1">Now (0–10)</label>
              <input
                id="distress-after"
                type="number"
                min={0}
                max={10}
                inputMode="numeric"
                aria-describedby="distress-rating-help"
                value={distressAfter ?? ""}
                onChange={(e) => setDistressAfter(e.target.value === "" ? null : Math.min(10, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
          <p id="distress-rating-help" className="text-xs text-white/45">0 means no distress; 10 means the most intense distress you can imagine.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30"
            >
              Save & finish
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Finish without ratings
            </button>
          </div>
        </div>
      )}

      {/* Aftercare */}
      {tool.aftercare?.length > 0 && sessionStarted && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <h3 className="text-[10px] uppercase tracking-wider text-white/50 mb-2">Aftercare</h3>
          <ul className="text-xs text-white/70 space-y-1">
            {tool.aftercare.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* When to escalate */}
      {tool.whenToEscalate && (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-3">
          <h3 className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-1">When to seek help</h3>
          <p className="text-xs text-amber-200/90 leading-relaxed">{tool.whenToEscalate}</p>
        </div>
      )}

      {/* Back */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="text-sm text-white/60 hover:text-white/90 underline-offset-2 hover:underline"
        >
          ← Back to Tools
        </button>
      </div>
    </div>
  );
}
