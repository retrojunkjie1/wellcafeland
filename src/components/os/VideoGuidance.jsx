// src/components/os/VideoGuidance.jsx
// Video guidance player for breathing, grounding, yoga, etc.

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, X, Maximize2, Minimize2 } from "lucide-react";

// Fallback video URLs for different practices
// These are sample videos used when no specific video URL is provided
const FALLBACK_VIDEOS = {
  breathing: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  grounding: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  yoga: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  stretch: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  exercise: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
};

const VideoGuidance = ({ videoUrl, title = "Guided Practice", onClose, mode }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);

  // Use provided URL or fallback based on mode
  const finalVideoUrl = videoUrl || (mode ? FALLBACK_VIDEOS[mode] : null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleError = () => {
      setError("Failed to load video");
      setIsPlaying(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      
      // Phase 14: Cleanup blob URLs
      if (finalVideoUrl && finalVideoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(finalVideoUrl);
      }
    };
  }, [finalVideoUrl]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        console.error("Play failed:", err);
        setError("Failed to play video");
      });
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!finalVideoUrl) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm sm:text-base text-white/60">Nothing here yet</p>
        <p className="text-xs sm:text-sm text-white/50 mt-2">Video guidance will appear when available</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-white/10 bg-white/5 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-white/10">
        <h3 className="text-xs sm:text-sm font-medium text-white truncate flex-1 min-w-0 mr-2">{title}</h3>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleFullscreen}
            className="rounded p-1 sm:p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
            title="Fullscreen"
          >
            <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 sm:p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition"
              title="Close"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <div className="relative bg-black w-full">
        <video
          ref={videoRef}
          src={finalVideoUrl}
          className="w-full h-auto max-w-full rounded-xl aspect-video"
          playsInline
        />
        
        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button
            type="button"
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
          >
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Play className="h-8 w-8 text-white" />
            </div>
          </button>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-sm text-white/80">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2">
        {/* Progress Bar */}
        <div
          className="h-1 sm:h-1.5 rounded-full bg-white/10 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-wcGold/60 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePlayPause}
              className="rounded-lg p-1.5 sm:p-2 bg-white/10 text-white hover:bg-white/20 transition"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </button>
            <span className="text-xs text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGuidance;
