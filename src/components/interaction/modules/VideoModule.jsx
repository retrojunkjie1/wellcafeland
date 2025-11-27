// src/components/interaction/modules/VideoModule.jsx
// Injected video blocks in chat

import React, { useState } from "react";
import { Play, Pause, X, Check, XCircle } from "lucide-react";

const VideoModule = ({ module }) => {
  const { videoUrl, title, description, thumbnail } = module.payload;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHelpful, setIsHelpful] = useState(null);

  return (
    <div className="animate-slide-up">
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* Video Player */}
        <div className="relative aspect-video bg-slate-900">
          {thumbnail && !isPlaying ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnail})` }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="rounded-full bg-wcGold/90 p-4 text-slate-900 transition hover:bg-wcGold"
                >
                  <Play className="h-8 w-8" />
                </button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full h-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-center text-white/60">
                  <p className="text-sm">Video placeholder</p>
                  <p className="text-xs mt-2">{title || "Video content"}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-3">
          {title && (
            <h3 className="text-sm font-medium text-white">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-white/70 leading-relaxed">
              {description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsHelpful(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                isHelpful === true
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              Helpful
            </button>
            <button
              type="button"
              onClick={() => setIsHelpful(false)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                isHelpful === false
                  ? "bg-red-500/20 text-red-400 border border-red-400/40"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              <XCircle className="h-3.5 w-3.5" />
              Not helpful
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModule;

