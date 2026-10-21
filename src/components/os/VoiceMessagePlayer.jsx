import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const value = Math.floor(seconds);
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export default function VoiceMessagePlayer({ src, durationSeconds = 0 }) {
  const audioRef = useRef(null);
  const [state, setState] = useState("idle");
  const [duration, setDuration] = useState(Number(durationSeconds) || 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setState("idle");
    setCurrentTime(0);
    setDuration(Number(durationSeconds) || 0);
    setError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () => audioRef.current?.pause();
  }, [src, durationSeconds]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || error) return;
    setError(false);
    if (!audio.paused) {
      audio.pause();
      setState("paused");
      return;
    }
    try {
      await audio.play();
      setState("playing");
    } catch {
      setState("idle");
      setError(true);
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    try { audio.currentTime = 0; } catch {}
    setCurrentTime(0);
    setState("idle");
  };

  return (
    <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
        onPlay={() => setState("playing")}
        onEnded={() => { setState("idle"); setCurrentTime(0); }}
        onError={() => { setError(true); setState("idle"); }}
        className="sr-only"
        aria-hidden="true"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={error}
          aria-label={state === "playing" ? "Pause voice message" : state === "paused" ? "Resume voice message" : "Play voice message"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-amber-200/20 bg-amber-200/10 text-amber-100 hover:bg-amber-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 disabled:opacity-50"
        >
          {state === "playing" ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2 text-xs text-white/65">
            <span>{error ? "Recording unavailable" : state === "playing" ? "Playing" : state === "paused" ? "Paused" : "Voice message"}</span>
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Voice message progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={duration > 0 ? Math.round((currentTime / duration) * 100) : 0}>
            <div className="h-full rounded-full bg-amber-200 transition-[width]" style={{ width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` }} />
          </div>
        </div>
        {(state !== "idle" || currentTime > 0) && (
          <button type="button" onClick={stop} aria-label="Stop voice message" title="Stop voice message" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/65 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-amber-100/85" role="status">This recording could not be played. You can still read the transcript above.</p>}
    </div>
  );
}
