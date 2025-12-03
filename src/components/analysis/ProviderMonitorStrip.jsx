import React from "react";
import { useNavigate } from "react-router-dom";
import { useOSStore } from "../../stores/useOSStore";

export default function ProviderMonitorStrip() {
  const navigate = useNavigate();
  const lastEmotion = useOSStore((s) => s.lastEmotion);
  const lastRiskEvent = useOSStore((s) => s.lastRiskEvent);

  if (!lastEmotion && !lastRiskEvent) return null;

  const handleClick = () => {
    navigate("/dashboard");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        fixed top-3 right-3 z-[50] 
        bg-black/60 backdrop-blur-xl 
        border border-white/10 
        rounded-xl px-4 py-2 
        shadow-lg text-[11px] 
        text-white/80
        hover:bg-black/80 hover:border-white/20
        transition-all cursor-pointer
      "
    >
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
    </button>
  );
}

