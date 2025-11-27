import React from "react";

export default function EmotionalSignalBar({ emotion, triggers, risk }) {
  if (!emotion && !triggers?.length && !risk) return null;

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
    <div className="flex items-center gap-2 mt-1 mb-1">
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
          className="h-0 w-0 border-l-[4px] border-r-[4px] border-b-[6px] 
                     border-transparent border-b-red-500"
        />
      )}
    </div>
  );
}

