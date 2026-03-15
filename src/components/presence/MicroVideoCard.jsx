import React from "react";

export default function MicroVideoCard({ video }) {
  if (!video?.src) return null;
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-sm opacity-90">{video.title || "Micro guidance"}</div>
        {!!video.durationSec && (
          <div className="text-[11px] opacity-60">{`${video.durationSec}s`}</div>
        )}
      </div>
      <video
        src={video.src}
        controls
        playsInline
        className="w-full rounded-xl border border-white/10 bg-black"
      />
    </div>
  );
}
