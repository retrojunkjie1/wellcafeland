import React from "react";
import { useOSStore } from "../../stores/useOSStore";

export default function ProviderMonitorStrip() {
  const lastEmotion = useOSStore((s) => s.lastEmotion);
  const lastRiskEvent = useOSStore((s) => s.lastRiskEvent);

  if (!lastEmotion && !lastRiskEvent) return null;

  return (
    <div className="
      fixed top-3 right-3 z-[50] 
      bg-black/60 backdrop-blur-xl 
      border border-white/10 
      rounded-xl px-4 py-2 
      shadow-lg text-[11px] 
      text-white/80
    ">
      <div className="flex flex-col gap-1">
        {lastEmotion && (
          <div>
            <strong className="text-white">Emotion:</strong> {lastEmotion.label}
          </div>
        )}

        {lastRiskEvent && (
          <div>
            <strong className="text-white">Risk:</strong> {lastRiskEvent.riskLevel}
            <br />
            <span className="text-white/60">
              {lastRiskEvent.reasons?.join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

