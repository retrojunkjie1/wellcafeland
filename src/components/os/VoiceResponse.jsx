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
  const utteranceRef = useRef(null);
  const generatedUrlRef = useRef(null);
  const playRequestRef = useRef(0);
  const speechText = formatForSpeech(text);
  const hasAudio = Boolean(providedAudioUrl || speechText);

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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
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
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (generatedUrlRef.current) URL.revokeObjectURL(generatedUrlRef.current);
  }, []);

  const playInBrowser = (spokenText) => {
    if (!window.speechSynthesis || !spokenText) {
      setError("Audio playback is not available in this browser.");
      setStatus("idle");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => /Samantha|Ava|Serena|Karen/i.test(voice.name))
      || voices.find((voice) => voice.lang?.toLowerCase().startsWith("en-us"));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setStatus("playing");
    utterance.onend = () => { utteranceRef.current = null; setStatus("idle"); };
    utterance.onerror = () => { utteranceRef.current = null; setStatus("idle"); };
    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const start = async () => {
    setError("");
    setProgress(0);
    const requestId = ++playRequestRef.current;
    if (providedAudioUrl) {
      const audio = new Audio(providedAudioUrl);
      audioRef.current = audio;
      audio.onended = () => { audioRef.current = null; setStatus("idle"); setProgress(0); };
      audio.ontimeupdate = () => {
        if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
      };
      audio.onerror = () => { audioRef.current = null; setStatus("idle"); setError("This audio could not be played."); };
      try { await audio.play(); setStatus("playing"); }
      catch { audioRef.current = null; setStatus("idle"); setError("Tap listen again to start audio playback."); }
      return;
    }

    setStatus("loading");
    try {
      const result = await speakText(speechText.slice(0, 4096), { voice: "coral" });
      if (requestId !== playRequestRef.current) {
        if (result.audioUrl?.startsWith("blob:")) URL.revokeObjectURL(result.audioUrl);
        return;
      }
      if (result.ok && result.audioUrl) {
        releaseGeneratedUrl();
        generatedUrlRef.current = result.audioUrl;
        const audio = new Audio(result.audioUrl);
        audioRef.current = audio;
        audio.onended = () => { audioRef.current = null; releaseGeneratedUrl(); setStatus("idle"); setProgress(0); };
        audio.ontimeupdate = () => {
          if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
        };
        audio.onerror = () => {
          audioRef.current = null;
          releaseGeneratedUrl();
          playInBrowser(speechText);
        };
        await audio.play();
        setStatus("playing");
      } else {
        playInBrowser(speechText);
      }
    } catch {
      if (requestId === playRequestRef.current) playInBrowser(speechText);
    }
  };

  const togglePlayback = async () => {
    if (status === "loading") return;
    if (status === "playing") {
      if (audioRef.current) audioRef.current.pause();
      else if (window.speechSynthesis?.speaking) window.speechSynthesis.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      if (audioRef.current) {
        try { await audioRef.current.play(); setStatus("playing"); }
        catch { setStatus("idle"); setError("Audio could not resume. Please try again."); }
      } else if (utteranceRef.current && window.speechSynthesis) {
        window.speechSynthesis.resume();
        setStatus("playing");
      } else {
        await start();
      }
      return;
    }
    await start();
  };

  if (!hasAudio) return null;

  const statusLabel = status === "loading" ? "Preparing your voice response" :
    status === "playing" ? "Now playing" : status === "paused" ? "Paused" : "Listen when you’re ready";

  return (
    <div className="my-3 w-full max-w-sm" aria-label="Voice response player">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.035] px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={status === "loading"}
          aria-label={status === "playing" ? "Pause voice response" : status === "paused" ? "Resume voice response" : "Listen to voice response"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-emerald-200/20 bg-emerald-200/10 text-emerald-100 transition hover:bg-emerald-200/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/70 disabled:opacity-60"
        >
          {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> :
            status === "playing" ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/80">
              {status === "playing" ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> : <Headphones className="h-3 w-3 text-emerald-200/80" />}
              {statusLabel}
            </span>
            <span className="text-[10px] text-white/40">{speechLength(speechText)}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Voice playback progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full bg-gradient-to-r from-emerald-200/70 to-teal-100 transition-[width] duration-300 ${status === "playing" && progress === 0 ? "w-1/4 animate-pulse" : ""}`} style={progress > 0 ? { width: `${progress}%` } : undefined} />
          </div>
        </div>
        {(status === "playing" || status === "paused" || status === "loading") && (
          <button type="button" onClick={stop} aria-label="Stop voice response" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <Square className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 pl-2 text-xs text-amber-200/80" role="status">{error}</p>}
    </div>
  );
}
