import React from "react";

export default function PresenceDock(props) {
  const {
    pending,
    onSpeakLast,
    autoSpeakEnabled,
    onToggleAutoSpeak,
    onOpenTools,
    onOpenRealHelp,
    onOpenGrounding,
    bottomOffsetPx = 0,
    dockHeightPx = 124,
  } = props;

  return (
    <div
      className="fixed inset-x-0 z-40"
      style={{
        bottom: `calc(env(safe-area-inset-bottom,0px) + ${bottomOffsetPx}px)`,
        height: dockHeightPx,
      }}
    >
      <div className="mx-auto max-w-3xl px-3 pb-3 h-full">
        <div className="h-full rounded-3xl border border-white/10 bg-black/85 backdrop-blur-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <button
              className={`flex-1 rounded-2xl px-4 py-3 text-sm bg-white/10 hover:bg-white/15 ${pending ? "opacity-40 pointer-events-none" : ""}`}
              onClick={() => onSpeakLast?.()}
            >
              Speak
            </button>

            <button className="rounded-2xl px-4 py-3 text-sm bg-transparent hover:bg-white/10" onClick={() => onOpenGrounding?.()}>
              Ground
            </button>

            <button className="rounded-2xl px-4 py-3 text-sm bg-transparent hover:bg-white/10" onClick={() => onOpenTools?.()}>
              Tools
            </button>

            <button className="rounded-2xl px-4 py-3 text-sm bg-transparent hover:bg-white/10" onClick={() => onOpenRealHelp?.()}>
              Real Help
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] opacity-70">
              {pending ? "Holding steady…" : "Present and ready."}
            </div>

            <button
              className={`rounded-xl px-3 py-2 text-[11px] ${autoSpeakEnabled ? "bg-white/10 hover:bg-white/15" : "bg-transparent hover:bg-white/10"}`}
              onClick={() => onToggleAutoSpeak?.(!autoSpeakEnabled)}
            >
              {autoSpeakEnabled ? "AutoSpeak: On" : "AutoSpeak: Off"}
            </button>
          </div>

          <button
            className="w-full rounded-2xl px-4 py-3 text-sm bg-transparent hover:bg-white/10 opacity-80"
            onMouseDown={() => {}}
            onMouseUp={() => {}}
            onTouchStart={() => {}}
            onTouchEnd={() => {}}
          >
            Hold to talk (Phase 55B)
          </button>
        </div>
      </div>
    </div>
  );
}
