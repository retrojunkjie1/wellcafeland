import React from "react";

export default function EmotionalSignalBar({ emotion, triggers, risk, identity }) {
  if (!emotion && !triggers?.length && !risk && !identity) return null;

  const emotionColor = {
    anxious: "#F59E0B",
    sad: "#3B82F6",
    angry: "#EF4444",
    numb: "#6B7280",
    ashamed: "#7C3AED",
    overwhelmed: "#EA580C",
    calm: "#10B981",
    hopeful: "#22C55E",
    neutral: "#9CA3AF",
  }[emotion?.label] || "#9CA3AF";

  return (
    <div className="mt-1 mb-1 space-y-1">
      <div className="flex items-center gap-2">
        {/* Emotion Dot */}
        {emotion && (
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: emotionColor }}
            title={`Emotion: ${emotion.label}`}
          />
        )}

        {/* Trigger Dots */}
        {triggers?.map((t, i) => (
          <div
            key={i}
            title={`Trigger: ${t}`}
            className="h-2 w-2 rounded-full bg-white/30"
          />
        ))}

        {/* Risk Marker */}
        {risk?.riskLevel === "high" && (
          <div
            title="High Risk Signal"
            className="h-0 w-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-red-500"
          />
        )}
      </div>

      {/* Phase 28: Identity fracture HUD (subtle, non-clinical) */}
      {identity && (identity.roles?.length || identity.summaryTag || typeof identity.tensionScore === "number") && (
        <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-white/50">
          {Array.isArray(identity.roles) && identity.roles.slice(0, 2).map((role, idx) => (
            <span
              key={`${role}-${idx}`}
              className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] sm:text-[11px] text-white/70"
            >
              Role pattern: {role.replace(/_/g, " ")}
            </span>
          ))}

          {typeof identity.tensionScore === "number" && (
            <span className="rounded-full bg-white/5 px-2 py-0.5">
              Identity tension:{" "}
              {identity.tensionScore >= 0.66
                ? "High"
                : identity.tensionScore >= 0.33
                ? "Medium"
                : "Low"}
            </span>
          )}

          {identity.summaryTag && (
            <span className="rounded-full bg-white/5 px-2 py-0.5">
              Story tag: {identity.summaryTag.replace(/_/g, " ")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

