// src/components/hud/IntelligencePulse.jsx
// Phase 27 — Visual Expression of Intelligence
// Small floating indicator reflecting emotional intensity, drift, cluster, humanMode, riskLevel

import React, { useMemo } from "react";
import { useOSStore } from "@/stores/useOSStore";

/**
 * IntelligencePulse - Floating indicator showing system awareness
 */
export default function IntelligencePulse() {
  const { lastEmotion, lastRiskEvent, uiState, emotionalHistory } = useOSStore();

  const pulseState = useMemo(() => {
    const emotion = lastEmotion;
    const risk = lastRiskEvent;
    const humanMode = uiState?.lastHumanMode || "neutral";
    const intensity = typeof emotion?.intensity === "number" ? emotion.intensity : 0;
    const riskLevel = risk?.riskLevel || "low";

    // Compute pulse characteristics
    let pulseColor = "bg-blue-400";
    let pulseIntensity = "opacity-40";
    let pulseSpeed = "animate-pulse";

    if (riskLevel === "high" || humanMode === "risk_sensitive") {
      pulseColor = "bg-red-400";
      pulseIntensity = "opacity-80";
      pulseSpeed = "animate-[pulse-fast_1s_ease-in-out_infinite]";
    } else if (intensity >= 0.7) {
      pulseColor = "bg-amber-400";
      pulseIntensity = "opacity-60";
      pulseSpeed = "animate-[pulse-medium_1.5s_ease-in-out_infinite]";
    } else if (humanMode === "humor" || humanMode === "casual") {
      pulseColor = "bg-green-400";
      pulseIntensity = "opacity-30";
      pulseSpeed = "animate-pulse";
    } else if (humanMode === "emotional_heavy" || humanMode === "recovery_core") {
      pulseColor = "bg-purple-400";
      pulseIntensity = "opacity-50";
      pulseSpeed = "animate-pulse";
    }

    // Check drift from emotional history
    if (emotionalHistory && emotionalHistory.length >= 2) {
      const recent = emotionalHistory.slice(-3);
      const avgIntensity = recent.reduce((sum, h) => sum + (h.intensity || 0), 0) / recent.length;
      if (avgIntensity > intensity * 1.2) {
        // Rising intensity
        pulseIntensity = "opacity-70";
      }
    }

    return {
      color: pulseColor,
      intensity: pulseIntensity,
      speed: pulseSpeed,
    };
  }, [lastEmotion, lastRiskEvent, uiState, emotionalHistory]);

  // Only show if we have some signal
  if (!lastEmotion && !lastRiskEvent && (!uiState?.lastHumanMode || uiState.lastHumanMode === "neutral")) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 hidden sm:block">
      <div
        className={`h-3 w-3 rounded-full ${pulseState.color} ${pulseState.intensity} ${pulseState.speed} shadow-lg`}
        title={`System awareness: ${uiState?.lastHumanMode || "neutral"} mode`}
      />
    </div>
  );
}

