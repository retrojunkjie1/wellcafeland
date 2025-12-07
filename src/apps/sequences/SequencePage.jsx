// src/apps/sequences/SequencePage.jsx
// ===========================================================
// Phase 48 — Multi-Path Ritual Sequence Page
// One-step-at-a-time cinematic ritual with adaptive branches
// ===========================================================

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getSequence, executeStep } from "@/engines/sequences/sequenceEngine";
import { useSequenceRunner } from "@/hooks/useSequenceRunner";
import { useOSStore } from "@/stores/useOSStore";
import {
  buildSequenceContext,
  chooseBranchOption,
} from "@/engines/sequences/sequenceAdaptiveEngine";

const SequencePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sequence = getSequence(id);

  const messages = useOSStore((s) => s.messages || []);
  const context = buildSequenceContext(messages);

  const {
    currentStep,
    index,
    atFirst,
    atLast,
    goNext,
    goBack,
    chooseBranch,
  } = useSequenceRunner(sequence || { steps: [] });

  if (!sequence) {
    return (
      <div className="p-6">
        <p className="text-amber-300">Sequence not found.</p>
      </div>
    );
  }

  const totalSteps = sequence.steps?.length || 0;

  let recommendedIndex = null;
  if (currentStep && currentStep.type === "branch") {
    recommendedIndex = chooseBranchOption(currentStep, context);
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-amber-400/80">
            Ritual Sequence
          </span>
          <span className="text-sm font-medium text-white/90">
            {sequence.title}
          </span>
        </div>
        <div className="ml-auto text-xs text-white/50">
          Step {Math.min(index + 1, totalSteps)} / {totalSteps}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-6 space-y-4">
        {/* Subheader */}
        <p className="text-xs text-white/55 max-w-xl">
          {sequence.description}
        </p>

        {/* Step card */}
        {currentStep ? (
          <div className="mt-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              {currentStep.type === "branch" && (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 text-[11px]">
                  ?
                </span>
              )}
              {currentStep.type === "completion" && (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-[11px]">
                  ✓
                </span>
              )}
              <h2 className="text-base font-semibold text-white">
                {currentStep.title}
              </h2>
            </div>

            {/* TEXT STEP */}
            {currentStep.type === "text" && (
              <p className="text-sm text-white/80 leading-relaxed">
                {currentStep.body}
              </p>
            )}

            {/* TOOL STEP */}
            {currentStep.type === "tool" && (
              <>
                {currentStep.body && (
                  <p className="text-sm text-white/80 leading-relaxed">
                    {currentStep.body}
                  </p>
                )}
                <button
                  onClick={() => executeStep(currentStep, navigate)}
                  className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-400 text-black text-sm font-medium hover:bg-amber-300 transition shadow-lg shadow-amber-500/25"
                >
                  Open Tool
                </button>
              </>
            )}

            {/* BRANCH STEP */}
            {currentStep.type === "branch" && (
              <div className="space-y-4">
                <p className="text-sm text-white/75 leading-relaxed">
                  {currentStep.question}
                </p>
                <div className="space-y-3">
                  {currentStep.options?.map((opt, optIndex) => {
                    const isRecommended =
                      recommendedIndex !== null &&
                      recommendedIndex === optIndex;

                    return (
                      <button
                        key={opt.key || optIndex}
                        onClick={() => chooseBranch(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border backdrop-blur-sm transition flex flex-col gap-1 ${
                          isRecommended
                            ? "border-amber-400/80 bg-amber-500/10 shadow-lg shadow-amber-500/25"
                            : "border-white/10 bg-white/5 hover:border-amber-300/40 hover:bg-amber-500/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {opt.label}
                          </span>
                          {isRecommended && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] bg-amber-400 text-black text-[10px] font-semibold uppercase tracking-wide">
                              <AlertTriangle className="h-3 w-3" />
                              Recommended
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-xs text-white/65">
                            {opt.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPLETION STEP */}
            {currentStep.type === "completion" && (
              <p className="text-sm text-emerald-200/90 leading-relaxed">
                {currentStep.body}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-amber-300">No steps in this ritual yet.</p>
        )}
      </div>

      {/* Footer controls */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <button
          onClick={goBack}
          disabled={atFirst}
          className={`px-3 py-2 rounded-xl text-xs font-medium ${
            atFirst
              ? "text-white/30 border border-white/5"
              : "text-white/80 border border-white/15 hover:border-amber-300/40 hover:bg-amber-500/5"
          }`}
        >
          Back
        </button>
        <div className="text-[11px] text-white/40">
          This ritual does not judge you. It walks with you.
        </div>
        <button
          onClick={goNext}
          disabled={atLast || (currentStep && currentStep.type === "branch")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold ${
            atLast
              ? "bg-emerald-500/10 text-emerald-200 border border-emerald-400/30"
              : currentStep && currentStep.type === "branch"
              ? "bg-white/5 text-white/40 border border-white/10 cursor-not-allowed"
              : "bg-amber-400 text-black hover:bg-amber-300"
          }`}
        >
          {atLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default SequencePage;
