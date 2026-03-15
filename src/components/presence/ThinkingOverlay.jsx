import React from "react";

export default function ThinkingOverlay({ show, seconds }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[88px] z-40 flex justify-center">
      <div className="rounded-2xl border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-white/30" />
          </div>
          <div className="text-xs opacity-80">{`Thinking • ${(seconds).toFixed(1)}s`}</div>
        </div>
      </div>
    </div>
  );
}
