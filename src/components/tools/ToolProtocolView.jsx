/**
 * ToolProtocolView - Step-by-step protocol runner for Daily Practice tools
 * Renders clinical intent, indications, contraindications, steps, aftercare, escalation.
 * Trauma-informed, safety-gated.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logToolSessionBegin, logToolSessionComplete } from "@/services/toolSessionLogger";

const CRISIS_MESSAGE = `Not medical advice. If you are in danger or considering self-harm, call local emergency services or 988 in the U.S.`;

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
    try {
      await logToolSessionComplete({
        slug: tool.slug || tool.id,
        distressBefore: distressBefore ?? undefined,
        distressAfter: distressAfter ?? undefined,
        completed: true,
      });
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[ToolProtocolView] log complete", e?.message);
    }
    onClose?.();
    navigate("/tools");
  };

  const handleSkipComplete = () => {
    logToolSessionComplete({
      slug: tool.slug || tool.id,
      distressBefore: distressBefore ?? undefined,
      distressAfter: distressAfter ?? undefined,
      completed: false,
    }).catch(() => {});
    onClose?.();
    navigate("/tools");
  };

  if (!tool) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Clinical safety banner */}
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3">
        <p className="text-xs text-amber-200/90 leading-relaxed">{CRISIS_MESSAGE}</p>
        <button
          type="button"
          onClick={() => setCrisisExpanded(!crisisExpanded)}
          className="mt-2 text-xs font-medium text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
        >
          {crisisExpanded ? "Hide" : "Crisis"} resources
        </button>
        {crisisExpanded && (
          <div className="mt-2 text-xs text-white/80 space-y-1">
            <p>988 Suicide & Crisis Lifeline (U.S.) — call or text</p>
            <p>Crisis Text Line — text HOME to 741741</p>
            <p>Local emergency services for immediate danger</p>
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
            This protocol has {steps.length} steps. Take your time. You can stop at any moment.
          </p>
          <button
            type="button"
            onClick={handleBegin}
            className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-6 py-3 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition"
          >
            Begin
          </button>
        </div>
      ) : !showCompleteForm ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
            <p className="text-[10px] uppercase tracking-wider text-amber-400/70 mb-1">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="text-lg font-medium text-white mb-2">{currentStep?.label}</h3>
            <p className="text-sm text-white/80 leading-relaxed">{currentStep?.description}</p>
            {currentStep?.durationSec && (
              <p className="mt-2 text-xs text-white/50">~{currentStep.durationSec} seconds</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              disabled={isFirstStep}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
            >
              Previous
            </button>
            {isLastStep ? (
              <button
                type="button"
                onClick={() => setShowCompleteForm(true)}
                className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30"
              >
                Complete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="rounded-lg bg-amber-500/20 border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h3 className="text-sm font-medium text-white">How are you now?</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-white/60 mb-1">Distress before (0–10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={distressBefore ?? ""}
                onChange={(e) => setDistressBefore(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Distress after (0–10)</label>
              <input
                type="number"
                min={0}
                max={10}
                value={distressAfter ?? ""}
                onChange={(e) => setDistressAfter(e.target.value === "" ? null : parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>
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
              onClick={handleSkipComplete}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Skip
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
