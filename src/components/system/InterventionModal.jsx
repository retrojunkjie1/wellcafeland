// src/components/system/InterventionModal.jsx
// Renders live intervention payload: title, lines, instruction, choices, visual preset.
// Minimal and consistent; no free-chat loop.

import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import ReasoningDisclosure from "./ReasoningDisclosure";

const PRESETS = {
  orb: "rounded-full w-16 h-16 mx-auto mb-4 bg-wcGold/20 border border-wcGold/40 animate-pulse",
  wave: "h-2 w-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-transparent via-wcGold/50 to-transparent animate-[pulse_2s_ease-in-out_infinite]",
  stepper: "flex justify-center gap-1.5 mb-4",
};

export default function InterventionModal({ open, onClose, payload }) {
  const navigate = useNavigate();

  if (!open) return null;
  const p = payload || {};
  const title = p.title || "Pause";
  const lines = Array.isArray(p.lines) ? p.lines.slice(0, 3) : [];
  const instruction = p.instruction || "";
  const choices = Array.isArray(p.choices) ? p.choices.slice(0, 3) : [];
  const uiPreset = p.uiPreset || "orb";
  const stepLabel = p.stepLabel;

  const handleChoice = (choice) => {
    const c = (choice || "").toLowerCase();
    if (c.includes("chat") || c.includes("open chat")) {
      onClose?.();
      navigate("/chat");
      return;
    }
    if (c.includes("988") || c.includes("someone") || c.includes("reach out") || c.includes("call")) {
      window.open("tel:988", "_blank");
      onClose?.();
      return;
    }
    if (c.includes("breath") || c.includes("breathe")) {
      onClose?.();
      navigate("/tools/breathing");
      return;
    }
    if (c.includes("ground")) {
      onClose?.();
      navigate("/tools/grounding");
      return;
    }
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md sm:rounded-2xl rounded-t-2xl bg-slate-950/95 border border-white/10 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            {stepLabel && (
              <p className="text-xs text-white/50 uppercase tracking-wider">{stepLabel}</p>
            )}
            <h2 className="text-lg font-medium text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Visual preset */}
          {uiPreset === "stepper" ? (
            <div className={PRESETS.stepper}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-wcGold/50"
                  style={{ opacity: (payload?.level ?? 0) >= i - 1 ? 1 : 0.3 }}
                />
              ))}
            </div>
          ) : (
            <div className={PRESETS[uiPreset] || PRESETS.orb} />
          )}

          {lines.length > 0 && (
            <div className="space-y-1">
              {lines.map((line, i) => (
                <p key={i} className="text-base text-white/90 leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          )}

          {instruction && (
            <p className="text-sm text-white/70 border-l-2 border-wcGold/50 pl-3">
              {instruction}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {choices.map((choice, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleChoice(choice)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white text-sm hover:bg-white/[0.12] hover:border-wcGold/40 transition"
              >
                {choice}
              </button>
            ))}
          </div>
          {p.reasoning && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <ReasoningDisclosure reasoning={p.reasoning} defaultOpen={false} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
