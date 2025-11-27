// src/components/analysis/EmotionalTimelinePanel.jsx
// Responsive emotional timeline for a single client

import React from "react";

/**
 * Responsive emotional timeline for a single client.
 * Expects an array of events with:
 * { id, createdAt, riskLevel, emotion, domains, reasons }
 */
export default function EmotionalTimelinePanel({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/50">
        No emotional telemetry recorded yet.
      </div>
    );
  }

  const riskColor = (riskLevel) => {
    switch (riskLevel) {
      case "high":
        return "#EF4444";
      case "moderate":
        return "#F97316";
      default:
        return "#22C55E";
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-black/40 px-4 py-3 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
          Emotional Timeline
        </h3>
        <span className="text-[10px] text-white/40">
          Last {events.length} signals
        </span>
      </div>

      {/* Desktop / tablet – horizontal timeline */}
      <div className="hidden w-full gap-3 md:flex">
        <div className="relative mt-3 flex w-full items-center justify-between">
          {/* Baseline line */}
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />

          {events.map((ev, index) => {
            const ts =
              typeof ev.createdAt === "number"
                ? new Date(ev.createdAt)
                : new Date(ev.createdAt || Date.now());

            const label =
              ts.toLocaleDateString?.() + " " + ts.toLocaleTimeString?.([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={ev.id || index}
                className="relative flex flex-col items-center"
                style={{ minWidth: `${100 / events.length}%` }}
              >
                <div
                  className="z-10 h-3 w-3 rounded-full border border-black/50 shadow-md"
                  style={{ backgroundColor: riskColor(ev.riskLevel) }}
                  title={label}
                />
                <div className="mt-2 text-[10px] text-white/60">
                  {ev.emotion?.label || "—"}
                </div>
                {ev.domains?.length > 0 && (
                  <div className="mt-0.5 max-w-[80px] truncate text-[9px] text-white/40">
                    {ev.domains.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile – stacked list */}
      <div className="flex flex-col gap-2 md:hidden">
        {events.map((ev, index) => {
          const ts =
            typeof ev.createdAt === "number"
              ? new Date(ev.createdAt)
              : new Date(ev.createdAt || Date.now());

          const label =
            ts.toLocaleDateString?.() + " " + ts.toLocaleTimeString?.([], { hour: "2-digit", minute: "2-digit" });

          return (
            <div
              key={ev.id || index}
              className="flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2"
            >
              <div
                className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border border-black/50"
                style={{ backgroundColor: riskColor(ev.riskLevel) }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-white">
                    {ev.emotion?.label || "No label"}
                  </span>
                  <span className="text-[9px] text-white/40">{label}</span>
                </div>
                {ev.domains?.length > 0 && (
                  <div className="mt-0.5 text-[10px] text-white/60">
                    Triggers: {ev.domains.join(", ")}
                  </div>
                )}
                {ev.reasons?.length > 0 && (
                  <div className="mt-0.5 text-[10px] text-white/40">
                    {ev.reasons.join("; ")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

