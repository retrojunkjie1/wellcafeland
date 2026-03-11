import React from "react";

export default function ComposerPresenceControls({pending, onSpeakLast, autoSpeakEnabled, onToggleAutoSpeak}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className={`rounded-xl px-3 py-2 text-xs bg-white/5 hover:bg-white/10 ${pending ? "opacity-40 pointer-events-none" : ""}`}
        onClick={() => onSpeakLast?.()}
        title="Speak last response"
      >
        Speak
      </button>

      <button
        className={`rounded-xl px-3 py-2 text-xs ${autoSpeakEnabled ? "bg-white/10 hover:bg-white/15" : "bg-transparent hover:bg-white/10"}`}
        onClick={() => onToggleAutoSpeak?.(!autoSpeakEnabled)}
        title="AutoSpeak"
      >
        {autoSpeakEnabled ? "Auto: On" : "Auto: Off"}
      </button>
    </div>
  );
}
