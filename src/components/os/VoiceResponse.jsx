import React, { useEffect, useRef, useState } from "react";
import { Headphones, LoaderCircle, Pause, Play, Square } from "lucide-react";
import { speakText } from "@/services/multimodalClient";

function formatForSpeech(value = "") {
  return String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function speechLength(text) {
  if (!text) return "";
  const minutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 145));
  return `About ${minutes} min`;
}

export default function VoiceResponse({ text = "", audioUrl: providedAudioUrl }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const generatedUrlRef = useRef(null);
  const playRequestRef = useRef(0);
  const speechText = formatForSpeech(text);
  const hasAudioOption = Boolean(providedAudioUrl || speechText);

  const releaseGeneratedUrl = () => {
    if (generatedUrlRef.current) {
      URL.revokeObjectURL(generatedUrlRef.current);
      generatedUrlRef.current = null;
    }
  };

  const stop = () => {
    playRequestRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
    releaseGeneratedUrl();
    setStatus("idle");
    setProgress(0);
  };

  useEffect(() => () => {
    playRequestRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    if (generatedUrlRef.current) URL.revokeObjectURL(generatedUrlRef.current);
  }, []);

  const attachAudio = async (url, generated = false) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      audioRef.current = null;
      if (generated) releaseGeneratedUrl();
      setStatus("idle");
      setProgress(0);
    };
    audio.ontimeupdate = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.onerror = () => {
      audioRef.current = null;
      if (generated) releaseGeneratedUrl();
      setStatus("idle");
      setProgress(0);
      setError("Audio couldn't be played. You can still read the response above.");
    };
    await audio.play();
    setStatus("playing");
  };

  const start = async () => {
    setError("");
    setProgress(0);
    const requestId = ++playRequestRef.current;
    if (providedAudioUrl) {
      try {
        await attachAudio(providedAudioUrl);
      } catch {
        setStatus("idle");
        setError("Audio couldn't be played. You can still read the response above.");
      }
      return;
    }

    setStatus("loading");
    try {
      const result = await speakText(speechText.slice(0, 4096), { voice: "coral" });
      if (requestId !== playRequestRef.current) {
        if (result.audioUrl?.startsWith("blob:")) URL.revokeObjectURL(result.audioUrl);
        return;
      }
      if (!result.ok || !result.audioUrl) {
        setStatus("idle");
        setError("Audio couldn't be prepared. You can still read the response above.");
        return;
      }
      releaseGeneratedUrl();
      generatedUrlRef.current = result.audioUrl;
      try {
        await attachAudio(result.audioUrl, true);
      } catch {
        releaseGeneratedUrl();
        setStatus("idle");
        setError("Audio couldn't be played. You can still read the response above.");
      }
    } catch {
      if (requestId === playRequestRef.current) {
        setStatus("idle");
        setError("Audio couldn't be prepared. You can still read the response above.");
      }
    }
  };

  const togglePlayback = async () => {
    if (status === "loading") return;
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("paused");
    } else if (status === "paused" && audioRef.current) {
      try {
        await audioRef.current.play();
        setStatus("playing");
      } catch {
        setStatus("idle");
        setError("Audio couldn't resume. You can still read the response above.");
      }
    } else {
      await start();
    }
  };

  if (!hasAudioOption) return null;

  const statusLabel = status === "loading" ? "Preparing audio" :
    status === "playing" ? "Now playing" : status === "paused" ? "Paused" : "Play this response";

  return (
    <div className="my-3 w-full max-w-sm" aria-label="Voice response player">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.035] px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={status === "loading"}
          aria-label={status === "playing" ? "Pause voice response" : status === "paused" ? "Resume voice response" : "Play voice response"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/10 text-emerald-100 transition hover:bg-emerald-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 disabled:opacity-60"
        >
          {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> :
            status === "playing" ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80">
              {status === "playing" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> : <Headphones className="h-3 w-3 text-emerald-200/80" />}
              {statusLabel}
            </span>
            <span className="text-[10px] text-white/50">{speechLength(speechText)}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Voice playback progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-200/70 to-teal-100 transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {(status === "playing" || status === "paused" || status === "loading") && (
          <button type="button" onClick={stop} aria-label="Stop voice response" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 pl-2 text-xs text-amber-200/90" role="status">{error}</p>}
    </div>
  );
}
